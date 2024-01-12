import { EventEmitter } from 'events'
import fetch from 'node-fetch'
import fs from 'mz/fs'
import crypto from 'mz/crypto'
import assert from 'assert'
import Queue from 'promise-queue'
import flatmap from 'flatmap'
import extract from 'extract-zip'
import { mkdirp } from 'mkdirp'
// http://wiki.vg/Game_files

const debug = console.log

export default class LauncherDownload extends EventEmitter {
    // linux,osx or windows
    constructor(mcPath, os = 'linux') {
        super();
        this.queue = new Queue(10, Infinity)
        this.pathsPromises = {}
        this.mcPath = mcPath
        this.os = os
        this.versionsInfos = {}
        this.assetIndexes = {}
        this.failed = 0;
        this.maxTotal = 0;
    }

    getWholeClient(version) {
        this.maxTotal = 0;
        this.pathsPromises = {}
        return Promise.all([
            this.getClient(version),
            this.getAllAssets(version),
            this.getLibraries(version).then(l => this.extractNatives(version).then(p => [l, p]))
        ]).then(([client, assets, [libraries, nativesPath]]) => (
            { client, assets, libraries, nativesPath }))
    }

    getVersionsList() {
        if (this.versionsList) { return Promise.resolve(this.versionsList) }
        return fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
            .then(res => res.json()).then((json) => {
                this.versionsList = json
                return json
            })
    }

    getVersionInfos(version) {
        if (this.versionsInfos[version]) { return Promise.resolve(this.versionsInfos[version]) }
        return this.getVersionsList()
            .then(versionsList => {
                const versionInfos = versionsList.versions.find(({ id }) => id === version)
                const versionUrl = versionInfos.url
                const path = `${this.mcPath}/versions/${version}/${version}.json`
                return this.downloadFile(versionUrl, path, null, null).then(() => path)
            })
            .then(path => fs.readFile(path, 'utf8'))
            .then(data => {
                const parsed = JSON.parse(data)
                this.versionsInfos[version] = parsed
                return parsed
            })
    }

    getAssetIndex(version) {
        if (this.assetIndexes[version]) { return Promise.resolve(this.assetIndexes[version]) }
        return this.getVersionInfos(version)
            .then(versionInfo => {
                const { url, size, sha1 } = versionInfo.assetIndex
                return this.downloadFile(url, this.mcPath + '/assets/indexes/' + version + '.json', size, sha1)
            })
            .then(path => fs.readFile(path, 'utf8'))
            .then(data => {
                const parsed = JSON.parse(data)
                this.assetIndexes[version] = parsed
                return parsed
            })
    }

    getAllAssets(version) {
        return this.getAssetIndex(version).then(assetIndex => {
            return Promise.all(Object.keys(assetIndex.objects)
                .map(assetFile => this.getAsset(assetFile, version)))
        })
    }

    getAsset(assetFile, version) {
        return this.getAssetIndex(version).then(assetIndex => {
            const { hash: sha1, size } = assetIndex.objects[assetFile]
            const subPath = sha1.substring(0, 2) + '/' + sha1
            const url = 'https://resources.download.minecraft.net/' + subPath
            return this.downloadFile(url, this.mcPath + '/assets/objects/' + subPath, size, sha1)
        })
    }

    getClient(version, path = this.mcPath + '/versions/' + version + '/' + version + '.jar') {
        return this.getVersionInfos(version)
            .then(versionInfo => {
                const { url, size, sha1 } = versionInfo.downloads.client
                return this.downloadFile(url, path, size, sha1)
            })
    }

    getServer(version, path = this.mcPath + '/servers/' + version + '/' + version + '.jar') {
        return this.getVersionInfos(version)
            .then(versionInfo => {
                const { url, size, sha1 } = versionInfo.downloads.server
                return this.downloadFile(url, path, size, sha1)
            })
    }

    extractNatives(version) {
        const nativesPath = this.mcPath + '/versions/' + version + '/' + version + '-natives'
        return mkdirp(nativesPath)
            .then(() => this.getVersionInfos(version))
            .then(versionInfo => Promise.all(versionInfo.libraries
                .filter(lib => lib.extract !== undefined)
                .filter(lib => !this._parseLibRules(lib.rules) && lib.downloads.classifiers['natives-' + this.os])
                .map(lib => {
                    const { path } = lib.downloads.classifiers['natives-' + this.os]
                    const nativePath = this.mcPath + '/libraries/' + path
                    return extract(nativePath, { dir: nativesPath })
                })))
            .then(() => nativesPath)
    }

    _parseLibRules(rules) {
        let skip = false
        if (rules) {
            skip = true
            rules.forEach(({ action, os }) => {
                if (action === 'allow' && ((os && os.name === this.os) || !os)) { skip = false }

                if (action === 'disallow' && ((os && os.name === this.os) || !os)) { skip = true }
            })
        }
        return skip
    }

    _getLibraries(libList) {
        return Promise.all(flatmap(libList, lib => {
            if (this._parseLibRules(lib.rules)) { return [] }

            const getLib = (artifact) => {
                const { url, path, size, sha1 } = artifact
                return this.downloadFile(url, this.mcPath + '/libraries/' + path, size, sha1)
                    .then(r => fs.writeFile(this.mcPath + '/libraries/' + path + '.sha', sha1).then(() => r))
            }
            const results = []
            if (lib.downloads.artifact) { results.push(getLib(lib.downloads.artifact)) }
            if (lib.downloads.classifiers && lib.downloads.classifiers['natives-' + this.os]) { results.push(getLib(lib.downloads.classifiers['natives-' + this.os])) }
            return results
        }))
    }

    getLibraries(version) {
        return this.getVersionInfos(version)
            .then(versionInfo => {
                return Promise.all(flatmap(versionInfo.libraries, lib => {
                    if (this._parseLibRules(lib.rules)) { return [] }

                    const getLib = (artifact) => {
                        const { url, path, size, sha1 } = artifact
                        return this.downloadFile(url, this.mcPath + '/libraries/' + path, size, sha1)
                            .then(r => fs.writeFile(this.mcPath + '/libraries/' + path + '.sha', sha1).then(() => r))
                    }
                    const results = []
                    if (lib.downloads.artifact) { results.push(getLib(lib.downloads.artifact)) }
                    if (lib.downloads.classifiers && lib.downloads.classifiers['natives-' + this.os]) { results.push(getLib(lib.downloads.classifiers['natives-' + this.os])) }
                    return results
                }))
            })
    }

    queue_state() {
        this.maxTotal = Math.max(this.queue.getQueueLength(), this.maxTotal);
        const state = {
            maxTotal: this.maxTotal,
            total: this.queue.getQueueLength(),
            pending: this.queue.getPendingLength(),
            failed: this.failed,
            done: false
        }
        this.emit('queue_state', state);
    }


    downloadFile(url, path, size, sha1) {
        assert.notStrictEqual(url, undefined)
        if (this.pathsPromises[path]) return this.pathsPromises[path]
        const p = checkFile(path, size, sha1)
            .catch(err => {
                // debug(err)
                const parts = path.split('/')
                parts.pop()
                const dirPath = parts.join('/')
                return mkdirp(dirPath)
                    .then(() => {
                        const p = this.queue.add(() => new Promise((resolve, reject) => {
                            fetch(url).then(res => {
                                const fileStream = fs.createWriteStream(path)
                                res.body.pipe(fileStream)
                                res.body.on('error', err => {
                                    reject(err)
                                    this.failed += 1;
                                    this.queue_state()
                                })
                                fileStream.on('finish', () => {
                                    resolve()
                                    this.queue_state()
                                })
                            })
                        }));

                        this.queue_state()

                        return p;
                    })
                    .then(() => checkFile(path, size, sha1))
            })
        this.pathsPromises[path] = p
        return p
    }
}


function checkFile(path, size, sha1) {
    if (size == null && sha1 == null) return fs.promises.access(path)
    return fs.stat(path).then(stats => assert.strictEqual(stats.size, size, 'wrong size for ' + path))
        .then(() => fs.readFile(path))
        .then(data => assert.strictEqual(crypto.createHash('sha1').update(data).digest('hex'), sha1, 'wrong sha1 for ' + path))
        .then(() => path)
}
