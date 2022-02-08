import fs from "fs"
import path from "path"
import {app} from "electron";
import {mainWindow} from "./main";
import log from "electron-log";

export interface Config {
  username: string
  password: string
  token?: string
}

class ConfigManager {
  config: Config

  constructor() {
    log.info('hey ', path.join(app.getPath('userData'), 'config.json'))
    try {
      this.config = JSON.parse(
        fs.readFileSync(
          path.join(app.getPath('userData'), 'config.json'),
          'utf-8'
        )
      )
    } catch (e) {
      this.config = {
        username: '',
        password: '',
      }
      this.save()
    }
  }

  public setUsername(username: string) {
    this.config.username = username
    this.save()
  }

  public setPassword(password: string) {
    this.config.password = password
    this.save()
  }

  public setToken(token: string) {
    this.config.token = token
    this.save()
  }

  public sendUpdate() {
    mainWindow?.webContents.send('update_config', this.config)
  }

  private save() {
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'config.json'),
      JSON.stringify(this.config)
    )
  }
}
export default new ConfigManager()
