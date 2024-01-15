import { create } from 'apisauce'
import { configure } from "mobx"

configure({
    enforceActions: "never"
})

// API
export const UPDATER_URL = 'http://84.38.180.50'


export const api = create({
    baseURL: UPDATER_URL,
})


export const setToken = (token) => {
    api.setHeader('Authorization', `Bearer ${token}`)
}