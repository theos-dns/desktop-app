const path = require("path");

// return false if is already installed!
module.exports = function startCore (doh, core, platform) {
  switch (platform){
    case "linux":
      const startLinux = require(path.join(__dirname, `./${core}/start/linux`))
      startLinux.start(doh)
      return true;
    case "windows":
      const startWindows = require(path.join(__dirname, `./${core}/start/windows`))
      startWindows.start(doh)
      return true
  }
}
