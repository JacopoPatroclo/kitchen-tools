import { createWriteStream, WriteStream, chmodSync } from "fs";
import { join } from "path";
import { KOMPOSE_VERSION, KOMPOSE_FILENAME } from "../shared/constants";
import { spawnSync } from "child_process";
import axios from "axios";

function fixPermission(pathToEx: string) {
  chmodSync(pathToEx, "755");
}

function testk(pathToEx: string) {
  console.log(`Installed in ${pathToEx}`);
  spawnSync(`${pathToEx}`, ["version"], {
    stdio: [process.stdin, process.stdout, process.stderr],
    shell: true,
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
  console.log("Installing Kompose");
  const komposeExecutableFile = join(
    __dirname,
    "..",
    "..",
    "bin",
    "kompose",
    KOMPOSE_FILENAME
  );
  const file = createWriteStream(komposeExecutableFile);
  const githubPath = `https://github.com/kubernetes/kompose/releases/download/${KOMPOSE_VERSION}/${KOMPOSE_FILENAME}`;
  await saveFile(githubPath, file);
  fixPermission(komposeExecutableFile);
  testk(komposeExecutableFile);
}

main().then().catch(console.error);
