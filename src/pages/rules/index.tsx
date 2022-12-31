import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import LayoutStore from '../../components/Layout/Layout.store'
import { Redirect } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import styled from "styled-components";

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
  const [isRegister, setIsRegister] = useState(true)

  if (LayoutStore.rulesAccepted) return <Redirect to="/auth" />

  return (
    <Modal>
      <FormTitle>Правила</FormTitle>
      <FormRule>Мультиаккаунт запрещен</FormRule>
      <FormRule>Уничтожение построек без цели воровства - запрещено</FormRule>
      <FormRule>Любой чит - бан без предупреждения</FormRule>
      <FormRule>
        Если найдешь ошибку, дюп или эксплоит - пиши админам в дискорде
      </FormRule>
      <FormRule>
        Выживать и развиваться будет тяжело. Вместе - значительно проще
      </FormRule>

      <br />
      <br />

      <Button
        onClick={() => {
          LayoutStore.onAcceptRules()
        }}
      >
        Я принимаю правила игры
      </Button>
    </Modal>
  )
})
