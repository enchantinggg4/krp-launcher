import {makeAutoObservable, observable} from "mobx"

class LayoutStore {
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

    window.Main.on('update_status', (data: any) => {
      this.updateStatus = data;
    })

    setInterval(() => {
      this.ping()
    }, 10_000)
    this.ping()
  }

  async ping() {
    window.Main.sendMessage({ type: 'ping' })
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
