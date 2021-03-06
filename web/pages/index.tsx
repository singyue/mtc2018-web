import * as React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Default from '../layout/Default';
import Header from '../containers/Top/Header';
import MainVisual from '../containers/Top/MainVisual';
import NewsSection from '../containers/Top/NewsSection';
import AboutSection from '../containers/Top/AboutSection';
import ContentSection from '../containers/Top/ContentSection';
import TimetableSection from '../containers/Top/TimetableSection';
import AccessSection from '../containers/Top/AccessSection';
import { withI18next } from '../lib/with-i18next';
import { Query } from 'react-apollo';
import { AllSessions } from '../graphql/generated/AllSessions';
import { SESSIONS_QUERY } from '../graphql/query';

class AllSessionsQuery extends Query<AllSessions> {}

interface State {
  isTopY: boolean;
}

class Top extends React.Component<{}, State> {
  public state = {
    isTopY: false
  };

  public componentDidMount() {
    this.updateHeaderState();
    window.addEventListener('scroll', this.onScroll);
  }

  public componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  public render() {
    const { isTopY } = this.state;
    return (
      <Default>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-125147977-1', 'auto');
            ga('send', 'pageview');
          `
            }}
          />
          <title>Mercari Tech Conf 2018</title>
        </Head>
        <StyledHeader isTopY={isTopY} />
        <MainVisual />
        <Body>
          <NewsSection />
          <AboutSection />
          <AllSessionsQuery query={SESSIONS_QUERY}>
            {({ loading, error, data }) => {
              if (error) {
                return null;
              }
              if (loading || !data) {
                return null;
              }

              return (
                <>
                  <ContentSection sessions={data.sessionList} />
                  <StyledTimetableSection sessions={data.sessionList} />
                </>
              );
            }}
          </AllSessionsQuery>
          <AccessSection />
        </Body>
      </Default>
    );
  }

  private onScroll = () => {
    this.updateHeaderState();
  };

  private updateHeaderState = () => {
    const scrollY = window.scrollY;
    const windowH = 300;
    let overScroll = false;

    // 100vh以上スクロールしていたら
    // Headerの背景を変更
    if (windowH > scrollY) {
      overScroll = true;
    }

    // 現状のステートと差分があれば更新
    if (this.state.isTopY === overScroll) {
      this.setState({ isTopY: !overScroll });
    }
  };
}

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
`;

const Body = styled.div`
  width: 100%;
  padding: 32px 64px 64px;
  box-sizing: border-box;

  > * {
    margin-bottom: 160px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  @media screen and (max-width: 767px) {
    padding: 32px 8px;

    > * {
      margin-bottom: 80px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

const StyledTimetableSection = styled(TimetableSection)`
  @media screen and (max-width: 767px) {
    display: none;
  }
`;

export default withI18next()(Top);
