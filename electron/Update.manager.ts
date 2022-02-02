import {app} from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import {PatchDTO, PatchesDTO} from './dto'
import {ApisauceInstance, create} from 'apisauce'
import {DownloaderHelper} from 'node-downloader-helper'
import {mainWindow} from './main'
import DecompressZip from 'decompress-zip';

class UpdateManager {
  APPDATA_DIR = '.kingdomrpg'

  private api: ApisauceInstance

  updatesNeeded = 0
  updatesDone = 0
  minecraftDownloaded = false

  unzipStatus?: {
    done: number
    total: number
    percentage: number
  }

  constructor() {
    this.api = create({
      baseURL: 'http://5.101.50.157:3300',
      // baseURL: 'http://localhost:3300',
    })
  }

  public getMinecraftPath() {
    const appPath = app.getPath('userData')
    return path.join(appPath, '../', this.APPDATA_DIR)
  }

  public getModsPath() {
    return path.resolve(this.getMinecraftPath(), 'mods')
  }

  public isMinecraftZipDownloaded() {
    return fs.existsSync(
      path.join(this.getMinecraftPath(), '1.16.5-fabric.zip')
    )
  }

  public isMinecraftInstalled() {
    const shouldExist = ['libraries', 'assets']
    for (let filename of shouldExist) {
      if (!fs.existsSync(path.join(this.getMinecraftPath(), filename)))
        return false
    }

    return true
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

  public async downloadMinecraftZip() {
    const downloadUrl = 'http://5.101.50.157/1.16.5-fabric.zip'
    const helper = new DownloaderHelper(downloadUrl, this.getMinecraftPath(), {
      override: true,
    })
    helper.on('progress.throttled', data => {
      mainWindow?.webContents.send('download_progress', data)
      this.notifyUpdate()
    })

    await helper.start()
    this.notifyUpdate()
    mainWindow?.webContents.send('download_progress', null)
  }

  public async unpackMinecraft() {
    return new Promise<void>((resolve, reject) => {
      const unzipper = new DecompressZip(
        path.join(this.getMinecraftPath(), '1.16.5-fabric.zip')
      )
      unzipper.extract({
        path: path.join(this.getMinecraftPath()),
      })

      unzipper.on('error', function (err: any) {
        reject()
      })

      unzipper.on('extract', function (log: any) {
        mainWindow?.webContents.send('unzip_status', undefined)
        resolve()
      })

      unzipper.on('progress', function (fileIndex: number, fileCount: number) {
        mainWindow?.webContents.send('unzip_status', {
          done: fileIndex + 1,
          total: fileCount,
          percentage: ((fileIndex + 1) / fileCount) * 100,
        })
      })
    })
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
      if (file.action == '+') {
        const downloadUrl = `${this.api.getBaseURL()}/static/${file.filename}`
        return this.downloadModFile(file.filename, downloadUrl)
      } else if (file.action == '-') {
        fs.unlinkSync(path.join(this.getModsPath(), file.filename))
        this.onUpdated();
        return Promise.resolve()
      }else {
        console.log("UNKNOWN ACTION??", file)
      }
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
        this.isMinecraftInstalled() &&
        (this.updatesNeeded === 0 || this.updatesDone === this.updatesNeeded),
      totalUpdates: this.updatesNeeded,
      downloaded: this.updatesDone,
      minecraftDownloaded: this.isMinecraftInstalled(),
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

  async manageUpdates() {
    // Here we install minecraft if needed and updates
    if(!fs.existsSync(this.getMinecraftPath())){
      fs.mkdirSync(this.getMinecraftPath());
    }
    this.notifyUpdate()
    console.log('HEHELHEEHLLELHEL???')

    if (!this.isMinecraftZipDownloaded()) {
      console.log('Start downloading zip...')
      await this.downloadMinecraftZip()
    } else {
      console.log('Zip already downloaded')
    }

    if (!this.isMinecraftInstalled()) {
      console.log('Start unpacking zip')
      try{
        await this.unpackMinecraft()
      }catch(e){
        fs.unlinkSync(path.join(this.getMinecraftPath(), "1.16.5-fabric.zip"))
        // If we have a corrupt array
        this.manageUpdates();
      }
    } else {
      console.log('Zip already unpacked!')
    }
    await this.makeUpdate()
  }
}

export default new UpdateManager()
