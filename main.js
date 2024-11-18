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
