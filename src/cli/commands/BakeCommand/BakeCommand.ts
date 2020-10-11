import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { EnvManager } from "../../../shared/helpers/injectableServices/EnvManager.service";
import { PathResolverService } from "../../../shared/helpers/injectableServices/PathResolver.service";
import { SpawnService } from "../../../shared/helpers/injectableServices/Spawn.service";

export interface BakeCommnadArguments {
  schemaName: string;
  schematicsParams: Array<string>;
}

@Command({
  dependencies: [PathResolverService, SpawnService],
})
export class BakeCommnad implements CommandInterface<BakeCommnadArguments> {
  name = "bake";

  constructor(
    private pathResolver: PathResolverService,
    private envManager: EnvManager,
    private spawnService: SpawnService
  ) {}

  argumentParser(args: string[]): BakeCommnadArguments {
    return {
      schemaName: args[0],
      schematicsParams: args.slice(1, args.length),
    };
  }

  async handle(args: BakeCommnadArguments): Promise<void> {
    await this.spawnService
      .bin(this.pathResolver.nodeCommandPath("schematics"))
      .args([`${this.pathResolver.collectionJsonPath()}:${args.schemaName}`])
      .args(args.schematicsParams)
      .args(["--debug=false"])
      .env(this.envManager.env)
      .spawn();
  }
}
