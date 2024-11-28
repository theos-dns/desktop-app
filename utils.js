const fs = require("node:fs/promises")

module.exports.getCores =  async function () {
  let result = await fs.readdir("./tun")
  if (result.length > 0) {
    return result
  }
  return []
}
