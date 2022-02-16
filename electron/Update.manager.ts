import {app} from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import {PatchDTO, PatchesDTO} from './dto'
import {ApisauceInstance, create} from 'apisauce'
import {DownloaderHelper} from 'node-downloader-helper'
import {mainWindow} from './main'
import DecompressZip from 'decompress-zip'
import log from 'electron-log'

class UpdateManager {
  APPDATA_DIR = '.kingdomrpg'

  api: ApisauceInstance

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

  public getCustomModsPath(){
    const dirPath = path.resolve(this.getMinecraftPath(), 'custom_mods')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    return dirPath;    
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
    try {
      const content = fs.readFileSync(
        path.join(this.getMinecraftPath(), 'extract.txt'),
        'utf-8'
      )
      return content === 'done'
    } catch (e) {
      // Old method of checking, no extract.txt yet
    }
    const shouldExist = ['libraries', 'assets']
    for (let filename of shouldExist) {
      if (!fs.existsSync(path.join(this.getMinecraftPath(), filename)))
        fs.writeFileSync(
          path.join(this.getMinecraftPath(), 'extract.txt'),
          'error'
        )
        return false
    }

    fs.writeFileSync(
      path.join(this.getMinecraftPath(), 'extract.txt'),
      'done'
    )
    return true
  }

  public getPatchState(): PatchesDTO {
    const dirPath = this.getModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    

    const customMods = this.getCustomPlayerMods();
    log.info("List of player's custom mods: " , customMods);

    const files = fs.readdirSync(dirPath).filter(it => !customMods.includes(it));

    log.info("List of mods for diff:", files)


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
      fs.writeFileSync(path.join(this.getMinecraftPath(), 'extract.txt'), '0')
      unzipper.extract({
        path: path.join(this.getMinecraftPath()),
      })

      unzipper.on('error', (err: any) => {
        fs.writeFileSync(
          path.join(this.getMinecraftPath(), 'extract.txt'),
          'error'
        )
        reject()
      })

      unzipper.on('extract', (log: any) => {
        fs.writeFileSync(
          path.join(this.getMinecraftPath(), 'extract.txt'),
          'done'
        )
        mainWindow?.webContents.send('unzip_status', undefined)
        resolve()
      })

      unzipper.on('progress', (fileIndex: number, fileCount: number) => {
        if (fileIndex % 100 == 0) {
          fs.writeFileSync(
            path.join(this.getMinecraftPath(), 'extract.txt'),
            `${fileIndex + 1}\n${fileCount}`
          )
        }
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


  private getCustomPlayerMods(): string[] {
    const dirPath = this.getCustomModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const files = fs.readdirSync(dirPath);
    return files;
  }

  public async updateMods() {
    this.updatesDone = 0
    this.updatesNeeded = 0
    const diff = await this.getDiff()
    if (!diff) return
    log.info('Update from server: ', diff)
    

    this.updatesNeeded = diff.files.length

    const promises = diff.files.map(file => {


      if (file.action == '+') {
        const downloadUrl = `${this.api.getBaseURL()}/static/${file.filename}`
        return this.downloadModFile(file.filename, downloadUrl)
      } else if (file.action == '-') {
        if (fs.existsSync(path.join(this.getModsPath(), file.filename))) {
          fs.unlinkSync(path.join(this.getModsPath(), file.filename))
        }
        this.onUpdated()
        return Promise.resolve()
      } else {
        log.info('Unknown action for file', file, 'action is: ' + file.action)
      }
    })
    await Promise.all(promises)
  }

  private async downloadModFile(filename: string, url: string) {
    // remove old file to prevent bad things
    if (fs.existsSync(path.join(this.getModsPath(), filename))) {
      fs.unlinkSync(path.join(this.getModsPath(), filename))
    }

    // we Both remove and override: true, just in case
    const dl = new DownloaderHelper(url, this.getModsPath(), {
      override: true,
    })
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
    await this.updateMods()
  }

  async manageUpdates() {
    // Here we install minecraft if needed and updates
    if (!fs.existsSync(this.getMinecraftPath())) {
      fs.mkdirSync(this.getMinecraftPath())
    }
    this.notifyUpdate()
    log.info('UpdateInfo: created minecraft path if not existed')

    if (!this.isMinecraftZipDownloaded()) {
      log.info('Start downloading zip...')
      await this.downloadMinecraftZip()
    } else {
      log.info('Zip already downloaded')
    }

    log.info('Zip downloaded')

    if (!this.isMinecraftInstalled()) {
      log.info('Start unpacking zip')
      try {
        await this.unpackMinecraft()
      } catch (e) {
        log.info('Encountered issue while unpacking minecraft: ')
        log.error(e);
        log.info('Deleting zip and restarting install process')
        fs.unlinkSync(path.join(this.getMinecraftPath(), '1.16.5-fabric.zip'))
        // If we have a corrupt array
        await this.manageUpdates();
        return;
      }
    } else {
      log.info('Zip already unpacked!')
    }
    await this.updateMods()
  }
}

export default new UpdateManager()
