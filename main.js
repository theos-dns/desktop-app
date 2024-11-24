const {app, BrowserWindow} = require('electron/main')
const fs = require("node:fs")

function createWindow() {
  const w = new BrowserWindow({
    width: 1366,
    height: 850,
  })

  w.loadFile('page/main.html').then()
  w.setMenu(null)
}

app.whenReady().then(() => {
  createWindow()
  // getCoresList()
  // readIniConfig()
  // genSingBoxConf()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const readIniConfig = function () {
  let data
  fs.readFile("./config.ini", (err, res) => {
    if (!err && !!res) {
      data = res.toString()

      const regex = {
        section: /^\s*\[\s*([^\]]*)\s*]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
      };
      let value = {};
      let lines = data.split(/[\r\n]+/);
      let section = null;
      lines.forEach(function (line) {
        if (regex.comment.test(String(line))) {

        } else if (regex.param.test(String(line))) {
          let match = line.match(regex.param);
          if (section) {
            value[section][match[1]] = match[2];
          } else {
            value[match[1]] = match[2];
          }
        } else if (regex.section.test(line)) {
          let match = line.match(regex.section);
          value[match[1]] = {};
          section = match[1];
        } else if (line.length === 0 && section) {
          section = null;
        }
      });
      console.log('INI =>', value);
    }
  })
}

const getCoresList = function () {
  let coresList = []

  fs.readdir("./tun", (err, dirs) => {
    if (!!err && !!err.code) {
      console.error(err.code, err.message)
    }
    if (dirs.length > 0) {
      coresList = dirs
      console.log("Cores =>", coresList);
    }
  })
}

const genSingBoxConf = function () {
  fs.readFile("./tun/sing-box/config-template.json", (err, data) => {
    if (!!err && !!err.code) {
      console.error(err.code, err.message)
    }
    if (!!data.length > 0) {
      const newData = data.toString().replaceAll("{$DOH_SERVER}", "aaaa")
      fs.writeFile("./tun/sing-box/config.json", newData, (e) => {
        if (!!e && !!e.code) {
          console.error(e.code, e.message)
        }
      })
    }
  })
}
