const path = require("path");
const {app} = require('electron');
const fs = require('fs');
const sudo = require('sudo-prompt');

function createConf(doh) {
  let templateConfPath
  let resultConfPath
  if(app.isPackaged){
    templateConfPath = path.join(__dirname, "../../../../app.asar.unpacked/tun/sing-box/config-template.json");
    resultConfPath = path.join(__dirname, "../../../../app.asar.unpacked/tun/sing-box/config.json")
  }else {
    templateConfPath = path.join(__dirname, "../config-template.json")
    resultConfPath = path.join(__dirname, "../config.json")
  }

  let conf = fs.readFileSync(templateConfPath, { encoding: 'utf8', flag: 'r' });

  conf = conf.replace("{$DOH_SERVER}", doh)

  fs.writeFileSync(resultConfPath,
    conf,
    {
      encoding: "utf8",
      flag: "w",
      mode: 0o666
    });

  return resultConfPath
}

function start(doh) {
  const confPath = createConf(doh)


  let options = {
    name: 'Theos DNS',
  };
  sudo.exec(`sing-box run -c ${confPath}`, options,
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
module.exports.createConf = createConf
