import EventEmitter from 'events'
import LauncherDownload from './launcher_download'
import { execFile, spawn } from 'child_process'
import assert from 'assert'

import extract from 'extract-zip'
import { useSingleContext } from '../helper'

import log from 'electron-log'

export default class WrapClient extends EventEmitter {
    constructor(clientPath, version, os, javaArgs = [], maxMem = 8192, doneRegex = /\[.+\]: Narrator library successfully loaded/) {
        super()
        this.clientPath = clientPath
        this.maxMem = maxMem
        this.doneRegex = doneRegex
        this.os = os;
        this.version = version
        this.javaArgs = [
            '-XX:+OptimizeStringConcat',
            '-XX:-OmitStackTraceInFastThrow',
            '-Dfml.ignoreInvalidMinecraftCertificates=true',
            '-XX:+UnlockExperimentalVMOptions',
            '-XX:+AlwaysPreTouch'
        ]
        this.launcher = new LauncherDownload(this.clientPath, os)
        this.launcher.on('queue_state', (e) => this.emit('queue_state', e))
    }

    async installFabric(version) {
        // Install libraries
        await this.launcher._getLibraries(version.libraries).then(libraries => {
            this.additionalLibraries = libraries;
        })
        // Update main class
        this.mainClass = version.mainClass

    }


    javaPath() {
        return this.launcher.mcPath + '/runtime/java-runtime-gamma/windows/java-runtime-gamma/bin/java.exe'
    }

    javaversion() {
        const path = this.javaPath()
        return new Promise((resolve, reject) => {
            execFile(path, ['-version'], function (err, stdout, stderr) {
                console.log("ERR:", err);
                console.log("STD:", stdout);
                console.log("STDERR:", stderr);

                if (err != null) {
                    reject(err);
                }



                const lines = stderr.split("\n")
                for (let data of lines) {
                    var javaVersion = new RegExp('openjdk version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
                    if (javaVersion != false) {
                        // TODO: We have Java installed
                        resolve(javaVersion);
                        return;
                    }
                };



                reject("No java found")

            })
        });
    }

    prepareJVM() {
        const jvmLib = {
            name: 'java-runtime-gamma.zip',
            url: 'https://github.com/enchantinggg4/krp-launcher/raw/main/assets/java-runtime-gamma.zip',
            size: 70348340,
            sha1: '1d255bfd2c5ce99352632b3e6c4f3571fbb7d5e6'
        }

        return useSingleContext('prepareJvm', () => {
            return this.javaversion().catch((e) => {
                log.info('No java found, error below:')
                log.info(e)
                const path = this.launcher.mcPath + '/runtime/' + jvmLib.name
                return this.launcher.downloadFile(jvmLib.url, path, jvmLib.size, jvmLib.sha1).then(() => {
                    log.info('JVM runtime downloaded')
                    // File is downloaded
                    // We need to extract it now
                    return extract(path, {
                        dir: this.launcher.mcPath + '/runtime'
                    })
                })
            }).then(() => this.javaversion()).then(jversion => {
                log.info("Installed java version(should match 17.0.3): " + jversion)
                assert.strictEqual('17.0.3', jversion);
            })
        })
    }

    prepare() {
        return this.launcher.getWholeClient(this.version).then(({ client, libraries, nativesPath }) => {
            this.minecraftJar = client
            this.libraries = libraries
            this.nativesPath = nativesPath
            return this.launcher.getVersionInfos(this.version)
        }).then(versionInfo => {
            this.mainClass = versionInfo.mainClass
            this.minecraftArguments = versionInfo.minecraftArguments
        })
    }

    start(additionalArgs) {
        return new Promise((resolve) => {
            const java = this.javaPath()
            const maxRam = this.maxMem
            const maxNewSize = '128'
            const nativeLibraryPath = this.nativesPath

            const cpDelimeter = this.os == 'windows' ? ';' : ':'
            const allLibrariesJar = this.libraries.join(cpDelimeter)
            const additionalLibraries = (this.additionalLibraries || []).join(cpDelimeter)
            const minecraftJar = this.minecraftJar
            const mainClass = this.mainClass

            /* eslint-disable no-unused-vars */
            /* eslint-disable camelcase */
            const auth_player_name = this.auth_player_name
            const version_name = this.version
            const game_directory = this.clientPath
            const assets_root = this.clientPath + '/assets'
            const assets_index_name = this.version
            const auth_uuid = this.auth_uuid
            const auth_access_token = this.auth_access_token
            const user_type = 'legacy'
            const version_type = 'release'
            // <= 1.8
            const user_properties = this.userProperties ? JSON.stringify(this.userProperties) : '{}'
            // <= 1.6
            const game_assets = assets_root
            const auth_session = auth_access_token
            /* eslint-enable no-unused-vars */
            /* eslint-enable camelcase */

            const addArgs = Object.entries(additionalArgs).flatMap(([key, value]) => ([`--${key}`, value]))

            const args = [
                '-Xmx' + maxRam + 'M',
                ...this.javaArgs,
                '-Xmn' + maxNewSize + 'M',
                '-Djava.library.path=' + nativeLibraryPath,
                '-cp',
                [allLibrariesJar, additionalLibraries, minecraftJar].join(cpDelimeter),
                mainClass,
                '--version',
                this.version,
                '--assetsDir',
                `${this.clientPath}/assets`,
                '--gameDir',
                `${this.clientPath}`,
                '-assetIndex',
                this.version,
                ...addArgs
            ]

            this.client = spawn(java, args, {
                stdio: 'pipe',
                cwd: this.clientPath + '/..'
            })


            log.info(`Full start command`)
            log.info(`${java} ${args.join(' ')}`)
            this.client.addListener('close', resolve);
            this.client.stdin.setEncoding('utf8')
            this.client.stdout.setEncoding('utf8')
            this.client.stderr.setEncoding('utf8')
            let buffer = ''
            this.client.stdout.on('data', onData)
            this.client.stderr.on('data', onData)

            const self = this
            function onData(data) {
                buffer += data
                const lines = buffer.split('\n')
                lines.forEach(line => {
                    const clean = line.trim()
                    if (clean.length > 1) {
                        log.info(clean)
                        const isok = line.includes("[voicechat] Loading Opus")
                        if (isok) {
                            log.info("Telling launcher to hide")
                            self.emit("game-window-show")
                        }
                    }
                })
                const len = lines.length - 1
                for (let i = 0; i < len; ++i) {
                    self.client.emit('line', lines[i])
                }
                buffer = lines[lines.length - 1]
            }

            this.client.on('line', onLine)
            this.client.on('line', (line) => {
                process.stderr.write('.')
                this.emit('line', line)
            })
            function onLine(line) {
                const regex = self.doneRegex

                const gameLaunchingRegex = /Setting user/

                if (regex.test(line)) {
                    self.client.removeListener('line', onLine)
                }

            }


        })
    }

    stop() {
        return new Promise((resolve) => {
            if (!this.client) {
                resolve()
                return
            }
            this.client.kill()
            this.client.on('close', () => {
                this.client = null
                resolve()
            })
        })
    }
}
