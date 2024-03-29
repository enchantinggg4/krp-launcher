const { app, autoUpdater, BrowserWindow, ipcMain, shell, session } = require("electron")
import ConfigManager from './backend/ConfigManager'
import { IpcProxy } from './backend/IpcProxy'
import * as path from "path"
// index.js
// import './backend/fetch-polyfill'

import log from 'electron-log'
import * as Sentry from "@sentry/electron";
const isDev = require('electron-is-dev')

export let mainWindow

export function sendToWeb(message, data) {
  mainWindow.webContents.send(message, data)
}


const setupUpdater = () => {
  const server = 'https://krp-launcher-2.vercel.app'
  const url = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL({ url })
  autoUpdater.checkForUpdates()

  autoUpdater.addListener('update-available', () => {
    log.info('[AutoUpdater] Update available!')
    sendToWeb('update_available')
  });
  autoUpdater.addListener('update-downloaded', () => {
    log.info('[AutoUpdater] Update downloaded')
    sendToWeb('update_downloaded')
  });

}
if (!isDev)
  setupUpdater()


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

  const spawn = function (command, args) {
    let spawnedProcess, error

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true })
    } catch (error) { }

    return spawnedProcess
  }

  const spawnUpdate = function (args) {
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
    icon: "./appicons/icons/png/64x64.png",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  mainWindow.removeMenu()

  session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
    const fileUrl = request.url.replace('static://', '');
    log.info("HANDLE?>", fileUrl)
    const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
    log.info("Oh man ", filePath)
    callback(filePath);
  });

  if (isDev)
    mainWindow.webContents.openDevTools();

  ConfigManager.loadConfig()

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners() {
  const proxy = new IpcProxy();
  /**
   * This comes from bridge integration, check bridge.ts
   */
  mainWindow?.webContents?.send('version', app.getVersion())
  ipcMain.on('message', async (evt, msg) => {
    proxy[msg.method].call(proxy, ...msg.args);
  })
}

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
} else {



  const gotTheLock = app.requestSingleInstanceLock({});

  if (!gotTheLock) {
    app.quit()
  } else {

    Sentry.init({
      dsn: "https://ef3c1d6c02dad165010923eed3dc239d@o435989.ingest.sentry.io/4506796763316224",
    });

    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
      // Print out data received from the second instance.
      console.log(additionalData)

      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        // if we are hidden (game running) show window let it be
        if (!mainWindow.isVisible()) mainWindow.show()
        mainWindow.focus()
      }
    })

    app
      .on('ready', createWindow)
      .whenReady()
      .then(registerListeners)
      .catch(e => log.error(e))

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


}

process.on('uncaughtException', function (error) {
  // Handle the error
  log.error(error.stack)
});


process.on('unhandledRejection', (reason, p) => {
  log.error(reason)
  log.error(p)
});