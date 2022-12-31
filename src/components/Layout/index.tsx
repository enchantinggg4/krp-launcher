import styled from 'styled-components'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import LayoutStore from './Layout.store'
import { observer } from 'mobx-react-lite'
import { NotificationContainer } from 'react-notifications'
import { CDN_URL } from '../../config'

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
  top: 10px;
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

const PlayButton = styled.button`
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  cursor: pointer;
  width: 200px;
  font-size: 24px;
  background-color: #0c618f; /* Green */
  border: none;
  color: #ddd;
  padding: 10px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  transition: 0.3s ease-in-out;

  &:disabled {
    background: #0c364c;
    color: #7e7e7e;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #073148; /* Green */
    color: white;
  }
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

const Layout = (props: PropsWithChildren<{}>) => {
  const [settings, setSettings] = useState(false)

  const showPlayButton = LayoutStore.token && LayoutStore.rulesAccepted

  useEffect(() => {
    LayoutStore.init()
  }, [])

  return (
    <Container>
      <NotificationContainer />
      <BackgroundImage />
      <Version>{LayoutStore.version}</Version>
      <OnlineStatus>
        Онлайн: {LayoutStore.onlineCount}/{LayoutStore.maxOnlineCount}
      </OnlineStatus>
      <UpdateStatus onClick={() => LayoutStore.onUpdateButton()}>
        {LayoutStore.getUpdateStatus()}
      </UpdateStatus>
      <MainContent>
        {props.children}
        {/*{LayoutStore.rulesAccepted ? (settings ? <Settings close={() => setSettings(false)} /> : <MainPage />) : <Rules />}*/}
      </MainContent>

      {showPlayButton && (
        <BottomRow>
          <LogFile
            onClick={() => window.Main.sendMessage({ type: 'open-log' })}
          >
            Лог
          </LogFile>
          <PlayButton
            disabled={!LayoutStore.updateStatus.updated || !LayoutStore.token}
            onClick={() => LayoutStore.launchGame()}
          >
            Играть
          </PlayButton>
          <Spacer />

          <DiscordIcon
            onClick={() => {
              window.Main.sendMessage({
                type: 'open-discord',
                url: 'https://discord.gg/3DmvqWHGqU',
              })
            }}
          />
          <FolderIcon
            onClick={() => window.Main.sendMessage({ type: 'open_directory' })}
          />
          <SettingsButton onClick={() => setSettings(!settings)} />
        </BottomRow>
      )}
    </Container>
  )
}

export default observer(Layout)
