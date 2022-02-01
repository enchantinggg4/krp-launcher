import {makeAutoObservable, observable} from "mobx"
import {Config} from "../../../electron/Config.manager";
import {Stats} from "node-downloader-helper";

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
    minecraftDownloaded: false
  }

  @observable
  unzipStatus?: {
    percentage: number
  }

  @observable
  private downloadStatus?: Stats;

  constructor() {
    makeAutoObservable(this);

    window.Main.on('online', (data: any) => {
      this.onlineCount = data.online
      this.maxOnlineCount = data.max
    })

    window.Main.on('update_config', (data: Config) => {
      this.username = data.username;
    })

    window.Main.on('download_progress', (data: Stats) => {
      console.log('DownloadStatus received')
      this.downloadStatus = data
    })

    window.Main.on('unzip_status', (data: any) => {
      this.unzipStatus = data;
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

  async launchGame(){
    window.Main.sendMessage({ type: 'launch' })
  }

  onUpdateButton() {
    // check if we are up to date
    window.Main.sendMessage({ type: 'reinstall' })
  }

  getUpdateStatus() {
    // console.log(this.updateStatus, this.downloadStatus)
    if(this.updateStatus.updated){
      return 'Установлена последняя версия!'
    }else if(this.updateStatus.totalUpdates > 0){
      return `Установка ${this.updateStatus.downloaded}/${this.updateStatus.totalUpdates}`
    }else if(this.downloadStatus) {
      return `Скачивание ${this.downloadStatus?.progress.toFixed(1)}%`
    } else if(this.unzipStatus){
      return `Разархивирование ${this.unzipStatus.percentage.toFixed(1)}%`
    } else {
      return 'Идет установка...'
    }
  }
}

export default new LayoutStore()
