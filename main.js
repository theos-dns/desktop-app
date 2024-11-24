const {app, BrowserWindow} = require('electron/main')

function createWindow() {
	const w = new BrowserWindow({
		width: 800,
		height: 600,
	})

	w.loadFile('page/main.html').then()
  w.setMenu(null)
}

app.whenReady().then(() => {
	createWindow()
  readIni()

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

const readIni = async function () {
  const fs = require("node:fs")

  let data
  await fs.readFile("./config.ini", (err, res) => {
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
      if (typeof document !== 'undefined') {
        document.getElementById("support").value = value.tel_channel.title
      }
      console.log(2, value);
    }
  })
}
