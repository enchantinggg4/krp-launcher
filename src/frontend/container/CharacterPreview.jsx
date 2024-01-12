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
    const { data, mutate } = useSWR('/auth/me')

    const profile = data || store.profile;


    if (!profile) return null

    let url = profile.skinId && `${UPDATER_URL}/skins/${profile.skinId}` || undefined;

    console.log(url)

    return (
        <CharacterPreviewDiv className="single">
            <div className='skin-render-holder'>
                <MinecraftSkinViewer walk background={undefined} width={150} height={250} skin={url} />
            </div>
            <div className="option-name">
                {profile.username}
            </div>
            <FileUploader handleFile={async (f) => {
                const { path } = await store.uploadSkin(f)
                mutate({
                    ...(data || {}),
                    skinId: path
                })
            }} />
        </CharacterPreviewDiv>
    )
})
