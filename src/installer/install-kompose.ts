import { createWriteStream, WriteStream, chmodSync } from "fs";
import {
  KOMPOSE_VERSION,
  KOMPOSE_FILENAME,
  KOMPOSE_BIN,
} from "../shared/constants";
import { sync as spawnSync, spawn } from "cross-spawn";
import axios from "axios";

function fixPermission(pathToEx: string) {
  chmodSync(pathToEx, "755");
}

function testk(pathToEx: string) {
  return new Promise((res, rej) => {
    const exec = spawn(`${pathToEx}`, ["version"], {
      stdio: [process.stdin, process.stdout, null],
      shell: true,
    });
    exec.on("exit", (code) => {
      code !== 0 ? rej() : res();
    });
  });
}

function saveFile(path: string, file: WriteStream) {
  console.log(`Fetch from ${path}`);
  return axios({
    method: "get",
    url: path,
    responseType: "stream",
  }).then((resp) => resp.data.pipe(file));
}

async function main() {
  const komposeExecutableFile = KOMPOSE_BIN;

  try {
    await testk(komposeExecutableFile);
    console.log("Kompose already installed");
    process.exit(0);
  } catch (error) {}

  const file = createWriteStream(komposeExecutableFile);
  const githubPath = `https://github.com/kubernetes/kompose/releases/download/${KOMPOSE_VERSION}/${KOMPOSE_FILENAME}`;
  await saveFile(githubPath, file);
  fixPermission(komposeExecutableFile);
  await testk(komposeExecutableFile);
}

main().then().catch(console.error);
