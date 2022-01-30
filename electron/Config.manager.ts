import fs from "fs"
import path from "path"
import {app} from "electron";
import {mainWindow} from "./main";

export interface Config {
  username: string
}

class ConfigManager {
  config: Config

  constructor() {
    console.log("hey ", path.join(app.getPath('userData'), 'config.json'))
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
      }
      this.save()
    }
  }

  public setUsername(username: string) {
    this.config.username = username
    this.save()
  }

  public sendUpdate(){
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
