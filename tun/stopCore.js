const path = require("path");

// return false if is already installed!
module.exports = function stopCore (core, platform) {
  switch (platform){
    case "linux":
      const stopLinux = require(path.join(__dirname, `./${core}/stop/linux`))
      return stopLinux.stop();
    case "windows":
      const stopWindows = require(path.join(__dirname, `./${core}/stop/windows`))
      return stopWindows.stop()
  }
}
