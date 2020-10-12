import { injectable } from "inversify";
import spawn = require("cross-spawn");
import { SpawnOptions } from "child_process";
import { ProcessExitCodeError } from "../../errors/ProcessExitCodeError";
import { LoggerService } from "./Logger.service";

@injectable()
export class SpawnService {
  constructor(private logger: LoggerService) {
    this.resetState();
  }

  private _defaultSpawnOptions: SpawnOptions = {
    shell: true,
    cwd: process.cwd(),
    stdio: [process.stdin, process.stdout, process.stderr],
  };
  private _bin?: string;
  private _args: Array<string>;
  private _env: any;
  private _options: SpawnOptions;

  private resetState() {
    this._bin = undefined;
    this._args = [];
    this._env = {};
    this._options = { ...this._defaultSpawnOptions };
  }

  bin(binCommand: string) {
    this._bin = binCommand;
    return this;
  }

  args(args: Array<string>) {
    this._args = [...this._args, ...args];
    return this;
  }

  env(envs: any) {
    this._env = envs;
    return this;
  }

  options(options: SpawnOptions) {
    this._options = options;
    return this;
  }

  spawn() {
    if (!this._bin) {
      throw new Error("Unable to spawn, bin property has not been set");
    }

    this.logger
      .context("Spawn")
      .info(`Executing: ${this._bin}`)
      .info(this._args)
      .info(`CWD: ${this._options.cwd}`)
      .info(this._env);

    return new Promise((res, rej) => {
      const prc = spawn(this._bin!, this._args, {
        env: this._env,
        ...this._options,
      });

      let msg = "";

      prc.on("error", (error) => {
        this.resetState();
        rej(error);
      });

      prc.stderr?.on("data", (buf) =>
        this.logger.context(this._bin!).error(buf.toString())
      );

      prc.stdout?.on("data", (buf) => {
        this.logger.context(this._bin!).plain(buf.toString());
        msg = `${msg}${buf.toString()}`;
      });

      prc.on("exit", (code) => {
        this.resetState();
        if (code !== 0) {
          const error = new ProcessExitCodeError(Number(code));
          rej(error);
        } else {
          res(msg);
        }
      });
    });
  }
}
