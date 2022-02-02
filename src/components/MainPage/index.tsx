import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components'

const DiscordLink = styled.a`
  text-decoration: none;
  color: #ddd;
  font-size: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  padding: 10px;
  border-radius: 10px;
  transition: 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.1);

  &:hover {
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
  }
`

const MainPageContainer = styled.div`
  padding: 20px;
`
const DiscordLogo = styled.img`
  width: 50px;
  height: 50px;
`
export default observer(() => {
  return (
    <MainPageContainer>
      <DiscordLink target="__blank" href="https://discord.gg/kppHeADS">
        <DiscordLogo
          src="https://www.svgrepo.com/show/353655/discord-icon.svg"
          alt=""
        />
        Discord
      </DiscordLink>
    </MainPageContainer>
  )
})
