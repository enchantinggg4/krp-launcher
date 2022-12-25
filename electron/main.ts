import {app, autoUpdater, BrowserWindow, ipcMain, shell} from 'electron'
import UpdateManager from './Update.manager'
import {ping} from 'minecraft-server-ping'
import LauncherManager from './Launcher.manager'
import ConfigManager from './Config.manager'
import * as path from "path";

const isDev = require('electron-is-dev')

export let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const setupUpdater = () => {
  const server = 'https://krp-launcher-2.vercel.app'
  const url = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL({ url })
  autoUpdater.checkForUpdates()

  autoUpdater.addListener('update-available', () => {
    console.log('[AutoUpdater] Update available!')
    mainWindow?.webContents?.send('update-available');
  });
  autoUpdater.addListener('update-downloaded', () => {
    console.log('[AutoUpdater] Update downloaded')
    mainWindow?.webContents?.send('update-downloaded');
  });
  
}

if (!isDev) {
  setupUpdater()
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false
  }

  const ChildProcess = require('child_process')
  const path = require('path')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = function (command: any, args: any) {
    let spawnedProcess, error

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true })
    } catch (error) {}

    return spawnedProcess
  }

  const spawnUpdate = function (args: any) {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit()
      return true
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  mainWindow.removeMenu()
  // mainWindow.webContents.openDevTools();

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  mainWindow?.webContents?.send('version', app.getVersion())
  ipcMain.on('message', async (evt, message) => {
    const msg = JSON.parse(message)
    if (msg.type == 'ping') {
      const data = await ping(UpdateManager.GAME_IP, 25565)
      // ipcMain.send("online", )
      evt.reply('online', {
        max: data.players.max,
        online: data.players.online,
      })
    } else if (msg.type == 'reinstall') {
      await UpdateManager.manageUpdates()
    } else if (msg.type == 'update_config') {
      console.log(msg)
      ConfigManager.updateConfig(msg.partial)
    } else if (msg.type == 'update_username') {
      ConfigManager.setUsername(msg.username)
    } else if (msg.type == 'update_password') {
      ConfigManager.setPassword(msg.password)
    } else if (msg.type == 'update_token') {
      ConfigManager.setToken(msg.token)
    } else if (msg.type == 'init') {
      ConfigManager.sendUpdate()
      await UpdateManager.manageUpdates()
      UpdateManager.startPeriodicUpdates();
    } else if (msg.type == 'launch') {
      await LauncherManager.launch(msg)
    } else if (msg.type == 'open-discord') {
      await shell.openExternal(msg.url)
    }  else if (msg.type == 'accept_rules') {
      await ConfigManager.acceptRules()
    } else if (msg.type == 'open-log') {
      await shell.showItemInFolder(path.join(app.getPath("userData"), "logs", "main.log"))
    } else if (msg.type == 'open_directory') {
      await shell.showItemInFolder(UpdateManager.getCustomModsPath())
    } else if (msg.type == 'get_version') {
      mainWindow?.webContents?.send('version', app.getVersion())
    }
  })
}

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
} else {
  app
    .on('ready', createWindow)
    .whenReady()
    .then(registerListeners)
    .catch(e => console.error(e))

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}
