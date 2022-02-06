import fs from "fs";
import path from "path";
import ConfigManager from "./Config.manager";
import UpdateManager from "./Update.manager";
import { exec, spawn } from "child_process"
import {escapePath} from "./escape";
import {mainWindow} from "./main";
import log from "electron-log"

const magicArray = [
  `libraries/net/fabricmc/tiny-mappings-parser/0.3.0+build.17/tiny-mappings-parser-0.3.0+build.17.jar`,
  `libraries/net/fabricmc/sponge-mixin/0.10.7+mixin.0.8.4/sponge-mixin-0.10.7+mixin.0.8.4.jar`,
  `libraries/net/fabricmc/tiny-remapper/0.6.0/tiny-remapper-0.6.0.jar`,
  `libraries/net/fabricmc/access-widener/2.0.1/access-widener-2.0.1.jar`,
  `libraries/org/ow2/asm/asm/9.2/asm-9.2.jar`,
  `libraries/org/ow2/asm/asm-analysis/9.2/asm-analysis-9.2.jar`,
  `libraries/org/ow2/asm/asm-commons/9.2/asm-commons-9.2.jar`,
  `libraries/org/ow2/asm/asm-tree/9.2/asm-tree-9.2.jar`,
  `libraries/org/ow2/asm/asm-util/9.2/asm-util-9.2.jar`,
  `libraries/net/fabricmc/intermediary/1.16.5/intermediary-1.16.5.jar`,
  `libraries/net/fabricmc/fabric-loader/0.12.12/fabric-loader-0.12.12.jar`,
  `libraries/org/tlauncher/patchy/1.2.3/patchy-1.2.3.jar`,
  `libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar`,
  `libraries/net/java/dev/jna/jna/4.4.0/jna-4.4.0.jar`,
  `libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar`,
  `libraries/com/ibm/icu/icu4j/66.1/icu4j-66.1.jar`,
  `libraries/com/mojang/javabridge/1.0.22/javabridge-1.0.22.jar`,
  `libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar`,
  `libraries/io/netty/netty-all/4.1.25.Final/netty-all-4.1.25.Final.jar`,
  `libraries/com/google/guava/guava/21.0/guava-21.0.jar`,
  `libraries/org/apache/commons/commons-lang3/3.5/commons-lang3-3.5.jar`,
  `libraries/commons-io/commons-io/2.5/commons-io-2.5.jar`,
  `libraries/commons-codec/commons-codec/1.10/commons-codec-1.10.jar`,
  `libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar`,
  `libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar`,
  `libraries/com/mojang/brigadier/1.0.17/brigadier-1.0.17.jar`,
  `libraries/com/mojang/datafixerupper/4.0.26/datafixerupper-4.0.26.jar`,
  `libraries/com/google/code/gson/gson/2.8.0/gson-2.8.0.jar`,
  `libraries/org/tlauncher/authlib/2.0.28.1/authlib-2.0.28.1.jar`,
  `libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar`,
  `libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar`,
  `libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar`,
  `libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar`,
  `libraries/it/unimi/dsi/fastutil/8.2.1/fastutil-8.2.1.jar`,
  `libraries/org/apache/logging/log4j/log4j-api/2.8.1/log4j-api-2.8.1.jar`,
  `libraries/org/apache/logging/log4j/log4j-core/2.8.1/log4j-core-2.8.1.jar`,
  `libraries/org/lwjgl/lwjgl/3.2.2/lwjgl-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-jemalloc/3.2.2/lwjgl-jemalloc-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-openal/3.2.2/lwjgl-openal-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-opengl/3.2.2/lwjgl-opengl-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-glfw/3.2.2/lwjgl-glfw-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-stb/3.2.2/lwjgl-stb-3.2.2.jar`,
  `libraries/org/lwjgl/lwjgl-tinyfd/3.2.2/lwjgl-tinyfd-3.2.2.jar`,
  `libraries/com/mojang/text2speech/1.11.3/text2speech-1.11.3.jar`,
  `versions/Fabric-1.16.5/Fabric-1.16.5.jar`,
]

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
    return path.join(UpdateManager.getMinecraftPath(), "versions/Fabric-1.16.5/natives")
  }

  getAssetsLocation(){
    return path.join(UpdateManager.getMinecraftPath(), "assets")
  }



  private async login() {
    const res = await UpdateManager.api.post('/auth/login', {
      username: ConfigManager.config.username,
      password: ConfigManager.config.password,
    });

    console.log(res)
  }

  async launch(msg: any) {

    await this.login()

    return;

    let cpDelimeter = ';'
    if (process.platform === 'darwin') cpDelimeter = ':'
    else if (process.platform === 'win32') cpDelimeter = ';'

    // const classpathJars = [...this.generateClasspath(), 'versions/Fabric-1.16.5/Fabric-1.16.5.jar'].map(it => escapePath(path.join(UpdateManager.getMinecraftPath(), it)))
    const classpathJars = magicArray.map(it => escapePath(path.join(UpdateManager.getMinecraftPath(), it)))
    const classPathNotation = classpathJars.join(cpDelimeter)


    //const javaExecutableLocation = 'java'
    // const javaExecutableLocation = path.join(UpdateManager.getMinecraftPath(), "runtime", "jre-legacy", "bin", "java.exe")
    const javaExecutableLocation = escapePath(path.join(UpdateManager.getMinecraftPath(), "runtime/java-runtime-beta/windows/java-runtime-beta/bin/java.exe"))


    const mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient'

    const command = `${javaExecutableLocation} ` +
      `-Djava.library.path=${escapePath(this.getNativesLocation())} -cp ${classPathNotation} ${mainClass} ` +
      `--accessToken ${ConfigManager.config.username} --username ${ConfigManager.config.username} --version 1.16.5 --assetsDir ${escapePath(this.getAssetsLocation())} --gameDir ${escapePath(UpdateManager.getMinecraftPath())} -assetIndex 1.16`
    console.log(command)
    const child = exec(command, (error, stdout, stderr) => {
      if(error){
        log.error(error.stack)
        log.error(stderr)
      }

      log.info(stdout);

    });

    mainWindow?.hide();

    child.addListener('close', () => {
      mainWindow?.show()
    });
  }
}

export default new LauncherManager()
