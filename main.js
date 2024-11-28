const {app, Menu, Tray, dialog, globalShortcut, ipcMain, BrowserWindow} = require('electron/main')
const fs = require("node:fs/promises")
const path = require("path");
const log = require('electron-log/main');
const {autoUpdater} = require("electron-updater")
const { I18n } = require('i18n')
const Ini = require("ini")
const {getCores} = require("./utils");
const os = require('os');
const tunCoreInstall = require("./tun/installCore")

log.initialize();
log.info('start logging...');


const i18n = new I18n({
  locales: ['en'],
  defaultLocale: 'en',
  retryInDefaultLocale: true,
  directory: path.join(__dirname, 'locales')
})

// ------------------- global vars ------------------------
let CONFIGS = null

// ------------------- window vars ------------------------
let mainWindow = null


const additionalData = {name: 'THEOS_APP'}
const gotTheLock = app.requestSingleInstanceLock(additionalData)



if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.maximize()
    }
  })

  app.whenReady().then(async () => {
    let configIniText = await fs.readFile(path.join(__dirname, './config.ini'),{encoding : 'utf-8'})
    CONFIGS = Ini.parse(configIniText)

    autoUpdater.autoDownload = true
    autoUpdater.checkForUpdates().then();

    createMainWindow()
    createTrayIcon()

    mainWindow.on('close', function (event) {
      if (!app.isQuiting) {
        event.preventDefault();
        mainWindow.hide();
      }
      return false;
    });
  })
}


const createTrayIcon = () => {
  const tray = new Tray(path.join(__dirname, 'assets/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {label: i18n.__("open"), type: 'normal', click: createMainWindow},
    {label: i18n.__("exit"), type: 'normal', click: closeApp},
  ])
  tray.setToolTip(i18n.__("appName"))
  tray.setIgnoreDoubleClickEvents(true)
  tray.setContextMenu(contextMenu)

  tray.on('click', function () {
    createMainWindow()
  });
}


async function createMainWindow() {
  if (mainWindow !== null) {
    mainWindow.restore();
    mainWindow.show()
    mainWindow.maximize()
    return
  }
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1366,
    minHeight: 850,
    // frame: false,
    resizable: false,
    title:i18n.__("appName"),
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      plugins: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preloader/mainPreload.js")
    }
  })

  mainWindow.setMenu(null)
  mainWindow.loadFile(
    'page/main/main.html',
    {
      query:{
        lang: i18n.getLocale(),
        telTitle: CONFIGS.tel_channel.title,
        telUrl: CONFIGS.tel_channel.url
      }
    }).then(async ()=>{
    mainWindow.webContents.openDevTools()

    // send lang data to page
    mainWindow.webContents.send('main:i18nJson', i18n.getCatalog(i18n.getLocale()));

    // send cores list to page
    const cores = await getCores()
    mainWindow.webContents.send('main:tunCores', cores)

  })

  globalShortcut.register('f5', function () {
    console.log('f5 is pressed');
    log.info('f5 is pressed, reload page.');
    mainWindow.reload();
  })

}


app.on('activate', async function () {

  // load ini configs
  let configIniText = await fs.readFile(path.join(__dirname, './config.ini'),{encoding : 'utf-8'})
  CONFIGS = Ini.parse(configIniText)
  console.log(CONFIGS);

  createMainWindow()
})


const closeApp = () => {
  app.isQuiting = true;
  app.quit();
}


// ------------------- ipc messages ------------------------
ipcMain.on("main:selectCore", async (event, {core}) => {
  let sys = os.platform();
  if (sys === "darwin") {
    sys = "macOS"
  } else if (sys === "win32") {
    sys = "windows"
  } else if (sys === "linux") {
    sys = "linux"
  }

  const result = tunCoreInstall(core, sys)
  if (result.isInstalled){
    console.log("core is installed")
    mainWindow.webContents.send('main:tunCoreSelectedStatus', core);
  }
  if (result.isInstalling){
    console.log("core is installing...")
    mainWindow.webContents.send('main:tunCoreSelectedStatus', "installing");
  }

})





// const genSingBoxConf = function () {
//   fs.readFile("./tun/sing-box/config-template.json", (err, data) => {
//     if (!!err && !!err.code) {
//       console.error(err.code, err.message)
//     }
//     if (!!data.length > 0) {
//       const newData = data.toString().replaceAll("{$DOH_SERVER}", "aaaa")
//       fs.writeFile("./tun/sing-box/config.json", newData, (e) => {
//         if (!!e && !!e.code) {
//           console.error(e.code, e.message)
//         }
//       })
//     }
//   })
// }
