import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import LayoutStore from './Layout.store'
import { observer } from 'mobx-react-lite'
import MainPage from '../MainPage'
import {app} from "electron";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

const BackgroundImage = styled.div`
  z-index: -1;
  background-image: url('https://cdn.discordapp.com/attachments/800081672813019196/938170343552581735/unknown.png');
  background-size: cover;
  opacity: 0.2;
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`

const Title = styled.div`
  font-size: 40px;
  margin-left: 10px;
  margin-top: 10px;
`

const MainContent = styled.div`
  flex: 1;
`

const Version = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    color: #ddd;
    padding: 4px;
`

const PlayButton = styled.button`
  cursor: pointer;
  width: 200px;
  font-size: 24px;
  background-color: #0c364c; /* Green */
  border: none;
  color: #ddd;
  padding: 10px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin-left: 20px;
  transition: 0.3s ease-in-out;
  
  
  &:disabled {
    background: #0c364c;
     color: #7e7e7e;
     cursor: not-allowed;
     
  }
`

const BottomRow = styled.div`
  height: 70px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
`
const Username = styled.input`
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 18px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ddd;
  outline: none;
  border: none;
`

const Spacer = styled.div`
  flex: 1;
`

const UpdateStatus = styled.div`
  font-size: 20px;
  padding: 10px;
`

const OnlineStatus = styled.div`
  font-size: 16px;
  padding: 10px;
`

const Layout = () => {
  const [username, setUsername] = useState('Itachi')

  useEffect(() => {
    LayoutStore.ping()
  }, [])

  return (
    <Container>
      <BackgroundImage />
      {/*<Title>Kingdom RPG</Title>*/}
      <Version>{LayoutStore.version}</Version>
      <MainContent>
        <MainPage />
      </MainContent>
      <BottomRow>
        <Username
          value={LayoutStore.username}
          onChange={e => LayoutStore.setUsername(e.target.value)}
          placeholder="Никнейм"
        />
        <PlayButton disabled={!LayoutStore.updateStatus.updated || LayoutStore.username.trim().length === 0} onClick={() => LayoutStore.launchGame()}>Играть</PlayButton>
        <OnlineStatus>
          Онлайн: {LayoutStore.onlineCount}/{LayoutStore.maxOnlineCount}
        </OnlineStatus>
        <Spacer />
        <UpdateStatus onClick={() => LayoutStore.onUpdateButton()}>
          {LayoutStore.getUpdateStatus()}
        </UpdateStatus>
      </BottomRow>
    </Container>
  )
}

export default observer(Layout)
