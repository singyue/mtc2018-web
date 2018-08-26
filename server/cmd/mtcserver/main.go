package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/mercari/mtc2018-web/server/config"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"golang.org/x/sync/errgroup"
	ddnethttp "gopkg.in/DataDog/dd-trace-go.v1/contrib/net/http"
	ddtracer "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

// newLogger creates a new zap logger with the given log level.
func newLogger(level string) (*zap.Logger, error) {
	level = strings.ToUpper(level)
	var l zapcore.Level
	switch level {
	case "DEBUG":
		l = zapcore.DebugLevel
	case "INFO":
		l = zapcore.InfoLevel
	case "ERROR":
		l = zapcore.ErrorLevel
	default:
		return nil, errors.Errorf("invalid loglevel: %s", level)
	}

	config := zap.NewProductionConfig()
	config.Level = zap.NewAtomicLevelAt(l)
	config.DisableStacktrace = true
	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}
	return config.Build()
}

func main() {
	// Read configurations from environmental variables.
	env, err := config.ReadFromEnv()
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] Failed to read env vars: %s\n", err)
		os.Exit(1)
	}

	// Setup new zap logger. This logger should be used for all logging in this service.
	// The log level can be updated via environment variables.
	logger, err := newLogger(env.LogLevel)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] Failed to setup logger: %s\n", err)
		os.Exit(1)
	}

	// Start DataDog trace client for sending tracing information(APM).
	ddtracer.Start(
		ddtracer.WithAgentAddr(fmt.Sprintf("%s:8126", env.DDAgentHostname)),
		ddtracer.WithServiceName(config.ServiceName),
		ddtracer.WithGlobalTag("env", env.Env),
	)
	defer ddtracer.Stop()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	wg, ctx := errgroup.WithContext(ctx)
	wg.Go(func() error { return runServer(ctx, env.Port, logger) })

	// Waiting for SIGTERM or Interrupt signal. If server receives them,
	// http server will shutdown gracefully.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGTERM, syscall.SIGKILL, os.Interrupt)
	select {
	case <-sigCh:
		logger.Info("received SIGTERM, exiting server gracefully")
	case <-ctx.Done():
	}

	cancel()
	if err := wg.Wait(); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] Unhandled error received: %s\n", err)
		os.Exit(1)
	}
}

func runServer(ctx context.Context, port int, logger *zap.Logger) error {
	mux := ddnethttp.NewServeMux(ddnethttp.WithServiceName(config.ServiceName))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, 世界"))
	})

	// for kubernetes readiness probe
	mux.HandleFunc("/healthz/readiness", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// for kubernetes liveness probe
	mux.HandleFunc("/healthz/liveness", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	logger.Info("start http server")
	srv := &http.Server{Addr: fmt.Sprintf(":%d", port), Handler: mux}

	errCh := make(chan error, 1)
	go func() {
		errCh <- srv.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return err
	}

	return nil
}
