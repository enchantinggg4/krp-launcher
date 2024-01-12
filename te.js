const crypto = require('mz/crypto')
// const a = {
//     name: 'net.fabricmc:intermediary:1.19.2',
//     url: 'https://maven.fabricmc.net/',
//     sha1: 'e9852a6227fd3dae2484d2368d0c6092ca438481',
//     size: 561002
// }


async function f() {
    let res = await fetch(`http://192.168.31.176:3300/updater/pack`).then(it => it.json())

    res = res.map(it => ({
        ...it,
        url: `http://192.168.31.176:3300/static/${it.name}`
    }))

    console.log(res)
}


f()