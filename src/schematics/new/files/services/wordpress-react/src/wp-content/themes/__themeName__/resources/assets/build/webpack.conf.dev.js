const config = require("../config.json");
const entry = require("./fragments/entry");
const externals = require("./fragments/externals");
const output = require("./fragments/output");
const modul = require("./fragments/module");
const plugins = require("./fragments/plugins");

module.exports = {
  mode: "development",
  entry: entry,
  target: "web",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devtool: "cheap-source-map",
  externals,
  module: modul("development"),
  output,
  devServer: {
    disableHostCheck: true,
    proxy: {
      "/": {
        target: config.proxyTarget,
        secure: false,
        changeOrigin: false,
        autoRewrite: true,
      },
    },
    publicPath: config.contentBasePublicPath,
  },
  plugins,
};
