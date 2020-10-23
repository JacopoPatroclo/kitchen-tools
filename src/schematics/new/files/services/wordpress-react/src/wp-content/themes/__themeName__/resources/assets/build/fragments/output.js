const path = require("path");
const config = require("../../config.json");

module.exports = {
  filename: "[name].js",
  path: path.resolve(
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "..",
      "..",
      config.contentBasePublicPath
    )
  ),
};
