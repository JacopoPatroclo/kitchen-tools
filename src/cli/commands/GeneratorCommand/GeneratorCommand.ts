import { mkdir, readFile, writeFile } from "fs";
import * as rimraf from "rimraf";
import { dump, safeLoad } from "js-yaml";
import { join } from "path";
import {
  Command,
  CommandInterface,
} from "../../../shared/commands/CommandsRepository";
import { Service } from "../../../shared/helpers/ConfigurationHelper";
import {
  ConfigSchema,
  DefinitionsService,
} from "../../../shared/helpers/dockerComposeWriter";
import { ConfigFacade } from "../../../shared/helpers/injectableServices/Config.service";
import { LoggerService } from "../../../shared/helpers/injectableServices/Logger.service";
import { PathResolverService } from "../../../shared/helpers/injectableServices/PathResolver.service";
import { is } from "../../../shared/helpers/Utils";
import { ServiceFactory } from "../../../shared/serviceFactory/ServiceFactory";
import { EnvManager } from "../../../shared/helpers/injectableServices/EnvManager.service";
import { OvenCommand } from "../OvenCommand/OvenCommand";
import { DockerComposeWriterService } from "../../../shared/helpers/injectableServices/DockerComposeWriter.service";

export interface GeneratorCommandInterface {
  target: "kubernetes" | "composer";
}

@Command({
  dependencies: [ServiceFactory, OvenCommand, DockerComposeWriterService],
})
export class GeneratorCommand implements CommandInterface {
  name = "generate";

  constructor(
    private pathService: PathResolverService,
    private configFacade: ConfigFacade,
    private logger: LoggerService,
    private envService: EnvManager,
    private dockerComposeWriterService: DockerComposeWriterService
  ) {
    this.envService.enableWkEnv();
  }

  argumentParser(args: string[]): GeneratorCommandInterface {
    const target = is(args[0], "kubernetes", "composer");
    return {
      target,
    };
  }

  async handle(args: GeneratorCommandInterface) {
    switch (args.target) {
      case "composer":
        await this.composerTarget(args);
        break;

      default:
        throw new Error(`Target named ${args.target} not found`);
    }
  }

  private async composerTarget(args: GeneratorCommandInterface) {
    await this.dockerComposeWriterService.autoregisterDCConfigFactory();
    await this.dockerComposeWriterService.dockerComposesRegeneration(
      this.envService.parseEnvWithInjectableString({
        ...this.envService.env,
        BUILD_TARGET: "production",
      })
    );

    await this.createAndCleanDist();
    for (
      let index = 0;
      index < this.configFacade.expose().services.length;
      index++
    ) {
      const service = this.configFacade.expose().services[index];
      if (!service.build?.skip) {
        const dcConfig = await this.loadDc(service.dcompose);
        const adapdedDcConfig = this.adaptDcDefForProd(dcConfig, service);
        await this.saveDc(adapdedDcConfig, service);
      }
    }
  }

  private async createAndCleanDist() {
    return new Promise((res, rej) => {
      rimraf(this.pathService.deploymentsDir(), (err) => {
        if (err) {
          rej(err);
        } else {
          mkdir(this.pathService.deploymentsDir(), (err) => {
            if (err) {
              rej(err);
            }
            res();
          });
        }
      });
    });
  }

  private adaptDcDefForProd(dcDef: ConfigSchema, service: Service) {
    const servicesNames = Object.keys(dcDef.services || {});
    const newDcDef: ConfigSchema = {
      ...dcDef,
      services: servicesNames
        .map((name) => ({
          data: (dcDef.services || {})[name] as DefinitionsService,
          name,
        }))
        // TODO: Abstract this into an extensible service
        .map(this.removeVolumes)
        .map(this.removeBuildConfig)
        .map(this.removeDependsOnProxy)
        .map(this.resolveImageName(this.envService.env["REGISTRY"]))
        .map(
          this.resolveContainerName(this.envService.env["COMPOSE_PROJECT_NAME"])
        )
        .reduce((acc, info) => ({ ...acc, [info.name]: info.data }), {}),
    };
    return newDcDef;
  }

  private resolveImageName(registryEnv?: string) {
    return ({ name, data }: { name: string; data: DefinitionsService }) => {
      const newData: DefinitionsService = {
        ...data,
        image: data.image?.replace("${REGISTRY}", registryEnv || "${REGISTRY}"),
      };
      return { name, data: newData };
    };
  }

  private resolveContainerName(cpn?: string) {
    return ({ name, data }: { name: string; data: DefinitionsService }) => {
      const newData: DefinitionsService = {
        ...data,
        container_name: data.container_name?.replace(
          "${COMPOSE_PROJECT_NAME}",
          cpn || "${COMPOSE_PROJECT_NAME}"
        ),
      };
      return { name, data: newData };
    };
  }

  private removeDependsOnProxy({
    name,
    data,
  }: {
    name: string;
    data: DefinitionsService;
  }) {
    const newData: DefinitionsService = {
      ...data,
      depends_on: data.depends_on?.filter(
        (dep) => dep !== "proxy" && dep !== "dockergen"
      ),
    };
    if (!newData.depends_on) {
      newData.depends_on = [];
      delete newData.depends_on;
    }
    return { name, data: newData };
  }

  private removeBuildConfig({
    name,
    data,
  }: {
    name: string;
    data: DefinitionsService;
  }) {
    const newData: DefinitionsService = {
      ...data,
    };
    delete newData.build;
    return { name, data: newData };
  }

  private removeVolumes({
    name,
    data,
  }: {
    name: string;
    data: DefinitionsService;
  }) {
    const newData: DefinitionsService = {
      ...data,
      volumes: (data.volumes || []).filter((volume) => {
        if (typeof volume === "string") {
          return !volume.includes("./services");
        } else {
          return !volume.source?.includes("./services");
        }
      }),
    };
    return { name, data: newData };
  }

  private async loadDc(dcPath: string): Promise<ConfigSchema> {
    return new Promise((res, rej) => {
      readFile(this.pathService.resolveDcPath(dcPath), (err, buf) => {
        if (err) {
          rej(err);
        }
        res(safeLoad(buf.toString()) as ConfigSchema);
      });
    });
  }

  private async saveDc(dcDef: ConfigSchema, service: Service) {
    this.logger
      .context(service.name)
      .info(this.dcFileName(service))
      .info(dcDef);
    return new Promise((res, rej) => {
      writeFile(this.dcFileName(service), this.toYaml(dcDef), (err) => {
        if (err) {
          rej(err);
        }
        res();
      });
    });
  }

  private toYaml(dcDef: ConfigSchema) {
    return dump(dcDef);
  }

  private dcFileName(service: Service) {
    return join(
      this.pathService.deploymentsDir(),
      `docker-compose-${service.name}.yaml`
    );
  }
}
