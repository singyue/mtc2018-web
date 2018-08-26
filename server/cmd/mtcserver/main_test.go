package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/ext"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/mocktracer"
)

func TestRunServer_StopCancel(t *testing.T) {
	port := 10001

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resCh := make(chan error, 1)
	go func() {
		resCh <- runServer(ctx, port, zap.NewNop())
	}()

	time.Sleep(100 * time.Millisecond)

	url := fmt.Sprintf("http://localhost:%d/", port)
	res, err := http.Get(url)
	require.NoError(t, err)
	res.Body.Close()

	cancel()

	timer := time.NewTimer(time.Second)
	defer timer.Stop()

	select {
	case <-timer.C:
		t.Fatalf("timeout")
	case err := <-resCh:
		require.NoError(t, err, "must not return error")
	}
}

func TestRunServer_StopError(t *testing.T) {
	port := -1

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resCh := make(chan error, 1)
	go func() {
		resCh <- runServer(ctx, port, zap.NewNop())
	}()

	select {
	case <-ctx.Done():
		t.Fatalf("timeout")
	case err := <-resCh:
		require.Error(t, err, "must return error")
	}
}

func TestRunserver_Trace(t *testing.T) {
	mt := mocktracer.Start()
	defer mt.Stop()

	port := 10000
	logger := zap.NewNop()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go runServer(ctx, port, logger)

	time.Sleep(100 * time.Millisecond)

	t.Run("Success", func(t *testing.T) {
		url := fmt.Sprintf("http://localhost:%d/", port)
		res, err := http.Get(url)
		require.NoError(t, err)
		defer res.Body.Close()

		assert.Equal(t, 200, res.StatusCode)
		b, err := ioutil.ReadAll(res.Body)
		require.NoError(t, err)
		assert.Equal(t, "Hello, 世界", string(b))

		spans := mt.FinishedSpans()
		require.Equal(t, 1, len(spans))

		s := spans[0]
		assert.Equal(t, "http.request", s.OperationName())
		assert.Equal(t, "mtc2018", s.Tag(ext.ServiceName))
		assert.Equal(t, "GET /", s.Tag(ext.ResourceName))
		assert.Equal(t, "200", s.Tag(ext.HTTPCode))
		assert.Equal(t, "GET", s.Tag(ext.HTTPMethod))
		assert.Equal(t, "/", s.Tag(ext.HTTPURL))
		assert.Equal(t, nil, s.Tag(ext.Error))
	})
}
