
import log from 'electron-log'
import { sendToWeb } from '../main';
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
class ConfigManager {
    config = {}


    loadConfig() {
        try {
            this.config = JSON.parse(
                fs.readFileSync(
                    path.join(app.getPath('userData'), 'config.json'),
                    'utf-8'
                )
            )
            this.sendUpdate()
        } catch (e) {
            console.error('WHY??', e)
            this.config = {}
            this.save()
            this.sendUpdate()
        }
    }


    save() {
        fs.writeFileSync(
            path.join(app.getPath('userData'), 'config.json'),
            JSON.stringify(this.config)
        )
    }

    updateConfig(partial) {
        this.config = {
            ...this.config,
            ...partial
        };
        this.save();
        this.sendUpdate()
    }


    sendUpdate() {
        sendToWeb('update_config', this.config)
    }

}


export default new ConfigManager();