import WrapClient from "./wrapper/wrap_client"
import { app } from 'electron'
import * as path from 'path'
import fabric from './wrapper/fabric'
import { sendToWeb } from "../main"
import { isContextRunning, useSingleContext } from "./helper"
import { isContext } from "vm"
import ConfigManager from "./ConfigManager"
class UpdateManager {
    APPDATA_DIR = '.kingdomrpg'


    updatePromise = null;
    runningGame = null;


    gameState = {
        running: false,
        isUpdating: false
    }

    constructor() {
        const javaArgs = [
            '-XX:-UseAdaptiveSizePolicy',
        ]
        this.isPreparing = false;
        this.wrap = new WrapClient(this.getMinecraftPath(), this.getVersion(), this.getOs(), javaArgs);
        this.wrap.on('queue_state', msg => {
            sendToWeb('prepare_state', msg)
        })
    }

    getMinecraftPath() {
        const appPath = app.getPath('userData')
        return path.join(appPath, '../', this.APPDATA_DIR)
    }

    getVersion() {
        return '1.19.2'
    }

    getOs() {
        return 'windows'
    }

    // We need to cancel shit we had before
    async prepareGame() {
        return useSingleContext('prepare', () => {
            return new Promise(async (resolve, reject) => {
                sendToWeb('is_prepared', false);
                await this.wrap.prepare()
                await this.wrap.installFabric(fabric)
                console.log('Game prepared')
                sendToWeb('is_prepared', true);
                resolve();
            });
        })

    }


    async playGame() {
        if (isContextRunning('prepare'))
            return;

        return useSingleContext('play', () => {
            sendToWeb('game_running', true)
            return this.wrap.start({
                accessToken: ConfigManager.config.username,
                authToken: ConfigManager.config.token
            }).then(() => sendToWeb('game_running', false))
        })

    }


    async stopGame() {
        await this.wrap.stop().then(() => sendToWeb('game_state', false))
    }

}

export default new UpdateManager();