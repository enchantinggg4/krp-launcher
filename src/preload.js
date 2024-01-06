import { contextBridge, ipcRenderer } from 'electron'

// const api = {
//     /**
//  * Provide an easier way to listen to events
//  */
//     // on: (channel: string, callback: Function) => {
//     //     ipcRenderer.on(channel, (_, data) => callback(data))
//     // }
// }



contextBridge.exposeInMainWorld('Main', {
    call(method, args) {
        const packet = {
            method,
            args
        }
        ipcRenderer.send('message', packet)
    },
    on: (channel, callback) => {
        ipcRenderer.on(channel, (_, data) => callback(data))
    },
    removeListener: (channel, callback) => {
        ipcRenderer.removeListener(channel, callback)
    }
})
