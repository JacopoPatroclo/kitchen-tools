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

  parseEnvWithInjectableString(env: any) {
    return Object.keys(env)
      .map((key) => {
        const envName = key;
        const envVal = this.parseWithEnv(env[key]);
        return { [envName]: envVal };
      })
      .reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }

  private parseWithEnv(val: string = "") {
    const envName = this.extractEnv(val);
    return envName && this.rawEnv[envName] ? this.rawEnv[envName] : val;
  }

  private extractEnv(val: string = "") {
    const regEx = /^\$env{(.*)}$/;
    const results = regEx.exec(val);
    if (results) {
      return results.length > 1 ? results[1] : null;
    }
    return null;
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
