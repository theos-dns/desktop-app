const {app, Menu, Tray, globalShortcut, ipcMain, BrowserWindow} = require('electron/main')
const fs = require("node:fs/promises")
const path = require("path");
const log = require('electron-log/main');
const Store = require("electron-store")
const {autoUpdater} = require("electron-updater")
const { I18n } = require('i18n')
const Ini = require("ini")
const {getCores, platform} = require("./utils");
const tunCoreInstall = require("./tun/installCore")
const tunCoreStart = require("./tun/startCore")
const tunCoreStop = require("./tun/stopCore")
const {STORE_TUN_CORE, STORE_CONF_AUTH_SERVER, STORE_CONF_DOH_SERVER, STORE_CONF_WHOAMI_SERVER,
  STORE_CONF_TOKEN
} = require("./consts");
const axios = require("axios");
const {isIP} = require("net");

log.initialize();
log.info('start logging...');


const i18n = new I18n({
  locales: ['en'],
  defaultLocale: 'en',
  retryInDefaultLocale: true,
  directory: path.join(__dirname, 'locales')
})

const  store = new Store();

// ------------------- global vars ------------------------
let CONFIGS = null

// ------------------- window vars ------------------------
let mainWindow = null


const additionalData = {name: 'THEOS_APP'}
const gotTheLock = app.requestSingleInstanceLock(additionalData)



if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    let configIniText = await fs.readFile(path.join(__dirname, 'config.ini'),{encoding : 'utf-8'})
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
    // mainWindow.webContents.openDevTools()

    // send lang data to page
    mainWindow.webContents.send('main:i18nJson', i18n.getCatalog(i18n.getLocale()));

    // send cores list to page
    const cores = await getCores()
    mainWindow.webContents.send('main:getCores', cores)


    setSettings()

  })

  globalShortcut.register('f5', function () {
    console.log('f5 is pressed');
    log.info('f5 is pressed, reload page.');
    mainWindow.reload();
  })

}


app.on('activate', async function () {

  // load ini configs
  let configIniText = await fs.readFile(path.join(__dirname, 'config.ini'),{encoding : 'utf-8'})
  CONFIGS = Ini.parse(configIniText)
  console.log(CONFIGS);

  createMainWindow()
})


const closeApp = () => {
  app.isQuiting = true;
  app.quit();
}


const setSettings = () => {

  // tun core:
  mainWindow.webContents.send('main:coreStatus', store.get(STORE_TUN_CORE, ""), false, false, "");

  // conf:
  mainWindow.webContents.send(
    'main:confSet',
    store.get(STORE_CONF_AUTH_SERVER),
    store.get(STORE_CONF_WHOAMI_SERVER),
    store.get(STORE_CONF_DOH_SERVER),
    store.get(STORE_CONF_TOKEN),
    );
}

const authorizeIp = async (authServer, token, ip) =>{
  const url = `http://${authServer}/tap-in`

  try {
    const res = await axios.get(url, {params:{token, ip}})
    if(res.data === "added" || res.data === "already added"){
      return {ok: true, code: 200, status: res.data}
    }
  }catch (error) {
    if (error.response && error.response.status === 401) {
      return {ok: false, code: 401, status:"unauthorized"}
    }
    console.log(error)
    return {ok: false, code: 0, status:"auth server is not correct"}
  }

  return {ok: false, code: -1, status:"default"}
}


// ------------------- ipc messages ------------------------
ipcMain.on("main:selectCore", async (event, {core}) => {
  const p = platform()

  const result = tunCoreInstall(core, p)
  if (result.isInstalled){
    console.log("core is installed")
    mainWindow.webContents.send('main:coreStatus', core, false, false, "");
    store.set(STORE_TUN_CORE, core);
  }
  if (result.isInstalling){
    console.log("core is installing...")
    mainWindow.webContents.send('main:coreStatus', "", true, false, i18n.__("installingCore"));
  }

})


ipcMain.on("main:submitConf", async (event, { authServer, whoamiServer, dohServer, token }) => {
  let whoamiTest
  try {
    whoamiTest = await axios.get(`http://${whoamiServer}`)
    const ipVersion = isIP(whoamiTest.data)
    if(ipVersion === 0){
      throw new Error('whoami server is not correct');
    }
  }catch (e) {
    console.log(e)
    mainWindow.webContents.send("main:confStatus", false, i18n.__("whoamiServerIsWrong"))
    return;
  }

  const res = await authorizeIp(authServer, token, whoamiTest.data)

  if(!res.ok && res.code === 401){
    mainWindow.webContents.send("main:confStatus", false, i18n.__("tokenIsWrong"))
    return;
  }

  if(!res.ok && res.code === 0){
    mainWindow.webContents.send("main:confStatus", false, i18n.__("authServerIsWrong"))
    return;
  }

  if(!res.ok && res.code < 0){
    mainWindow.webContents.send("main:confStatus", false, res.status)
    return;
  }

  store.set(STORE_CONF_AUTH_SERVER, authServer);
  store.set(STORE_CONF_DOH_SERVER, dohServer);
  store.set(STORE_CONF_WHOAMI_SERVER, whoamiServer);
  store.set(STORE_CONF_TOKEN, token);

  mainWindow.webContents.send("main:confStatus", true, i18n.__("confSaved"))
})


ipcMain.on("main:startCore", () => {
  const doh = store.get(STORE_CONF_DOH_SERVER, "")
  const core = store.get(STORE_TUN_CORE, "")
  if(doh.length < 3){
    mainWindow.webContents.send("main:confStatus", false, i18n.__("dohIsWrong"))
    return;
  }
  if(core.length < 2){
    mainWindow.webContents.send("main:confStatus", false, i18n.__("coreNotSelected"))
    return;
  }
  const p = platform()
  tunCoreStart(doh, core, p)

  mainWindow.webContents.send('main:coreStatus', core, false, true, "");
})

ipcMain.on("main:stopCore", () => {
  const core = store.get(STORE_TUN_CORE, "")
  if(core.length < 2){
    mainWindow.webContents.send("main:confStatus", false, i18n.__("coreNotSelected"))
    return;
  }
  const p = platform()
  tunCoreStop(core, p)

  mainWindow.webContents.send('main:coreStatus', core, false, false, "");
})
