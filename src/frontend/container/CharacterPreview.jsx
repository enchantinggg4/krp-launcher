import { observer } from "mobx-react-lite";
import { MinecraftSkinViewer } from "@wiicamp/react-minecraft-skin-viewer";
import FileUploader from "./FileUploader.jsx";
import React, { useEffect } from "react";
import styled from "styled-components";
import useSWR from "swr";
import store from "../store.js";
import { UPDATER_URL } from "../config.js";



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
  min-width: 300px;

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
    const { data } = useSWR('/auth/me')

    const profile = data && data.data || store.profile;


    if (!profile) return null
    const fraction = profile.profile.fraction

    let url = (profile.profile.skinId && profile.profile.skinId !== '0') && `${UPDATER_URL}/skins/${profile.profile.skinId}` || undefined;

    console.log(url)

    if (!url) {
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
        <CharacterPreviewDiv className="single">
            <div className='skin-render-holder'>
                <MinecraftSkinViewer walk background={undefined} width={150} height={250} skin={url} />
            </div>
            <div className="option-name">
                {profile.profile.username}
            </div>
            <FileUploader handleFile={(f) => {
                store.uploadSkin(f)
            }} />
        </CharacterPreviewDiv>
    )
})
