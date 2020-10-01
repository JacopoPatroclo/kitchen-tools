import {
  createWriteStream,
  WriteStream,
  chmodSync,
  readFileSync,
  unlinkSync,
} from "fs";
import { join } from "path";
import { sync as spawnSync, spawn } from "cross-spawn";
import crypto = require("crypto-js");
import axios from "axios";
import { COMPOSER_BIN, COMPOSER_BIN_DIR } from "../shared/constants";

function fixPermission(pathToEx: string) {
  chmodSync(pathToEx, "755");
}

function testk(pathToEx: string) {
  return new Promise((res, rej) => {
    const exec = spawn(`${pathToEx}`, ["--version"], {
      stdio: [process.stdin, process.stdout, null],
      shell: true,
    });
    exec.on("exit", (code) => {
      code !== 0 ? rej() : res();
    });
  });
}

function saveFile(path: string, file: WriteStream) {
  return new Promise((res, rej) => {
    console.log(`Fetch from ${path}`);
    file.on("close", () => res());
    axios({
      method: "get",
      url: path,
      responseType: "stream",
    }).then((resp) => resp.data.pipe(file));
  });
}

function getChecksum(): Promise<string> {
  return axios({
    method: "get",
    url: "https://composer.github.io/installer.sig",
    responseType: "text",
  }).then((resp) => resp.data);
}

function installWithPhp(file: string, composerExecutableDir: string) {
  spawnSync(
    `php ${file} --install-dir=${composerExecutableDir} --filename=composer`,
    {
      stdio: [null, null, process.stderr],
      shell: true,
    }
  );
}

function checkFileChecksum(file: string, checksum: string) {
  const currentHash = crypto.SHA384(readFileSync(file).toString()).toString();
  return currentHash === checksum;
}

async function main() {
  const composerSetupFile = join(
    __dirname,
    "..",
    "..",
    "bin",
    "composer",
    "composer-setup.php"
  );
  const composerExecutableFile = COMPOSER_BIN;
  const composerExecutableDir = COMPOSER_BIN_DIR;

  try {
    await testk(composerExecutableFile);
    console.log("Composer already installed");
    process.exit(0);
  } catch (error) {}

  const file = createWriteStream(composerSetupFile);
  const checksum = await getChecksum();
  const pathToSetup = `https://getcomposer.org/installer`;
  await saveFile(pathToSetup, file);
  if (checkFileChecksum(composerSetupFile, checksum)) {
    installWithPhp(composerSetupFile, composerExecutableDir);
    unlinkSync(composerSetupFile);
    fixPermission(composerExecutableFile);
    await testk(composerExecutableFile);
  } else {
    console.error(`The checksum does not match stop installation`);
    process.exit(2);
  }
}

main().then().catch(console.error);
