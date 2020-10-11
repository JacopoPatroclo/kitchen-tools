import { injectable } from "inversify";
import { join, resolve } from "path";
import { CONFIG_FILE_NAME } from "../../constants";

@injectable()
export class PathResolverService {
  private node_modules_bin = resolve(
    join(__dirname, "..", "..", "..", "..", "node_modules", ".bin")
  );

  nodeCommandPath(command: string) {
    return join(this.node_modules_bin, command);
  }

  collectionJsonPath() {
    return resolve(join(__dirname, "..", "..", "..", "collection.json"));
  }

  configPath() {
    return join(process.cwd(), CONFIG_FILE_NAME);
  }

  localEnvPath() {
    return resolve(join(__dirname, "..", "..", "..", "..", ".env"));
  }

  envPath() {
    return join(process.cwd(), ".env");
  }

  envExamplePath() {
    return join(process.cwd(), ".env.example");
  }

  cwd() {
    return process?.cwd() || "";
  }

  lbCloneDir() {
    return join(this.cwd(), "loadbalancer");
  }
}
