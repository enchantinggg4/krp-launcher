import fs from "fs";
import path from "path";
import ConfigManager from "./Config.manager";
import UpdateManager from "./Update.manager";
import { exec, spawn } from "child_process"
import {escapePath} from "./escape";
import {mainWindow} from "./main";

class LauncherManager {
  generateClasspath() {
    let jars: string[] = []

    function fillClasspath(dir: string, pref = '') {
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
      })
    }

    fillClasspath(path.join(UpdateManager.getMinecraftPath(), 'libraries'))
    jars = jars.map(jar => `libraries/${jar}`)
    return jars
  }

  getNativesLocation(){
    return path.join(UpdateManager.getMinecraftPath(), "natives")
  }

  getAssetsLocation(){
    return path.join(UpdateManager.getMinecraftPath(), "assets")
  }

  launch(msg: any) {
    let cpDelimeter = ';'
    if (process.platform === 'darwin') cpDelimeter = ':'
    else if (process.platform === 'win32') cpDelimeter = ';'

    const classpathJars = [...this.generateClasspath(), '1.16.5.jar'].map(it => escapePath(path.join(UpdateManager.getMinecraftPath(), it)))
    const classPathNotation = classpathJars.join(cpDelimeter)


    const javaExecutableLocation = 'java'

    const mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient'

    const command = `${javaExecutableLocation} -XstartOnFirstThread ` +
      `-Djava.library.path=${escapePath(this.getNativesLocation())} -cp ${classPathNotation} ${mainClass} ` +
      `--accessToken ${ConfigManager.config.username} --username ${ConfigManager.config.username} --version 1.16.5 --assetsDir ${escapePath(this.getAssetsLocation())} --gameDir ${escapePath(UpdateManager.getMinecraftPath())} -assetIndex 1.16`
    console.log(command)
    const child = exec(command, (error, stdout, stderr) => {

    });

    mainWindow?.hide();

    child.addListener('close', () => {
      mainWindow?.show()
    });
  }
}

export default new LauncherManager()
