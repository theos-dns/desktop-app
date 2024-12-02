const sudo = require("sudo-prompt");

function stop() {

  let options = {
    name: 'Theos DNS',
  };
  sudo.exec(`taskkill /f /t /im sing-box.exe`, options,
    function(error, stdout) {
      if (error) {
        console.log(error)
      }
      console.log('stdout: ' + stdout);
    }
  );
  return true
}

module.exports.stop = stop
