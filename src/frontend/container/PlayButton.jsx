import React, { useCallback } from 'react'
import { electronProxy } from '../ipc'
import { useEvent } from '../hooks'
import styled from 'styled-components'
import store from '../store'
import { observer } from 'mobx-react-lite'



const PButton = styled.button`
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  cursor: pointer;
  width: 260px;
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


const LoadBar = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(100, 200, 200, 0.5);
`
export const PlayButton = observer(({ }) => {




  const data = useEvent('prepare_state', {
    maxTotal: 0,
    total: 0
  })

  const total = (data.maxTotal || 0)
  const left = total - (data.total || 0)


  const percentage = left / (total + 1) * 100


  const stillDownloading = data.total > 0



  const play = useCallback(() => {
    electronProxy.play()
  })

  let label = 'Играть'

  if (!store.isPrepared) {
    if (data.comment == "game") {
      label = "Обновление игры..."
    } else if (data.comment == "mods") {
      label = "Обновление модов..."
    } else if (data.comment == "fabric") {
      label = "Обновление fabric..."
    } else if (data.comment == "config") {
      label = "Конфигурация..."
    } else {
      label = 'Обновление...'
    }
  } else if (store.isRunning) {
    label = 'Запускаем...'
  }

  return <PButton disabled={store.isRunning || !store.isPrepared || stillDownloading} onClick={play}>
    {!store.isPrepared && <LoadBar style={{ width: `${percentage}%` }} />}
    {label}
  </PButton>
});