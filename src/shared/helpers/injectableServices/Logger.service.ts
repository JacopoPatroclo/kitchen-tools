import { injectable } from "inversify";
import { EnvManager } from "./EnvManager.service";
import * as chalk from "chalk";

type LogLevel = "info" | "error" | "warn" | "plain";

@injectable()
export class LoggerService {
  constructor(private envManager: EnvManager) {}

  private _context: string = "Global";

  context(context: string) {
    this._context = context;
    return this;
  }

  info(message: any) {
    this.log(message, "info");
    return this;
  }

  plain(message: any) {
    this.log(message, "plain");
    return this;
  }

  error(message: any) {
    this.log(message, "error");
    return this;
  }

  warn(message: any) {
    this.log(message, "warn");
    return this;
  }

  private log(message: any, level: LogLevel) {
    if (level === "info" && this.envManager.env.DEVELOPMENT !== "true") {
      return;
    } else {
      let coloredLogfn = (a) => a;
      if (level === "info") {
        coloredLogfn = (a) => chalk.blue(a);
      }
      if (level === "warn") {
        coloredLogfn = (a) => chalk.yellow.bold(a);
      }
      if (level === "error") {
        coloredLogfn = (a) => chalk.red.bold(a);
      }
      const parsedMessage = `[${this._context}]: ${this.parse(message)}`;
      console.log(coloredLogfn(parsedMessage));
    }
  }

  private parse(message: any) {
    if (typeof message === "object") {
      if (Array.isArray(message)) {
        return `[${message.map((msg) => this.parse(msg)).join(",")}]`;
      } else if (message instanceof Error) {
        return `${message.message}\n${chalk.gray(message.stack)}`;
      } else {
        return JSON.stringify(message, null, 2);
      }
    } else {
      return message;
    }
  }
}
