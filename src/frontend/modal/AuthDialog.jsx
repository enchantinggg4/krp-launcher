import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Redirect } from 'react-router-dom'
import { Input } from '../component/Input.jsx'
import { Modal } from '../component/Modal.jsx'
import { Button } from '../component/Button.jsx'
import { electronProxy } from '../ipc'
import { UPDATER_URL, api, setToken } from '../config'
import { observer } from 'mobx-react-lite'

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
    const config = useState('update_config', {})
    const [isRegister, setIsRegister] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('');

    useEffect(() => {
        const r = RegExp(/^[a-zA-Z0-9_]{2,16}$/gm)
        let error = ''
        if (username.length < 3 || username.length > 16) {
            error = ('Никнейм должен быть от 3 до 16 символов')
        } else if (!r.test(username)) {
            error = ('Только английские буквы и цифры')
        } else if (password.length < 5 || password.length > 16) {
            error = ('Пароль должен быть от 5 до 16 символов')
        } else {
            error = ''
        }
        setError(error)

    }, [username, password])



    const auth = useCallback(async (authType, username, password) => {
        const res = await api.post(
            `/auth/${authType}`,
            {
                username: username,
                password: password,
            }
        )

        if (res.ok) {
            setToken(res.data.access_token)
            electronProxy.updateConfig({
                username,
                password,
                token: res.data.access_token
            })
        } else {
            if (authType == 'login') {
                setError('Неправильный логин/пароль')
            } else {
                setError('Никнейм занят')
            }
        }
    }, [])

    return (
        <Modal>
            <Input
                placeholder="Никнейм"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />

            <ErrorField>{error}</ErrorField>

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
                disabled={!!error}
                onClick={() => {
                    if (isRegister) {
                        return auth('register', username, password)
                    } else {
                        return auth('login', username, password)
                    }
                }}
            >
                {isRegister ? 'Регистрация' : 'Вход'}
            </Button>
        </Modal>
    )
})
