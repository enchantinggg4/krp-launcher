import { create } from 'apisauce'
import { configure } from "mobx"

configure({
    enforceActions: "never"
})
export const UPDATER_URL = 'http://84.38.180.50:3300'
export const CDN_URL = 'http://188.68.222.85'


export const api = create({
    baseURL: UPDATER_URL,
})


export const setToken = (token) => {
    api.setHeader('Authorization', `Bearer ${token}`)
}