import * as React from 'react';
import styled from 'styled-components';
import { Text } from '../../../components';
import { getTextStyle, borderRadius } from '../../../components/styles';
import { SpeakerFragment } from '../../../graphql/generated/SpeakerFragment';

interface Props {
  speaker: SpeakerFragment;
  isJa: boolean;
}

const ContentCardSpeaker: React.SFC<Props> = ({ speaker, isJa, ...props }) => (
  <Wrapper {...props}>
    <Photo src={`/static/images/speakers/${speaker.speakerId}.png`} />
    <Profile>
      <Header>
        <div>
          <Name>{isJa ? speaker.nameJa : speaker.name}</Name>
          <Text level="body">
            {isJa ? speaker.positionJa : speaker.position}
          </Text>
        </div>
      </Header>
      <Body>{isJa ? speaker.profileJa : speaker.profile}</Body>
    </Profile>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  width: 100%;

  @media screen and (max-width: 767px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Photo = styled.img`
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  border-radius: ${borderRadius.level1};
  margin-right: 40px;

  @media screen and (max-width: 767px) {
    width: 40vw;
    height: 40vw;
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const Profile = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 16px;
  width: 100%;
  position: relative;

  @media screen and (max-width: 767px) {
    margin-bottom: 0;
  }
`;

const Name = styled(Text).attrs({
  level: 'display2'
})`
  margin-bottom: 4px;
`;

const Body = styled(Text)`
  ${getTextStyle('body')};
`;

export default ContentCardSpeaker;
