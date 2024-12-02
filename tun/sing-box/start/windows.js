const sudo = require("sudo-prompt");
const {createConf} = require("./linux");
const path = require("path");
const {app} = require("electron");


function start(doh) {
  const confPath = createConf(doh)

  const exePath = path.join(app.getPath('home'), "sing-box.exe")

  let options = {
    name: 'Theos DNS',
  };
  sudo.exec(`${exePath} run -c ${confPath}`, options,
    function(error, stdout) {
      if (error) {
        console.log(error)
      }
      console.log('stdout: ' + stdout);
    }
  );
  return true
}

module.exports.start = start
