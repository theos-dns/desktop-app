const sudo = require('sudo-prompt');

function stop() {
  let options = {
    name: 'Theos DNS',
  };
  sudo.exec(`pkill sing-box`, options,
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
