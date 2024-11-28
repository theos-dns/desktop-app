const fs = require("node:fs/promises")
const {app} = require('electron')
const path = require("path");

module.exports.getCores =  async function () {
  let p = path.join(__dirname, "./tun")
  if (app.isPackaged) {
    p = path.join(__dirname, "../app.asar.unpacked/tun");
  }

  let result = await fs.readdir(p)
  if (result.length > 0) {
    return result.filter(i=>!i.includes("installCore.js"))
  }
  return []
}
