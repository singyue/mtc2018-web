import * as React from 'react';
import styled from 'styled-components';
import { colors, getTextStyle } from '../../../components/styles';

interface Props {
  showBg: boolean;
}

const HeaderPC: React.SFC<Props> = ({ showBg, ...props }) => (
  <Wrapper showBg={showBg} {...props}>
    <Logo />
    <EmptySpace />
    <Nav>
      <NavButton href="#news">NEWS</NavButton>
      <NavButton href="#about">ABOUT</NavButton>
      <NavButton href="#contents">CONTENTS</NavButton>
      <NavButton href="#access">ACCESS</NavButton>
      <SNS>
        <CircleIcon>
          <img src="../../../static/images/twitter.svg" alt="twitter" />
        </CircleIcon>
        <CircleIcon>
          <img src="../../../static/images/facebook.svg" alt="twitter" />
        </CircleIcon>
      </SNS>
    </Nav>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  color: ${colors.yuki};
  padding: 0 40px;
  box-sizing: border-box;
  transition: 300ms;
  z-index: 50;
  background-color: ${(props: { showBg: boolean }) =>
    props.showBg ? 'rgba(18, 28, 59, 0.8)' : 'transparent'};
`;

const Logo = styled.img.attrs({
  src: '../../static/images/header_logo.svg'
})``;

const EmptySpace = styled.div`
  flex-grow: 1;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
`;

const NavButton = styled.a`
  ${getTextStyle('display1')};
  margin-left: 24px;
  text-decoration: none;
  color: ${colors.yuki};
  line-height: 36px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    display: inline-block;
    width: 0%;
    height: 1px;
    transform: translateX(-50%);
    background-color: ${colors.yuki};
    transition-duration: 300ms;
  }

  &:hover {
    &:before {
      width: 70%;
    }
  }
`;

const SNS = styled.div`
  margin-left: 40px;
`;

const CircleIcon = styled.a`
  width: 40px;
  height: 40px;
  background-color: transparent;
  box-sizing: border-box;
  margin-left: 20px;
  cursor: pointer;

  &:first-child {
    margin-left: 0;
  }
`;

export default HeaderPC;