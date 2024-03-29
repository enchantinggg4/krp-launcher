import WrapClient from "./wrapper/wrap_client"
import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import fabric from './wrapper/fabric'
import { mainWindow, sendToWeb } from "../main"
import { isContextRunning, useSingleContext } from "./helper"
import log from 'electron-log'
import ConfigManager from "./ConfigManager"
import { GAMESERVER_IP, GAMESERVER_PORT, UPDATER_URL } from "../frontend/config"

const mcping = require('mcping-js')

class UpdateManager {
    APPDATA_DIR = '.kingdomrpg'


    updatePromise = null;
    runningGame = null;


    gameState = {
        running: false,
        isUpdating: false
    }

    constructor() {
        const javaArgs = [
            '-XX:-UseAdaptiveSizePolicy',
        ]
        this.isPreparing = false;
        this.wrap = new WrapClient(this.getMinecraftPath(), this.getVersion(), this.getOs(), javaArgs);
        this.wrap.on('queue_state', msg => {
            sendToWeb('prepare_state', msg)
        });

        this.server = new mcping.MinecraftServer(GAMESERVER_IP, GAMESERVER_PORT);

        this.ping();
        setInterval(async () => {
            await this.ping();
            if (isContextRunning('prepare') || isContextRunning('play')) {
                return;
            }
            await this.preparePatch()

        }, 10_000)
    }

    async ping() {


        this.server.ping(2000, '760', (err, res) => {
            if (!err) {
                sendToWeb('gsping', {
                    max: res.players.max,
                    online: res.players.online,
                })
            }
        })




    }

    getMinecraftPath() {
        const appPath = app.getPath('userData')
        return path.join(appPath, '../', this.APPDATA_DIR)
    }

    getVersion() {
        return '1.19.2'
    }

    getOs() {
        return 'windows'
    }

    // We need to cancel shit we had before
    async prepareGame() {
        return useSingleContext('prepare', () => {
            return new Promise(async (resolve, reject) => {
                sendToWeb('is_prepared', false);
                this.wrap.launcher.comment = "game"
                // Install game
                await this.wrap.prepare();
                // Install fabric
                await this.installFabric();
                // Install stuff from updater
                this.wrap.launcher.comment = "game"
                await this.preparePatch();
                log.info('Game prepared')
                sendToWeb('is_prepared', true);
                resolve();
            });
        })

    }


    async installFabric() {
        this.wrap.launcher.comment = "fabric"
        await this.wrap.installFabric(fabric)
    }

    async injectConfig() {

        // Create config folder if fresh run
        this.createDir('config')

        const p = path.join(
            this.getMinecraftPath(),
            'config',
            'kingdomrpg-client.json'
        )
        const cfg = {
            token: ConfigManager.config.token,
            baseUrl: UPDATER_URL
        }
        log.info(p)
        log.info(JSON.stringify(cfg))
        if (!fs.existsSync(p)) {
            fs.writeFileSync(
                p,
                JSON.stringify(cfg),
                { flag: 'w+' }
            )
        } else {
            fs.writeFileSync(p, JSON.stringify(cfg))
        }
        log.info('Config injected with token');
    }


    async preparePatch() {
        if (ConfigManager.config.disableModSync) {
            log.info("Ignoring patching(config set)")
            return Promise.resolve();
        }
        await useSingleContext('prepareMods', async () => {
            this.createDir('mods')

            let res = await fetch(`${UPDATER_URL}/updater/pack`).then(it => it.json())

            res = res.map(it => ({
                ...it,
                url: `${UPDATER_URL}/static/${it.path}`,
                path: path.join(this.getMinecraftPath(), it.path)
            }))
            const getAsset = (artifact) => {
                const { url, path, size, sha1 } = artifact
                return this.wrap.launcher.downloadFile(url, path, size, sha1)
            }

            const mods = res.map(async (mod) => getAsset(mod));

            // Delete all extra
            const listOfAllMods = fs.readdirSync(path.join(this.getMinecraftPath(), 'mods'));

            const cleans = listOfAllMods.filter(it => it.endsWith('jar')).map(it => {
                if (!res.find(good => good.name == it)) {
                    return fs.promises.unlink(path.join(this.getMinecraftPath(), 'mods', it))
                }
                return null
            }).filter(Boolean)

            await Promise.all(cleans)

            log.info(`Removed ${cleans.length} unwanted mods`)

            try {
                const updatedMods = await Promise.all(mods)
                log.info(`Mod sync complete for ${updatedMods.length} mods`)
            }
            catch (e) {
                log.error(`There was issue updating: `)
                log.error(e)
            }
        })
    }

    async playGame() {
        if (isContextRunning('prepare'))
            return;

        return useSingleContext('play', () => {


            const listener = () => {
                log.info("Received game-window-show event, hiding launcher");
                mainWindow?.hide();
                sendToWeb('game_launching', false)
                sendToWeb('game_running', true)
            }
            this.wrap.addListener("game-window-show", listener);

            sendToWeb('game_launching', true)
            return this.wrap.start({
                accessToken: ConfigManager.config.username,
                username: ConfigManager.config.username,
                authToken: ConfigManager.config.token
            }).then(() => {
                log.info('Game closed')
                sendToWeb('game_running', false)
                sendToWeb('game_launching', false)
            }).finally(() => {
                sendToWeb('game_running', false);
                sendToWeb('game_launching', false)
                log.info('Re-opening launcher')
                mainWindow?.show();
                this.wrap.removeListener("game-window-show", listener);
            })
        })

    }


    async stopGame() {
        await this.wrap.stop().then(() => sendToWeb('game_state', false))
    }


    createDir(name) {
        const dir = path.join(this.getMinecraftPath(), name)
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, true)
    }
}

export default new UpdateManager();