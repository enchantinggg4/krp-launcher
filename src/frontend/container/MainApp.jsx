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

export const CDN_URL = 'http://188.68.222.85'

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
  //background-image: url('https://cdn.discordapp.com/attachments/800081672813019196/938170343552581735/unknown.png');
  background-image: url('https://cdn.discordapp.com/attachments/930178487778693163/1057800413824434176/3ebc88985701fafc.png');
  background-size: cover;
  opacity: 0.1;
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
  top: 40px;
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
  background-image: url('${CDN_URL}/discord.svg');
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
  background-image: url('${CDN_URL}/folder.png');
  background-size: contain;
  width: 40px;
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
`

const SettingsButton = styled.div`
  opacity: 0.5;
  transition: 0.3s ease;

  &:hover {
    opacity: 1;
  }
  background-image: url('https://cdn-icons-png.flaticon.com/512/3953/3953226.png');
  background-size: contain;
  width: 40px;
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
`

export const MainApp = observer(({ children }) => {
  const config = useEvent('update_config', {});
  const version = useEvent('version', '');
  // const showPlayButton = config.rulesAccepted == false

  useEventCallback('update_available', () => NotificationManager.info("Доступно обновление, скачиваю...",))
  useEventCallback('update_downloaded', () => NotificationManager.success("Перезапусти лаунчер.", "Обновление скачено!",))


  const showPlayButton = store.token;

  return (
    <Container>
      <GlobalStyle />
      <NotificationContainer />
      <BackgroundImage />
      <Version>{version}</Version>
      {/* <OnlineStatus>
                Онлайн: 111/111
            </OnlineStatus> */}
      <MainContent>
        {children}
        {/*{LayoutStore.rulesAccepted ? (settings ? <Settings close={() => setSettings(false)} /> : <MainPage />) : <Rules />}*/}
      </MainContent>


      {!store.token && <AuthDialog />}

      <BottomRow>
        <LogFile onClick={() => { }}>Лог</LogFile>
        {showPlayButton && <PlayButton />}

        <DiscordIcon
          onClick={() => {
            electronProxy.openLink('https://discord.gg/3DmvqWHGqU')
          }}
        />
        <FolderIcon
          onClick={() => { }}
        />
      </BottomRow>

    </Container>
  )
})
