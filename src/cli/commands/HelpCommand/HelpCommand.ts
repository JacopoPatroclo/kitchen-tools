import { services } from "../../../new/src/serviceFactory";
import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { LoggerService } from "../../../shared/helpers/injectableServices/Logger.service";
import * as marked from "marked";
import * as TerminalRenderer from "marked-terminal";
import { readFile } from "fs";
import { join } from "path";
import { ServiceFactory } from "../../../shared/serviceFactory/ServiceFactory";

type HelpType = "services";
export interface HelpCommandInterface {
  helpType: HelpType;
}

@Command({ dependencies: [ServiceFactory] })
export class HelpCommand implements CommandInterface<HelpCommandInterface> {
  name = "help";

  constructor(
    private logger: LoggerService,
    private serviceFactory: ServiceFactory
  ) {}

  argumentParser(args: string[]): HelpCommandInterface {
    const helpType = process.argv[0] as HelpType;
    return {
      helpType,
    };
  }
  async handle(args: HelpCommandInterface): Promise<void> {
    switch (args.helpType) {
      case "services":
        this.servicesHelp();
        break;

      default:
        await this.genericHelp();
        break;
    }
  }

  private servicesHelp() {
    this.serviceFactory.autoRegister(services);
    this.logger.plain("Aviable services:");
    for (const service of this.serviceFactory.services()) {
      this.logger.plain(`- ${service}`);
    }
  }

  private genericHelp() {
    return new Promise((res, rej) => {
      marked.setOptions({
        // Define custom renderer
        renderer: new TerminalRenderer(),
      });

      readFile(
        join(__dirname, "..", "..", "..", "..", "README.md"),
        (err, data) => {
          if (err) {
            rej(err);
          } else {
            const readme = data.toString("utf8");
            this.logger.plain(marked(readme));
            res();
          }
        }
      );
    });
  }
}
