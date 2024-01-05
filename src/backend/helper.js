const singleMap = {}

export const isContextRunning = (name) => singleMap[name]
export const useSingleContext = async (name, run) => {
    const used = singleMap[name]
    if (used) {
        // Already running
        return singleMap[name];
    }

    singleMap[name] = new Promise((resolve, reject) => {
        run().then(resolve).catch(reject).finally(() => singleMap[name] = null);
    });

    return singleMap[name];
}


export const javaversion = () => {
    return new Promise((resolve, reject) => {
        var spawn = require('child_process').spawn('java', ['-version']);
        spawn.on('error', function (err) {
            return reject();
        })
        spawn.stderr.on('data', function (data) {
            data = data.toString().split('\n')[0];
            var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
            if (javaVersion != false) {
                // TODO: We have Java installed
                return resolve(javaVersion);
            } else {
                // TODO: No Java installed
                reject()
            }
        });
    })
}