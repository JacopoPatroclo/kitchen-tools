import { readFileSync } from "fs";
import { injectable } from "inversify";
import { NotInWorkspaceError } from "../../errors/NotInWorkspaceError";
import { ConfigSchema } from "../dockerComposeWriter";
import { PathResolverService } from "./PathResolver.service";

export interface DependentService {
  type: string;
  options: {
    name: string;
    [key: string]: any;
  };
}

export interface BaseEnv {
  REGISTRY: string;
  COMPOSE_PROJECT_NAME: string;
}

export interface Service {
  name: string;
  dcompose: string;
  type: string;
  depends?: Array<DependentService>;
  dockerCompose?: ConfigSchema;
  options?: {
    [key: string]: any;
  };
}

export interface Configuration {
  name: string;
  services: Array<Service>;
  env: BaseEnv & {
    [key: string]: any;
  };
}

@injectable()
export class ConfigService {
  private confObject: Configuration;

  serialize(): string {
    return JSON.stringify(this.confObject, null, 4);
  }

  addService(service: Service): boolean {
    if (this.hasService(service)) {
      return false;
    }
    this.confObject.services.push(service);
    return true;
  }

  hasService(serv: string | Service): boolean {
    return !!this.confObject.services.find((service) => {
      if (typeof serv === "string") {
        return service.name === serv;
      } else {
        return service.name === serv.name;
      }
    });
  }

  getService(name: string) {
    return this.confObject.services.find((service) => service.name === name);
  }

  inject(rawData: string) {
    this.confObject = JSON.parse(rawData);
  }

  get env() {
    return this.confObject.env;
  }

  get services() {
    return this.confObject.services;
  }

  get projectName() {
    return this.confObject.name;
  }
}

@injectable()
export class ConfigFacade {
  hasLoad = false;

  constructor(
    private pathResolver: PathResolverService,
    private configService: ConfigService
  ) {}

  expose() {
    if (this.hasLoad) {
      return this.configService;
    } else {
      const pathConfig = this.pathResolver.configPath();
      try {
        const config = readFileSync(pathConfig).toString();
        this.configService.inject(config);
        this.hasLoad = true;
        return this.configService;
      } catch (error) {
        throw new NotInWorkspaceError();
      }
    }
  }
}
