import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import LayoutStore from '../../components/Layout/Layout.store'
import { Button } from '../../components/Button'
import { InputField } from '../../components/Input'
import styled from 'styled-components'
import { Redirect } from 'react-router-dom'
import {Modal} from "../../components/Modal";

const ErrorField = styled.div`
  margin: 8px 0;
  font-size: 14px;
  box-sizing: border-box;
  color: #c64141;
  outline: none;
  border: none;
`


const AuthMethodSwitch = styled.div`
  position: absolute;
  bottom: -40px;
  display: flex;
  flex-direction: row;
  left: 0;
  right: 0;

  & .auth-method {
    padding: 8px;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    color: #ddd;
    align-self: center;
    justify-self: center;
    margin: auto;

    &:hover {
      color: white;
    }
  }
`

export default observer(() => {
  const [isRegister, setIsRegister] = useState(true)

  if (LayoutStore.token) return <Redirect to="/main" />;

  return (
    <Modal>
      <InputField
        placeholder="Никнейм"
        value={LayoutStore.username}
        onChange={e => LayoutStore.setUsername(e.target.value)}
      />
      <ErrorField>{LayoutStore.usernameError}</ErrorField>

      <InputField
        type="password"
        placeholder="Пароль"
        value={LayoutStore.password}
        onChange={e => LayoutStore.setPassword(e.target.value)}
      />

      <ErrorField>{LayoutStore.passwordError}</ErrorField>

      <ErrorField>{LayoutStore.error}</ErrorField>

      <AuthMethodSwitch>
        <div
          onClick={() => {
            setIsRegister(!isRegister)
          }}
          className="auth-method"
        >
          {isRegister ? 'Уже есть аккаунт?' : 'Создать аккаунт'}
        </div>
      </AuthMethodSwitch>

      <Button
        disabled={!LayoutStore.canLogin}
        onClick={() => {
          if (isRegister) {
            return LayoutStore.register()
          } else {
            return LayoutStore.login()
          }
        }}
      >
        {isRegister ? 'Регистрация' : 'Вход'}
      </Button>
    </Modal>
  )
})
