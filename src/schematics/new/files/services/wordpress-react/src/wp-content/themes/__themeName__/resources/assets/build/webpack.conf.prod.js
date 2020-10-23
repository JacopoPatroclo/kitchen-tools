const entry = require("./fragments/entry");
const externals = require("./fragments/externals");
const output = require("./fragments/output");
const modul = require("./fragments/module");
const plugins = require("./fragments/plugins");

module.exports = {
  mode: "production",
  entry: entry,
  target: "web",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  externals,
  module: modul("production"),
  output,
  plugins,
};
