import {app} from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import {PatchDTO, PatchesDTO} from './dto'
import {ApisauceInstance, create} from 'apisauce'
import {DownloaderHelper} from 'node-downloader-helper'
import {mainWindow} from './main'

class UpdateManager {
  APPDATA_DIR = '.kingdomrpg'

  private api: ApisauceInstance

  updatesNeeded = 0
  updatesDone = 0

  constructor() {
    this.api = create({
      baseURL: 'http://5.101.50.157:3300',
    })
  }

  public getMinecraftPath() {
    const appPath = app.getPath('userData')
    return path.join(appPath, '../', this.APPDATA_DIR)
  }

  public getModsPath() {
    return path.resolve(this.getMinecraftPath(), 'mods')
  }

  public getPatchState(): PatchesDTO {
    const dirPath = this.getModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const files = fs.readdirSync(dirPath)

    const patches: PatchDTO[] = files.map(file => {
      const fullpath = path.join(dirPath, file)
      const fileBuffer = fs.readFileSync(fullpath)
      const hashSum = crypto.createHash('sha256')
      hashSum.update(fileBuffer)
      return {
        filename: file,
        hash: hashSum.digest('hex'),
      }
    })
    return {
      files: patches,
    }
  }

  /**
   * Return list of files to be downloaded from server
   */
  public async getDiff(): Promise<PatchesDTO | undefined> {
    const ps = this.getPatchState()
    const diff = await this.api.post<PatchesDTO>('/updater/diff', ps)
    return diff.data
  }

  public async makeUpdate() {
    this.updatesDone = 0
    this.updatesNeeded = 0
    const diff = await this.getDiff()
    if (!diff) return
    console.log('Update from server: ', diff)

    this.updatesNeeded = diff.files.length

    const promises = diff.files.map(file => {
      const downloadUrl = `${this.api.getBaseURL()}/static/${file.filename}`
      return this.downloadModFile(file.filename, downloadUrl)
    })
    await Promise.all(promises)
  }

  private async downloadModFile(filename: string, url: string) {
    const dl = new DownloaderHelper(url, this.getModsPath())
    return dl.start().then(() => this.onUpdated())
  }

  private onUpdated() {
    this.updatesDone += 1
    this.notifyUpdate()
  }

  private notifyUpdate() {
    mainWindow?.webContents.send('update_status', {
      updated:
        this.updatesNeeded === 0 || this.updatesDone === this.updatesNeeded,
      totalUpdates: this.updatesNeeded,
      downloaded: this.updatesDone,
    })
  }

  async cleanInstall() {
    const dirPath = this.getModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const files = fs.readdirSync(dirPath)
    files.forEach(file => {
      fs.unlinkSync(path.join(dirPath, file))
    })

    this.notifyUpdate()
    await this.makeUpdate()
  }
}

export default new UpdateManager()
