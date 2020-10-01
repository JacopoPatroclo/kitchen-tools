#!/usr/bin/env node

import { sync as spawnSync } from "cross-spawn";
import { join, resolve } from "path";

const schemName = process.argv[2];
const otherParams = process.argv.slice(2, process.argv.length);

const collectionJsonPath = resolve(join(__dirname, "..", "collection.json"));

if (!schemName) {
  console.error("Error: Provide an action parameter, run bake-help for help");
  process.exit(1);
}

spawnSync(
  resolve(join(__dirname, "..", "..", "node_modules", ".bin", "schematics")),
  [`${collectionJsonPath}:${schemName}`, "--debug=false", ...otherParams],
  {
    env: process.env,
    shell: true,
    stdio: [0, 1, 2],
  }
);

process.exit(0);
