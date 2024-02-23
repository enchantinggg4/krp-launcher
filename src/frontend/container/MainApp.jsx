import React from 'react';


import { PlayButton } from './PlayButton.jsx';
import { useEvent, useEventCallback } from '../hooks.js';
import styled from 'styled-components';
import { Loading } from './Loading.jsx';
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { GlobalStyle } from '../GlobalStyle.js';
import { electronProxy } from '../ipc.js';
import AuthDialog from '../modal/AuthDialog.jsx';
import { observer } from 'mobx-react-lite';
import store from '../store.js';
import { CharacterPreview } from './CharacterPreview.jsx';
import useSWR from 'swr';
import NewsBlock from '../component/NewsBlock.jsx';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-height: 100vh;
  overflow: hidden;
`

const BackgroundImage = styled.div`
  z-index: -1;
  background-image: url('/static/splash.png');
  background-size: cover;
  opacity: 0.4;
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`

const MainContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: row;
`

const Version = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  color: #ddd;
  padding: 4px;
`

const OnlineStatus = styled.div`
  position: absolute;
  top: 60px;
  right: 10px;
  color: #ddd;
  padding: 4px;
  font-size: 16px;
`

const UpdateStatus = styled.div`
  position: absolute;
  top: 70px;
  right: 10px;
  color: #ddd;
  padding: 4px;
  font-size: 16px;
`

const BottomRow = styled.div`
  height: 70px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
`
const Spacer = styled.div`
  flex: 1;
`

const LogFile = styled.div`
  color: #ddd;
  padding: 4px;
  cursor: pointer;
`

const DiscordIcon = styled.div`
  opacity: 0.5;
  transition: 0.3s ease;

  &:hover {
    opacity: 1;
  }
  background-image: url('https://cdn.discordapp.com/attachments/983849193376465006/1193216940412518521/discord-mascot.png?ex=65abe8df&is=659973df&hm=55d5c657af10e6cb6570ba7b023b50d7467dcbb4aaa8423aaaf12e12a8efa3a1&');
  background-size: contain;
  width: 40px;
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
`

const FolderIcon = styled.div`
  opacity: 0.5;
  transition: 0.3s ease;

  &:hover {
    opacity: 1;
  }
  background-image: url('https://cdn.discordapp.com/attachments/983849193376465006/1193217540177006693/folder-flat.png?ex=65abe96e&is=6599746e&hm=41becf738291e63180bd0b0af67182c635144e19dcaca282bbab0f03316e2f5d&');
  background-size: contain;
  width: 40px;
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
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

export const MainApp = observer(({ children }) => {
  const config = useEvent('update_config', {});
  const version = useEvent('version', '');
  // const showPlayButton = config.rulesAccepted == false


  const { data } = useSWR('/auth/news')

  const news = data || []

  useEventCallback('update_available', () => NotificationManager.info("Доступно обновление, скачиваю...",))
  useEventCallback('update_downloaded', () => NotificationManager.success("Перезапусти лаунчер.", "Обновление скачено!",))


  if (store.isInitialLoading)
    return null;

  const showPlayButton = store.token;

  return (
    <Container>
      <GlobalStyle />
      <NotificationContainer />
      <BackgroundImage />
      <Version>{version}</Version>
      <OnlineStatus>
        {store.pinginfo && <>Онлайн: {store.pinginfo.online} / {store.pinginfo.max}</> || <>Пингую сервер...</>}
      </OnlineStatus>
      <MainContent>
        <News>
          {(news).map(it => <NewsBlock key={it.id} {...it} />)}
        </News>
        <CharacterPreview />
      </MainContent>


      {!store.token && <AuthDialog />}

      <BottomRow>
        <LogFile onClick={() => electronProxy.showLogFile()}>Лог</LogFile>
        {showPlayButton && <PlayButton />}

        <Spacer />
        <DiscordIcon
          onClick={() => {
            electronProxy.openLink('https://discord.gg/3DmvqWHGqU')
          }}
        />
        <FolderIcon
          onClick={() => electronProxy.showGameFolder()}
        />
      </BottomRow>

    </Container>
  )
})
