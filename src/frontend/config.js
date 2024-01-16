import { create } from 'apisauce'
import { configure } from "mobx"

configure({
    enforceActions: "never"
})

// API
export const UPDATER_URL = 'http://178.208.77.45'


export const api = create({
    baseURL: UPDATER_URL,
})


export const setToken = (token) => {
    api.setHeader('Authorization', `Bearer ${token}`)
}