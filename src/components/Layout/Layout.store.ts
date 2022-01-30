import {makeAutoObservable, observable} from "mobx"
import {Config} from "../../../electron/Config.manager";

class LayoutStore {

  @observable
  username: string = ""

  @observable
  onlineCount: number = 0

  @observable
  maxOnlineCount: number = 0

  @observable
  updateStatus = {
    updated: true,
    totalUpdates: 0,
    downloaded: 0,
  }

  constructor() {
    makeAutoObservable(this);

    window.Main.on('online', (data: any) => {
      this.onlineCount = data.online
      this.maxOnlineCount = data.max
    })

    window.Main.on('update_config', (data: Config) => {
      this.username = data.username;
    })

    window.Main.on('update_status', (data: any) => {
      this.updateStatus = data;
    })

    setInterval(() => {
      this.ping()
    }, 10_000)
    this.ping()
    window.Main.sendMessage({ type: 'init' })
  }

  async ping() {
    window.Main.sendMessage({ type: 'ping' })
  }

  async setUsername(username: string){
    this.username = username
    window.Main.sendMessage({
      type: 'update_username',
      username
    })

  }

  async reinstallMods(){
    window.Main.sendMessage({ type: 'reinstall' })
  }

  onUpdateButton() {
    // check if we are up to date
    window.Main.sendMessage({ type: 'reinstall' })
  }
}

export default new LayoutStore()
