import { injectable } from "inversify";
import * as dotenv from "dotenv";
import { join } from "path";
import { PathResolverService } from "./PathResolver.service";
import { ConfigService } from "./Config.service";
import { readFileSync } from "fs";
import { merge } from "lodash";

@injectable()
export class EnvManager {
  private useDotEnv = true;
  private useWorkspaceEnv = false;

  constructor(
    private pathService: PathResolverService,
    private configService: ConfigService
  ) {}

  disableDotEnv() {
    this.useDotEnv = false;
    return this;
  }

  enableWkEnv() {
    this.useWorkspaceEnv = true;
    return this;
  }

  disableWkEnv() {
    this.useWorkspaceEnv = false;
    return this;
  }

  get env() {
    if (this.useDotEnv) {
      dotenv.config();
      dotenv.config({ path: this.pathService.localEnvPath() });
    }
    if (this.useWorkspaceEnv) {
      const config = readFileSync(this.pathService.configPath()).toString();
      this.configService.inject(config);
      process.env = merge(this.configService.env, process.env);
    }
    return process.env;
  }

  get rawEnv() {
    if (this.useDotEnv) {
      dotenv.config();
      dotenv.config({ path: this.pathService.localEnvPath() });
    }
    return process.env;
  }
}
