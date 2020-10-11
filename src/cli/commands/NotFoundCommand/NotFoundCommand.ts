import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { LoggerService } from "../../../shared/helpers/injectableServices/Logger.service";

@Command()
export class NotFoundCommand implements CommandInterface {
  name = "Not found";

  constructor(private logger: LoggerService) {}

  argumentParser(args: string[]) {
    return null;
  }
  handle(args: any): Promise<void> {
    this.logger.warn(
      "Command not found, run `ktools help` to see all the commands"
    );
    return Promise.resolve();
  }
}
