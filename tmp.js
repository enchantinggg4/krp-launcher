const { spawn } = require("child_process")

const path = `C:/Users/parad/AppData/Roaming/.kingdomrpg/runtime/java-runtime-gamma/windows/java-runtime-gamma/bin/java.exe`
var sp = spawn(path, ['-version']);
sp.on('error', function (err) {
    reject(err);
})
sp.stderr.on('data', function (data) {
    const lines = data.toString().split('\n');
    console.log("DATA:")
    console.log(data.toString())
    for (let data of lines) {
        var javaVersion = new RegExp('openjdk version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion != false) {
            // TODO: We have Java installed
            console.log('hey', javaVersion);
            return;
        }
    };

    // We haven't found 
    // TODO: No Java installed
    reject("Something wrong: did not found line with 'openjdk version'")
});