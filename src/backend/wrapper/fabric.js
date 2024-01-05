const j = {
    id: 'fabric-loader-0.15.3-1.19.2',
    inheritsFrom: '1.19.2',
    time: '2024-01-03T16:41:30+03:00',
    releaseTime: '2024-01-03T16:41:30+03:00',
    type: 'release',
    mainClass: 'net.fabricmc.loader.impl.launch.knot.KnotClient',
    minimumLauncherVersion: 0,
    assets: 'legacy',
    libraries: [
        {
            name: 'org.ow2.asm:asm:9.6',
            url: 'https://maven.fabricmc.net/',
            sha1: 'aa205cf0a06dbd8e04ece91c0b37c3f5d567546a',
            size: 123598
        },
        {
            name: 'org.ow2.asm:asm-analysis:9.6',
            url: 'https://maven.fabricmc.net/',
            sha1: '9ce6c7b174bd997fc2552dff47964546bd7a5ec3',
            size: 34041
        },
        {
            name: 'org.ow2.asm:asm-commons:9.6',
            url: 'https://maven.fabricmc.net/',
            sha1: 'f1a9e5508eff490744144565c47326c8648be309',
            size: 72194
        },
        {
            name: 'org.ow2.asm:asm-tree:9.6',
            url: 'https://maven.fabricmc.net/',
            sha1: 'c0cdda9d211e965d2a4448aa3fd86110f2f8c2de',
            size: 51935
        },
        {
            name: 'org.ow2.asm:asm-util:9.6',
            url: 'https://maven.fabricmc.net/',
            sha1: 'f77caf84eb93786a749b2baa40865b9613e3eaee',
            size: 91131
        },
        {
            name: 'net.fabricmc:sponge-mixin:0.12.5+mixin.0.8.5',
            url: 'https://maven.fabricmc.net/',
            sha1: '8d31fb97c3e0cd7c8dad3441851c523bcfae6d8e',
            size: 1451874
        },
        {
            name: 'net.fabricmc:intermediary:1.19.2',
            url: 'https://maven.fabricmc.net/',
            sha1: '9264b892918b70d28a1cf8bc4c07fdc6a1463628',
            size: 519553
        },
        {
            name: 'net.fabricmc:fabric-loader:0.15.3',
            url: 'https://maven.fabricmc.net/',
            sha1: '2ca88d3e40732dabca6dd01178ac04c3d675fecc',
            size: 1198587
        }
    ],
    logging: {
        client: {
            argument: '-Dlog4j.configurationFile=${path}',
            file: [Object],
            type: 'log4j2-xml'
        }
    }
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

export default remapFabric(j);