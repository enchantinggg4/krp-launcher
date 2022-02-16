import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components'

const MainPageContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

export const SettingsForm = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 800px;
  max-width: 800px;
  height: 400px;
  align-self: center;

  background-color: rgba(0, 0, 0, 0.8);
  padding: 40px;
  transition: 0.3s ease-in-out;
`

export default observer(() => {
  return (
    <MainPageContainer>
      <SettingsForm>
        hello123
      </SettingsForm>
    </MainPageContainer>
  )
})
