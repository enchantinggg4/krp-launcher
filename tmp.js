

// const fetch = import('node-fetch')

const crypto = require('mz/crypto')
const a = {
    name: 'net.fabricmc:intermediary:1.19.2',
    url: 'https://maven.fabricmc.net/',
    sha1: 'e9852a6227fd3dae2484d2368d0c6092ca438481',
    size: 561002
}

const remapFabric = (ver) => {
    return {
        ...ver,
        libraries: ver.libraries.map(it => {
            const s = it.name.split(':')
            const path = [s[0].replaceAll('.', '/'), s[1], s[2], s[1] + '-' + s[2] + '.jar'].join('/')


            return {
                name: it.name,
                downloads: {
                    artifact: {
                        path: path,
                        sha1: it.sha1,
                        size: it.size,
                        url: it.url + path
                    }

                },
                rules: it.rules,
            }
        })
    }

}

const url = `https://maven.fabricmc.net/net/fabricmc/intermediary/1.19.2/intermediary-1.19.2.jar`


fetch(url).then(it => it.arrayBuffer()).then(Buffer.from)
    .then(data => {
        console.log(
            crypto.createHash('sha1').update(data).digest('hex')
        )
        console.log(data.length)
    })
