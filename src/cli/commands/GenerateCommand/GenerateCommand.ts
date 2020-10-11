import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { is } from "../../../shared/helpers/Utils";

export interface GenerateCommandInterface {
  target: "kubernetes" | "compose";
}

@Command()
export class GenerateCommand implements CommandInterface {
  name = "generate";
  argumentParser(args: string[]): GenerateCommandInterface {
    const target = is(args[0], "kubernetes", "compose");
    return {
      target,
    };
  }
  handle(args: GenerateCommandInterface): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
