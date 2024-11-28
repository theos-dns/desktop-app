const {exec, execSync} = require("child_process");
const path = require("path");


function isInstalled () {
  try {
    const r = execSync("command -v sing-box")
    return r.toString().length > 0
  }catch (e) {
    return false
  }
}

function install () {
  if(isInstalled()) return false

  exec(path.join(__dirname, `./linux-assets/install.sh`), (err, stdout, stderr) => {
    if (err) {
      console.log(err)
      return;
    }

    if(stdout.length > 0)
      console.log(`stdout: ${stdout}`);

    if(stderr.length > 0)
      console.log(`stderr: ${stderr}`);
  });
}


module.exports.isInstalled = isInstalled
module.exports.install = install
