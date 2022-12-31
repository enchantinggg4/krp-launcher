import {observer} from "mobx-react-lite";
import LayoutStore from "../Layout/Layout.store";
import {UPDATER_URL} from "../../config";
import {MinecraftSkinViewer} from "@wiicamp/react-minecraft-skin-viewer";
import FileUploader from "../FileUploader";
import React from "react";
import styled from "styled-components";



const FactionSelect = styled.div`
  display: flex;
  flex-direction: row;
`

const CharacterPreviewDiv = styled.div`
  transition: 0.3s ease-in-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;

  width: 300px;
  align-self: center;
  justify-self: center;
  max-width: 300px;

  & .skin-render-holder {
    display: flex;
    align-content: center;
    justify-content: center;
  }

  & .option-name {
    margin-top: 10px;
    font-size: 24px;
    color: white;
    align-self: center;
  }
`

export const CharacterPreview = observer(() => {
  const profile = LayoutStore.profile
  if (!profile) return null
  const fraction = profile.profile.fraction

  let url = (profile.profile.skinId && profile.profile.skinId !== '0') && `${UPDATER_URL}/skins/${profile.profile.skinId}` || undefined;

  if(!url){
    if (fraction == 'HUMAN') {
      url =
        `${UPDATER_URL}/skins/human_default.png`
    } else if (fraction == 'ELF') {
      url = `${UPDATER_URL}/skins/elf_default.png`
    } else {
      url = `${UPDATER_URL}/skins/dwarf_default.png`
    }
  }

  return (
    <FactionSelect>
      <CharacterPreviewDiv className="single">
        <div className='skin-render-holder'>
          <MinecraftSkinViewer walk background={undefined} width={150} height={250} skin={url} />
        </div>
        <div className="option-name">
          {profile.profile.username}
        </div>
        <div className="option-name">
          {profile.skills.reduce((a, b) => a + b.level, 0) + 1} уровень
        </div>
        <FileUploader handleFile={(f) => {
          LayoutStore.uploadSkin(f)
        }} />
      </CharacterPreviewDiv>
    </FactionSelect>
  )
})
