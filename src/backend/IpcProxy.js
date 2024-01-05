import { sendToWeb } from "../main"
import ConfigManager from "./ConfigManager"
import UpdateManager from "./UpdateManager"

const { shell, app } = require('electron')

export class IpcProxy {
    hello(w, h) {
        console.log("hello", w, h)
    }


    openLink(url) {
        shell.openExternal(url)
    }



    async ready() {
        ConfigManager.loadConfig()
        await UpdateManager.prepareGame()
        sendToWeb('version', app.getVersion())
    }

    async play() {
        console.log('Starting game')
        await UpdateManager.prepareGame();
        await UpdateManager.playGame()
    }


    async acceptRules() {
        ConfigManager.acceptRules();
    }

    updateConfig(partial) {
        ConfigManager.updateConfig(partial)
    }
}