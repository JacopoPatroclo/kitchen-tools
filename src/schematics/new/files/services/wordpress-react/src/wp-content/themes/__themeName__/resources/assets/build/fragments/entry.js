const config = require("../../config.json");

const entryFromConfig = config.micro.reduce(
  (acc, conf) => ({ ...acc, [conf.name]: conf.entry }),
  {}
);

module.exports = {
  ...entryFromConfig,
  main: "./resources/assets/micro/helpers/main-scripts.ts",
};
