const {app} = require('electron');
const axios = require('axios');
const os = require('os');
const fs = require("node:fs")
const extract = require('extract-zip')
const path = require("path");

const versionApiUrl = "https://api.github.com/repos/SagerNet/sing-box/releases/latest"
const downloadBaseUrl = "https://github.com/SagerNet/sing-box/releases/download"
const downloadedPath = path.join(__dirname, "./sing-box.zip")
const outputPath = path.join(__dirname, "./sing-box-core")

const finalPath = path.join(app.getPath('home'), "sing-box.exe")

function isInstalled() {
  return fs.existsSync(finalPath);
}


function install() {
  if (isInstalled) {
    console.log("sing-box is already installed!")
    return
  }
  axios.get(versionApiUrl).then(function (response) {
    const tagName = response.data.tag_name
    let arch = ""
    switch (os.arch()) {
      case "x64":
        arch = "amd64"
        break;
      case "x32":
        arch = "386"
        break;
      case "ia32":
        arch = "386"
        break;
    }
    downloadFile(`${downloadBaseUrl}/${tagName}/sing-box-${tagName.replace('v', '')}-windows-${arch}.zip`, downloadedPath).then(() => {
      console.log("sing-box core downloaded")
      extract(downloadedPath, { dir: outputPath }).then(()=>{
        console.log('Extraction complete')
        let files = [];
        const getFilesRecursively = (directory) => {
          const filesInDirectory = fs.readdirSync(directory);
          for (const file of filesInDirectory) {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) {
              getFilesRecursively(absolute);
            } else {
              files.push(absolute);
            }
          }
        };

        getFilesRecursively(outputPath)
        const exePath = files.filter(i=>i.includes(".exe"))[0]

        fs.copyFileSync(exePath, finalPath)

        fs.rmSync(outputPath, { recursive: true, force: true });

        console.log("core installed")
      }).finally(()=>{
        fs.unlinkSync(downloadedPath);
      })
    })

  })

}


async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios.request({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {

    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}



module.exports.isInstalled = isInstalled
module.exports.install = install
