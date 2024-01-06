import { sendToWeb } from "../main"
import ConfigManager from "./ConfigManager"
import UpdateManager from "./UpdateManager"

import log from 'electron-log'
const { shell, app } = require('electron')

export class IpcProxy {

    openLink(url) {
        shell.openExternal(url)
    }



    async ready() {
        log.info('Getting game ready...')


        ConfigManager.loadConfig()
        sendToWeb('version', app.getVersion())

        await Promise.all([
            UpdateManager.prepareGame(),
            UpdateManager.wrap.prepareJVM()
        ])

    }

    async play() {
        log.info('Starting game...')

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