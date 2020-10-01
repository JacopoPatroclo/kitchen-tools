import { join } from "path";

export const CONFIG_FILE_NAME = "wkspace.json";
export const KOMPOSE_VERSION = "v1.21.0";
export const KOMPOSE_FILENAME =
  process.platform === "win32"
    ? "kompose-windows-amd64.exe"
    : `kompose-${process.platform}-amd64`;
export const KOMPOSE_BIN = join(
  __dirname,
  "..",
  "..",
  "bin",
  "kompose",
  KOMPOSE_FILENAME
);

export const COMPOSER_FILENAME = "composer";
export const COMPOSER_BIN = join(
  __dirname,
  "..",
  "..",
  "bin",
  "composer",
  "composer"
);
export const COMPOSER_BIN_DIR = join(__dirname, "..", "..", "bin", "composer");
