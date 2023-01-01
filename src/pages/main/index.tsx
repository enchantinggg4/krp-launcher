import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { CharacterPreview } from '../../components/CharacterPreview'
import NewsBlock from "../../components/NewsBlock";

const MainPageContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px 20px;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
`

const News = styled.div`
  flex: 1;
  padding-left: 10px;
  padding-right: 10px;
  overflow-y: auto;
  
  // scrollbar-color: rebeccapurple green;
  // scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 12px;               /* width of the entire scrollbar */
  }
  
  &::-webkit-scrollbar-track {
    // background: orange;        /* color of the tracking area */
    background: rgba(0, 0, 0, 0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    // background-color: blue;    /* color of the scroll thumb */
    // border-radius: 20px;       /* roundness of the scroll thumb */
    // border: 3px solid orange;  /* creates padding around scroll thumb */
  }
  
`
const Dynmap = styled.iframe`
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
`
// <Dynmap src="http://45.141.184.241:8123/" />

const CharacterWrapper = styled.div`
  margin-top: 100px;
`

export default observer(() => {
  return (
    <MainPageContainer>
      <News>
        <NewsBlock
          title={'Я пукнул!'}
          image={'https://media.discordapp.net/attachments/930178487778693163/1058102124803788961/image.png'}
          content={`В мире Kingdom RPG поселились новые долгожданные существа, драконы.
Драконы бывают двух типов - малые и великие.
Великий дракон только один и он живет в центре карты на обсидиановом острове
Малые драконы будут иногда нападать на поселения игроков, сжигая и уничтожая все на своем пути. 
Всем известно, что драконы любят блестящие вещи, поэтому за убийство малого дракона вам может выпасть золото или артефакты, которые нельзя скрафтить. 
P.S. Драконы очень сильные.`}
        />
      </News>
      <CharacterWrapper>
        <CharacterPreview />
      </CharacterWrapper>
    </MainPageContainer>
  )
})
