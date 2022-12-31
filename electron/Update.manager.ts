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
import nbt from "nbt"
import {CDN_URL, UPDATER_URL} from "../src/config";

class UpdateManager {
  public GAME_IP = '45.141.184.241'
  APPDATA_DIR = '.kingdomrpg'

  isGameRunning: boolean = false

  api: ApisauceInstance

  updatesNeeded = 0
  updatesDone = 0
  minecraftDownloaded = false

  updateInProgress = false

  unzipStatus?: {
    done: number
    total: number
    percentage: number
  }

  constructor() {
    this.api = create({
      baseURL: UPDATER_URL,
      // baseURL: 'http://localhost:3300',
    })
  }

  public getMinecraftPath() {
    const appPath = app.getPath('userData')
    return path.join(appPath, '../', this.APPDATA_DIR)
  }

  public getCustomModsPath() {
    const dirPath = path.resolve(this.getMinecraftPath(), 'custom_mods')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    return dirPath
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

    fs.writeFileSync(path.join(this.getMinecraftPath(), 'extract.txt'), 'done')
    return true
  }

  public getPatchState(): PatchesDTO {
    const dirPath = this.getModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const customMods = this.getCustomPlayerMods()
    log.info("List of player's custom mods: ", customMods)

    const files = fs.readdirSync(dirPath).filter(it => !customMods.includes(it))

    log.info('List of mods for diff:', files)

    const patches: PatchDTO[] = files.map(file => {
      const fullpath = path.join(dirPath, file)
      try {
        const fileBuffer = fs.readFileSync(fullpath)
        const hashSum = crypto.createHash('sha256')
        hashSum.update(fileBuffer)
        return {
          filename: file,
          hash: hashSum.digest('hex'),
        }
      } catch (e){
        return null;
      }
    }).filter(Boolean) as PatchDTO[]
    return {
      files: patches,
    }
  }

  public async downloadMinecraftZip() {
    const downloadUrl = `${CDN_URL}/1.16.5-fabric.zip`
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
    const files = fs.readdirSync(dirPath)
    return files
  }

  public async updateMods() {
    this.updatesDone = 0
    this.updatesNeeded = 0
    const diff = await this.getDiff()
    if (!diff) return
    log.info('Update from server: ', diff)

    this.updatesNeeded = diff.files.length
    this.notifyUpdate()

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
      removeOnFail: true,
      retry: {
        maxRetries: 2,
        delay: 500
      }
    });

    return dl.start().then(() => this.onUpdated()).catch()
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

  private async updateServersDat() {
    const sDatPath = path.join(this.getMinecraftPath(), 'servers.dat')
    const ip = this.GAME_IP
    return new Promise((resolve, reject) => {
      const rightValue = {
        name: '',
        value: {
          servers: {
            type: 'list',
            value: {
              type: 'compound',
              value: [
                {
                  ip: {
                    type: 'string',
                    value: ip,
                  },
                  name: {
                    type: 'string',
                    value: 'Kingdom RPG',
                  },
                  acceptTextures: {
                    type: 'byte',
                    value: 1,
                  },
                },
              ],
            },
          },
        },
      }

      const some = nbt.writeUncompressed(rightValue)
      fs.writeFileSync(sDatPath, Buffer.from(some))

      resolve(true)
    })
  }

  async manageUpdates() {
    if(this.updateInProgress) return;
    if(this.isGameRunning) return;

    this.updateInProgress = true
    log.info('Updating servers.dat...')
    try {
      await this.updateServersDat()
      log.info('Updated servers.dat file')
    } catch (e) {
      log.error('There was an issue updateing servers.dat file')
      log.error(e)
    }
    log.info('Checking for updates.')
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
        log.error(e)
        log.info('Deleting zip and restarting install process')
        fs.unlinkSync(path.join(this.getMinecraftPath(), '1.16.5-fabric.zip'))
        // If we have a corrupt array
        await this.manageUpdates()
        return
      }
    } else {
      log.info('Zip already unpacked!')
    }
    try{
      await this.updateMods()
    }catch (e){
      // whops
      log.error('We had an issue updating mods...')
      log.error(e)
    }
    this.updateInProgress = false
  }

  public startPeriodicUpdates() {
    // every 30 secs
    setInterval(() => {
      if (!this.updateInProgress) {
        this.manageUpdates()
      }
    }, 10_000)
  }
}

export default new UpdateManager()
