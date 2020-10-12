import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import {
  autoregisterDCConfigFactory,
  DockerComposeDefinitionRepository,
  dockerComposesRegeneration,
} from "../../../shared/helpers/dockerComposeWriter";
import { ConfigFacade } from "../../../shared/helpers/injectableServices/Config.service";
import { DockerComposeWriterService } from "../../../shared/helpers/injectableServices/DockerComposeWriter.service";
import { EnvManager } from "../../../shared/helpers/injectableServices/EnvManager.service";
import { SpawnService } from "../../../shared/helpers/injectableServices/Spawn.service";
import { GenerateEnvHandler } from "./subcommands/GenerateEnvHandler";
import { GenerateHostHandler } from "./subcommands/GenerateHostHandler";

export interface OvenCommandParamsInterface {
  command: string | "env" | "host";
  sanitizeArgs: Array<string>;
  env: any;
}

@Command({
  dependencies: [
    GenerateEnvHandler,
    GenerateHostHandler,
    DockerComposeDefinitionRepository,
    DockerComposeWriterService,
  ],
})
export class OvenCommand implements CommandInterface {
  private customFlags = ["--target-prod", "--target-production"];
  name = "oven";

  constructor(
    private envHandler: GenerateEnvHandler,
    private hostHandler: GenerateHostHandler,
    private spawnService: SpawnService,
    private configFacade: ConfigFacade,
    private envService: EnvManager,
    private dockerComposeWriterService: DockerComposeWriterService
  ) {
    this.envService.enableWkEnv();
  }

  argumentParser(args: string[]): OvenCommandParamsInterface {
    const command = args[0];

    const sanitizeArgs = args
      .slice(0, args.length)
      .filter((arg) => !this.customFlags.find((flag) => arg === flag));

    const env = this.envService.parseEnvWithInjectableString(
      this.envService.env
    );

    const isProdFlag = args
      .slice(0, args.length)
      .find(
        (a) =>
          a === "--target-prod" ||
          args.slice(1, args.length).find((a) => a === "--target-production")
      );

    if (isProdFlag) {
      env.BUILD_TARGET = "production";
    } else {
      // If there is no a prod flag and the variable is not set use development
      env.BUILD_TARGET = env.BUILD_TARGET || "development";
    }

    return {
      command,
      sanitizeArgs,
      env,
    };
  }

  async handle(args: OvenCommandParamsInterface): Promise<void> {
    await this.dockerComposeWriterService.autoregisterDCConfigFactory();
    await this.dockerComposeWriterService.dockerComposesRegeneration({
      env: args.env,
    });
    switch (args.command) {
      case "env":
        this.envHandler.handle();
        break;

      case "host":
        this.hostHandler.handle();
        break;

      default:
        await this.oven(args);
        break;
    }
  }

  private async oven(args: OvenCommandParamsInterface) {
    await this.spawnService
      .bin("docker-compose")
      .args(["-f", "docker-compose.yaml"])
      .args(this.getDockerfileList())
      .args(args.sanitizeArgs)
      .env(args.env)
      .spawn();
  }

  private getDockerfileList() {
    return this.configFacade
      .expose()
      .services.map((service) => `-f ${service.dcompose}`);
  }
}
