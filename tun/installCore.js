const path = require("path");

// return false if is already installed!
module.exports = function installCore (core, platform) {
  switch (platform){
    case "linux":
      const installLinux = require(path.join(__dirname, `./${core}/install/linux`))
      if(installLinux.isInstalled()){
        return {isInstalled: true, isInstalling: false, supportsOs: true}
      }
      installLinux.install()
      return {isInstalled: false, isInstalling: true, supportsOs: true};
    case "windows":
      const installWindows = require(path.join(__dirname, `./${core}/install/windows`))
      if(installWindows.isInstalled()){
        return {isInstalled: true, isInstalling: false, supportsOs: true};
      }
      installWindows.install()
      return {isInstalled: false, isInstalling: true, supportsOs: true};
  }
}
