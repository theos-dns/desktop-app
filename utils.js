const fs = require("node:fs/promises")
const {app} = require('electron')
const path = require("path");
const os = require("os");

module.exports.getCores =  async function () {
  let p = path.join(__dirname, "./tun")
  if (app.isPackaged) {
    p = path.join(__dirname, "../app.asar.unpacked/tun");
  }

  let result = await fs.readdir(p)
  if (result.length > 0) {
    return result.filter(i=>!i.includes("Core.js"))
  }
  return []
}


module.exports.platform = function() {
  let sys = os.platform();
  if (sys === "darwin") {
    return "macOS"
  } else if (sys === "win32") {
    return "windows"
  } else if (sys === "linux") {
    return"linux"
  }
  return undefined
}
