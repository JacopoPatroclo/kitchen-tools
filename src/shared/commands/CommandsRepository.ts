import { Container, decorate, injectable } from "inversify";
import { LoggerService } from "../helpers/injectableServices/Logger.service";

type Instantiable<T = any> = { new (...args: any[]): T };

export interface CommandOptions {
  dependencies?: Array<Instantiable<any>>;
}

const COMMAND_DEPENDENCY_KEY = "command:dependency";

export function Command<T = any>(options?: CommandOptions) {
  return (constructor: Instantiable<CommandInterface<T>>) => {
    Reflect.defineMetadata(
      COMMAND_DEPENDENCY_KEY,
      options?.dependencies || [],
      constructor
    );
    decorate(injectable(), constructor);
    return constructor as Instantiable<any>;
  };
}

export interface CommandInterface<T = any> {
  name: string;
  argumentParser(args: Array<string>): T;
  handle(args: T): Promise<void>;
}

export class CommandContainer extends Container {
  private COMMAND_KEY = "COMMAND_KEY";
  private DEFAULT_COMMAND = "DEFAULT_COMMAND";

  autobind(commands: Array<Instantiable<CommandInterface>> = []) {
    commands.forEach((command) => {
      this.register(command);
    });
  }

  register(command: Instantiable<CommandInterface>) {
    if (Reflect.hasMetadata(COMMAND_DEPENDENCY_KEY, command)) {
      Reflect.getMetadata(COMMAND_DEPENDENCY_KEY, command).forEach(
        (dependency) => {
          if (!this.isBound(dependency)) {
            this.bind(dependency).to(dependency);
          }
        }
      );
      return this.bind(this.COMMAND_KEY).to(command).inSingletonScope();
    } else {
      console.error(
        `Unable to register ${command.name}, use the @Command decorator on this class `
      );
    }
  }

  setDefaultCommand(command: Instantiable<CommandInterface>) {
    this.bind(this.DEFAULT_COMMAND).to(command).inSingletonScope();
  }

  async match(argv: Array<string>) {
    const commandName = argv[2];
    const rest = argv.slice(3, argv.length);
    const commands = this.getAll<CommandInterface>(this.COMMAND_KEY);
    this.get(LoggerService)
      .context("Commands")
      .info(commands.map((command) => command.name));
    for (let index = 0; index < commands.length; index++) {
      const command = commands[index];
      if (commandName === command.name) {
        const args = command.argumentParser(rest);
        return await command.handle(args);
      }
    }
    if (this.isBound(this.DEFAULT_COMMAND)) {
      const defaultCommand = this.get<CommandInterface>(this.DEFAULT_COMMAND);
      return await defaultCommand.handle(defaultCommand.argumentParser(argv));
    }
  }
}
