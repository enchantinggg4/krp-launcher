import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import React, {useEffect, useState} from 'react'
import { CharacterPreview } from '../../components/CharacterPreview'
import NewsBlock from "../../components/NewsBlock";
import {UPDATER_URL} from "../../config";

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

interface New {
  title: string;
  content: string;
  image: string;
  id: string;
}

export default observer(() => {
  const [news, setNews] = useState<New[]>([]);
  useEffect(() => {
    fetch(`${UPDATER_URL}/auth/news`).then(it => it.json()).then(n => {
      setNews(n)
    }).catch()
  }, []);
  return (
    <MainPageContainer>
      <News>
        {news.map(it => <NewsBlock key={it.id} content={it.content} title={it.title} image={it.image} />)}
      </News>
      <CharacterWrapper>
        <CharacterPreview />
      </CharacterWrapper>
    </MainPageContainer>
  )
})
