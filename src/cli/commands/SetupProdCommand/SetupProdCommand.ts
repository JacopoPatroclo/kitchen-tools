import { flatten } from "lodash";
import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { LB_REPO } from "../../../shared/constants";
import { EnvManager } from "../../../shared/helpers/injectableServices/EnvManager.service";
import { LoggerService } from "../../../shared/helpers/injectableServices/Logger.service";
import { PathResolverService } from "../../../shared/helpers/injectableServices/PathResolver.service";
import { SpawnService } from "../../../shared/helpers/injectableServices/Spawn.service";
import { is } from "../../../shared/helpers/Utils";

type Options = "--elk" | "--influx" | "--letsencrypt";

export interface SetupProdCommandInterface {
  target: "load-balancer";
  options: Array<Options>;
}

@Command({
  dependencies: [PathResolverService, SpawnService],
})
export class SetupProdCommand implements CommandInterface {
  name = "setup";

  constructor(
    private pathService: PathResolverService,
    private spawnService: SpawnService,
    private envManager: EnvManager,
    private logger: LoggerService
  ) {}

  argumentParser(args: string[]): SetupProdCommandInterface {
    const target = is(args[0], "load-balancer");
    let options: Array<Options> = [];

    if (target === "load-balancer") {
      options = args
        .slice(1, args.length)
        .map((arg) => is(arg, "--elk", "--influx", "--letsencrypt"));
    }

    return {
      target,
      options,
    };
  }

  async handle(args: SetupProdCommandInterface) {
    switch (args.target) {
      case "load-balancer":
        await this.handleLb(args);
        break;

      default:
        throw new Error(
          `The target "${args.target}" has not been recognized as a valid one`
        );
    }
  }

  async handleLb(args: SetupProdCommandInterface) {
    this.logger.warn("Cloning the repo on your file system");
    await this.spawnService
      .bin("git")
      .args(["clone", LB_REPO, this.pathService.lbCloneDir()])
      .spawn();

    await this.spawnService
      .bin("docker-compose")
      .args(["-f", "docker-compose.yml"])
      .args(this.fromOptionsToCompose(args.options))
      .args(["up", "-d"])
      .env(this.envManager.disableDotEnv().rawEnv)
      .options({
        cwd: this.pathService.lbCloneDir(),
      })
      .spawn();

    this.logger.warn("You shoud see all the service up and running below");
    await this.spawnService
      .bin("docker")
      .args(["ps"])
      .env(this.envManager.disableDotEnv().rawEnv)
      .spawn();
  }

  fromOptionsToCompose(options: Array<Options>): Array<string> {
    return flatten(
      options.map((option) => {
        switch (option) {
          case "--letsencrypt":
            return [`-f`, `docker-compose-letsencrypt.yml`];
          case "--elk":
            return [`-f`, `docker-compose-elk.yml`];
          case "--influx":
            return [`-f`, `docker-compose-influx.yml`];
          default:
            return "";
        }
      })
    );
  }
}
