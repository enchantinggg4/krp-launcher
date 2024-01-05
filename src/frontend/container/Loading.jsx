import styled from "styled-components"
import { useEvent } from "../hooks"
import React from 'react'



const UpdateStatus = styled.div`
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.1);
    transition: 0.3s ease;
    padding: 4px;
    
    &.hidden {
        opacity: 0;
    }

    &.visible {
        opacity: 1;
    }
`
export const Loading = ({ }) => {


    return <UpdateStatus className={(data.maxTotal == 0 || total == left) ? 'hidden' : 'visible'}>
        {left} / {total}
    </UpdateStatus>
}