const fs = require('fs')
const path = require('path')

const p = '/Users/itachi/Downloads/1.16.5-fabric/libraries'

let jars = []

function fillClasspath(dir, pref = '') {
  const content = fs.readdirSync(dir)
  content.forEach(file => {
    if (fs.lstatSync(path.join(dir, file)).isFile()) {
      if (file.endsWith('.jar')) {
        jars.push(path.join(pref, file))
      }
    } else {
      console.log(path.join(dir, file))
      fillClasspath(path.join(dir, file), path.join(pref, file))
    }
  });
}

fillClasspath(p)
jars = jars.map(jar => `libraries/${jar}`)
console.log(jars.join(":"))
