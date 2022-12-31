import fs from 'fs'
import path from 'path'
import ConfigManager from './Config.manager'
import UpdateManager from './Update.manager'
import { exec, spawn } from 'child_process'
import { escapePath } from './escape'
import { mainWindow } from './main'
import log from 'electron-log'
import reportError from './reportError'
import iconv from "iconv-lite"

const magicArray2 = [
  "libraries/net/fabricmc/tiny-mappings-parser/0.3.0+build.17/tiny-mappings-parser-0.3.0+build.17.jar",
  "libraries/net/fabricmc/sponge-mixin/0.10.2+mixin.0.8.4/sponge-mixin-0.10.2+mixin.0.8.4.jar",
  "libraries/net/fabricmc/tiny-remapper/0.6.0/tiny-remapper-0.6.0.jar",
  "libraries/net/fabricmc/access-widener/2.0.0/access-widener-2.0.0.jar",
  "libraries/net/fabricmc/intermediary/1.16.5/intermediary-1.16.5.jar",
  "libraries/net/fabricmc/fabric-loader/0.12.12/fabric-loader-0.12.12.jar",

  "libraries/org/ow2/asm/asm/9.2/asm-9.2.jar",
  "libraries/org/ow2/asm/asm-analysis/9.2/asm-analysis-9.2.jar",
  "libraries/org/ow2/asm/asm-commons/9.2/asm-commons-9.2.jar",
  "libraries/org/ow2/asm/asm-tree/9.2/asm-tree-9.2.jar",
  "libraries/org/ow2/asm/asm-util/9.2/asm-util-9.2.jar",

  "libraries/com/mojang/javabridge/1.0.22/javabridge-1.0.22.jar",
  "libraries/com/mojang/brigadier/1.0.17/brigadier-1.0.17.jar",
  "libraries/com/mojang/datafixerupper/4.0.26/datafixerupper-4.0.26.jar",
  "libraries/com/mojang/text2speech/1.11.3/text2speech-1.11.3.jar",

  "libraries/org/lwjgl/lwjgl/3.2.2/lwjgl-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-jemalloc/3.2.2/lwjgl-jemalloc-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-openal/3.2.2/lwjgl-openal-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-opengl/3.2.2/lwjgl-opengl-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-glfw/3.2.2/lwjgl-glfw-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-stb/3.2.2/lwjgl-stb-3.2.2.jar",
  "libraries/org/lwjgl/lwjgl-tinyfd/3.2.2/lwjgl-tinyfd-3.2.2.jar",

  "libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar",
  "libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar",
  "libraries/net/java/dev/jna/jna/4.4.0/jna-4.4.0.jar",
  "libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar",
  "libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar",

  "libraries/com/google/code/gson/gson/2.8.0/gson-2.8.0.jar",
  "libraries/com/google/guava/guava/21.0/guava-21.0.jar",
  "libraries/com/ibm/icu/icu4j/66.1/icu4j-66.1.jar",
  
  "libraries/commons-codec/commons-codec/1.10/commons-codec-1.10.jar",
  "libraries/commons-io/commons-io/2.5/commons-io-2.5.jar",
  "libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar",

  "libraries/org/tlauncher/authlib/2.0.28.12/authlib-2.0.28.12.jar",
  "libraries/org/tlauncher/patchy/1.3.9/patchy-1.3.9.jar",

  "libraries/org/apache/commons/commons-lang3/3.5/commons-lang3-3.5.jar",
  "libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar",
  "libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar",
  "libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar",
  "libraries/org/apache/logging/log4j/log4j-api/2.8.1/log4j-api-2.8.1.jar",
  "libraries/org/apache/logging/log4j/log4j-core/2.8.1/log4j-core-2.8.1.jar",

  "libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar",
  "libraries/io/netty/netty-all/4.1.25.Final/netty-all-4.1.25.Final.jar",
  "libraries/it/unimi/dsi/fastutil/8.2.1/fastutil-8.2.1.jar",
  
  "versions/1.16.5/1.16.5.jar"
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
          log.info(path.join(dir, file))
          fillClasspath(path.join(dir, file), path.join(pref, file))
        }
      })
    }

    fillClasspath(path.join(UpdateManager.getMinecraftPath(), 'libraries'))
    jars = jars.map(jar => `libraries/${jar}`)
    return jars
  }

  getNativesLocation() {
    return path.join(
      UpdateManager.getMinecraftPath(),
      'versions/1.16.5/natives'
    )
  }

  getAssetsLocation() {
    return path.join(UpdateManager.getMinecraftPath(), 'assets')
  }

  private insertCustomMods() {
    const dirPath = UpdateManager.getCustomModsPath()
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const files = fs.readdirSync(dirPath)
    const outPath = UpdateManager.getModsPath()

    files.forEach(file => {
      const fullPath = path.join(dirPath, file)
      fs.copyFileSync(fullPath, path.join(outPath, file))
      log.info(`Copied custom mod ${file} to mods directory`)
    })
  }

  constructJvmArguments() {
    const args = []
    const config = ConfigManager.config

    if (config.minRamGb) {
      args.push(`-Xms${config.minRamGb}G`)
    }

    if (config.maxRamGb) {
      args.push(`-Xmx${config.maxRamGb}G`)
    }
    if (config.useg1gc) {
      args.push(`-XX:+UseG1GC`)
    }
    if (config.unlockExperimental) {
      args.push(`-XX:+UnlockExperimentalVMOptions`)
    }

    // Xmx6g
    return args.join(` `)
  }

  async launch(msg: any) {
    // Ok here we need to set token to config
    const p = path.join(
      UpdateManager.getMinecraftPath(),
      'config',
      'kingdomrpg-client.json'
    )
    if (!fs.existsSync(p)) {
      fs.writeFileSync(
        p,
        JSON.stringify({ token: ConfigManager.config.token }),
        { flag: 'w+' }
      )
    } else {
      fs.writeFileSync(p, JSON.stringify({ token: ConfigManager.config.token }))
    }

    // now we can start

    let cpDelimeter = ';'
    if (process.platform === 'darwin') cpDelimeter = ':'
    else if (process.platform === 'win32') cpDelimeter = ';'

    const classpathJars = magicArray2.map(it =>
      escapePath(path.join(UpdateManager.getMinecraftPath(), it))
    )
    const classPathNotation = classpathJars.join(cpDelimeter)

    const javaExecutableLocation = escapePath(
      path.join(
        UpdateManager.getMinecraftPath(),
       'runtime/java-runtime-gamma/windows/java-runtime-gamma/bin/java.exe'
      )
    )

    const mainClass = 'net.fabricmc.loader.impl.launch.knot.KnotClient'

    const javaArguments = this.constructJvmArguments()

    log.info(`Java arguments: ${javaArguments}`)

    this.insertCustomMods()

    let command =
      `${javaExecutableLocation} ` +
      `${javaArguments} ` +
      `-Djava.library.path=${escapePath(
        this.getNativesLocation()
      )} -cp ${classPathNotation} ${mainClass} ` +
      `--accessToken ${ConfigManager.config.username} --username ${
        ConfigManager.config.username
      } --version 1.16.5 --assetsDir ${escapePath(
        this.getAssetsLocation()
      )} --gameDir ${escapePath(
        UpdateManager.getMinecraftPath()
      )} -assetIndex 1.16`

    log.info('Full launch command:')
    log.info(command);

    fs.writeFileSync(path.join(UpdateManager.getMinecraftPath(), "run.bat"), command);

    // command = fs.readFileSync(path.join(UpdateManager.getMinecraftPath(), "run.bat"), "utf-8");

    
    const decode = (obj: any) => {
      return iconv.decode(Buffer.from(obj, 'binary'), 'cp866')
    }

    const child = exec(command, { encoding: "binary"}, (error, stdout, stderr) => {
      const decodedOut = decode(stdout);
      const decodedErr = decode(stderr);
      log.info(decodedOut);
      log.error(decodedErr);
    });

    mainWindow?.hide()
    UpdateManager.isGameRunning = true;
    // TODO: disable updates

    child.addListener('close', () => {
      mainWindow?.show()
      UpdateManager.isGameRunning = false;
      // TODO: enable updates again
    })
  }
}

export default new LauncherManager()
