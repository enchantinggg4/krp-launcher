import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '../Button'
import LayoutStore, {
  Faction,
  FactionName,
  SkillName,
} from '../Layout/Layout.store'
import SkinViewer from "react-minecraft-skin-viewer"
import FileUploader from '../FileUploader'


const MainPageContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

const InputField = styled.input`
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 18px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.3);
  color: #777;
  outline: none;
  border: none;

  transition: 0.3s ease;

  &::placeholder {
    transition: 0.3s ease;
    color: #777;
  }

  &:active,
  &:focus,
  &:hover {
    color: #eee;
    &::placeholder {
      color: #aaa;
    }
  }
`

export const Form = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 400px;
  align-self: center;

  background-color: rgba(0, 0, 0, 0.4);
  padding: 40px;
  transition: 0.3s ease-in-out;
`

const AuthTab = styled.div``

const ErrorField = styled.div`
  margin: 8px 0;
  font-size: 14px;
  box-sizing: border-box;
  color: #c64141;
  outline: none;
  border: none;
`

const FactionSelect = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`

const FactionOption = styled.div`
  & + & {
    margin-left: 10px;
  }


  &.single-wide:hover {
    box-shadow: none;
  }

  &.single:hover {
    box-shadow: none;
  }
  &.single {
    width: 300px;
    align-self: center;
    justify-self: center;
    margin: auto;
    max-width: 300px;
  }



  transition: 0.3s ease-in-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 20px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
    box-shadow: 0px 0px 20px 5px rgba(232, 234, 9, 0.53);
  }

  & .skin-render-holder {
    display: flex;
    align-content: center;
    justify-content: center;
  }
  & .option-img {
    width: auto;
    max-height: 250px;
    align-self: center;
  }

  & .option-name {
    margin-top: 10px;
    font-size: 24px;
    color: white;
    align-self: center;
  }

  & .option-info {
    &.spaced {
      margin-top: 4px;
    } 
    position: relative;
    &::before {
      content: '-';
      position: absolute;
      left: -10px;
      width: 5px;
    }
  }

  & .option-info.good {
    color: #028002;
  }
  & .option-info.bad {
    color: #c13a3a;
  }
`

const FactionChooseTitle = styled.div`
  font-size: 34px;
  align-self: center;
  margin-bottom: 20px;
`

const FactionRoot = styled.div`
  display: flex;
  flex-direction: column;
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
const AuthBlock = observer(() => {
  const [isRegister, setIsRegister] = useState(true)
  return (
    <Form>
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
    </Form>
  )
})

const ChooseFactionBlock = observer(() => (
  <FactionRoot>
    <FactionChooseTitle>Выбери свою расу!</FactionChooseTitle>
    <FactionSelect>
      <FactionOption onClick={() => LayoutStore.choseFaction(Faction.DWARF)}>
        <img className="option-img" src="http://5.101.50.157/dwarf_default.png" />
        <div className="option-name">Гном</div>
        <div className="option-info good">Выносливый и крепкий воин</div>
        <div className="option-info good">Отлично работает с металлами</div>
        <div className="option-info bad">Не самый быстрый</div>
      </FactionOption>
      <FactionOption onClick={() => LayoutStore.choseFaction(Faction.HUMAN)}>
        <img
          className="option-img"
          src="http://5.101.50.157/human_default.png"
        />
        <div className="option-name">Человек</div>
        <div className="option-info good">Универсален</div>
        <div className="option-info good">
           Отличный плотник и лесоруб
        </div>
        <div className="option-info bad">Нет отличительных способностей</div>
      </FactionOption>
      <FactionOption onClick={() => LayoutStore.choseFaction(Faction.ELF)}>
        <img className="option-img" src="http://5.101.50.157/woodelf.png" />
        <div className="option-name">Эльф</div>
        <div className="option-info good">Быстрый и ловкий воин</div>
        <div className="option-info good">Отличный лучник и разведчик</div>
        <div className="option-info bad">Сложный стартовый биом</div>
      </FactionOption>
    </FactionSelect>
  </FactionRoot>
))

const CharacterPreview = observer(() => {
  const profile = LayoutStore.profile
  if (!profile) return null
  const fraction = profile.profile.fraction

  let url = (profile.profile.skinId && profile.profile.skinId !== '0') && `http://5.101.50.157/skins/${profile.profile.skinId}` || undefined;

  if(!url){
    if (fraction == 'HUMAN') {
      url =
        'http://5.101.50.157/skins/human_0/human_0.png'
    } else if (fraction == 'ELF') {
      url = 'http://5.101.50.157/skins/elf_0/elf_0.png'
    } else {
      url = 'http://5.101.50.157/skins/dwarf_0/dwarf_0.png'
    }
  }

  
  function topSkill() {
    const skills = [...profile!!.skills]
    skills.sort((a, b) => b.level - a.level)

    const skill = skills[0].skill
    return SkillName[skill]
  }

  console.log("SKINNNN", url)
  return (
    <FactionSelect>
      <FactionOption className="single">
        {/* <img className="option-img" src={url} /> */}
        <div className='skin-render-holder'>
          <SkinViewer key={url} src={url}/>
        </div>
        <div className="option-name">
          {profile.profile.username}, {FactionName[profile.profile.fraction!!]}
        </div>
        <div className="option-info">
          {profile.skills.reduce((a, b) => a + b.level, 0) + 1} уровень
        </div>
        {profile.skills.length > 0 && (
          <div className="option-info">{topSkill()}</div>
        )}
      </FactionOption>
      <FactionOption className="single-wide">

        {profile.skills.map(skill => <div className="option-info spaced">
          {SkillName[skill.skill]}, {skill.level + 1} уровень
        </div>)}


        <div className="option-name">Загрузи свой скин! 64х64 PNG</div>
      <FileUploader handleFile={(f) => {
          LayoutStore.uploadSkin(f)
      }} />
      </FactionOption>
    </FactionSelect>
  )
})

export default observer(() => {
  console.log(LayoutStore.profile?.profile)
  return (
    <MainPageContainer>
      {!LayoutStore.token && <AuthBlock />}

      {LayoutStore.profile?.profile.fraction === 'WILD' && (
        <ChooseFactionBlock />
      )}

      {LayoutStore.profile &&
        LayoutStore.profile.profile.fraction != 'WILD' && <CharacterPreview />}
    </MainPageContainer>
  )
})
