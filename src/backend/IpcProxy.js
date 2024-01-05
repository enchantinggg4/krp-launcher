import { sendToWeb } from "../main"
import ConfigManager from "./ConfigManager"
import UpdateManager from "./UpdateManager"
import { javaversion } from "./helper"

const { shell, app } = require('electron')

export class IpcProxy {
    hello(w, h) {
        console.log("hello", w, h)
    }


    openLink(url) {
        shell.openExternal(url)
    }



    async ready() {
        console.log('Getting ready')


        ConfigManager.loadConfig()
        sendToWeb('version', app.getVersion())

        await Promise.all([
            UpdateManager.prepareGame(),
            UpdateManager.wrap.prepareJVM()
        ])

    }

    async play() {
        console.log('Starting game')

        await UpdateManager.prepareGame();
        await UpdateManager.wrap.prepareJVM()
        await UpdateManager.playGame()


    }


    async acceptRules() {
        ConfigManager.acceptRules();
    }

    updateConfig(partial) {
        ConfigManager.updateConfig(partial)
    }
}