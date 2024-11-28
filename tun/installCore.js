const path = require("path");

// return false if is already installed!
module.exports = function installCore (core, platform) {
  switch (platform){
    case "linux":
      const installLinux = require(path.join(__dirname, `./${core}/install/linux`))
      if(installLinux.isInstalled()){
        return false
      }
      installLinux.install()
      return true;
    case "windows":
      const installWindows = require(path.join(__dirname, `./${core}/install/windows`))
      if(installWindows.isInstalled()){
        return false
      }
      installWindows.install()
      return true;
  }
}
