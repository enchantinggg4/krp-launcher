import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import React from 'react'
import { Form } from '../MainPage'
import LayoutStore from '../Layout/Layout.store'
import { Button } from '../Button'

const MainPageContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

const FormRule = styled.div`
  position: relative;
  font-size: 16px;

  & + & {
    margin-top: 8px;
  }
  &::before {
    content: '-';
    position: absolute;
    left: -10px;
    width: 5px;
  }
`

const FormTitle = styled.div`
  display: flex;
  font-size: 24px;
  text-align: center;
  align-self: center;
  margin-bottom: 20px;
  color: #ddd;
`

export default observer(() => {
  return (
    <MainPageContainer>
      <Form>
        <FormTitle>Правила</FormTitle>
        <FormRule>Мультиаккаунт запрещен</FormRule>
        <FormRule>Уничтожение построек без цели воровства</FormRule>
        <FormRule>Любой чит - бан без предупреждения</FormRule>
        <FormRule>Если найдешь ошибку, дюп или эксплоит - пиши админам в дискорде</FormRule>
        <FormRule>Выживать и развиваться будет тяжело. Вместе - значительно проще</FormRule>

        <br />
        <br />

        <Button onClick={() => {
          LayoutStore.onAcceptRules()
        }}>
          Я принимаю правила игры
        </Button>
      </Form>
    </MainPageContainer>
  )
})
