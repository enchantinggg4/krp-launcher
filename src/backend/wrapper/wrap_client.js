import EventEmitter from 'events'
import LauncherDownload from './launcher_download'
import { spawn } from 'child_process'


const debug = console.log

export default class WrapClient extends EventEmitter {
    constructor(clientPath, version, os, java, javaArgs = [], maxMem = 1024, doneRegex = /\[.+\]: Narrator library successfully loaded/) {
        super()
        this.clientPath = clientPath
        this.maxMem = maxMem
        this.doneRegex = doneRegex
        this.os = os;
        this.version = version
        this.java = java
        this.javaArgs = javaArgs
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
            const java = this.java
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

            console.log(addArgs)
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
