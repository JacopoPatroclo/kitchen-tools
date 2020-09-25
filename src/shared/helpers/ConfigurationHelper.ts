import { readFileSync } from "fs";
import { join } from "path";
import { CONFIG_FILE_NAME } from "../constants";
import { NotInWorkspaceError } from "../errors/NotInWorkspaceError";

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
}

export interface Configuration {
  name: string;
  services: Array<Service>;
  env: BaseEnv & {
    [key: string]: any;
  };
}

export class ConfigurationHelper {
  private confObject: Configuration;

  constructor(rawData: string) {
    this.confObject = JSON.parse(rawData);
  }

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

export function makeConfiguratorFacade() {
  const basePath = process?.cwd();
  if (basePath) {
    const pathConfig = join(basePath, CONFIG_FILE_NAME);
    try {
      const config = readFileSync(pathConfig).toString();
      return new ConfigurationHelper(config);
    } catch (error) {
      throw new NotInWorkspaceError();
    }
  }
  throw new Error("Unable to find basepath, you are in NodeJS context right?");
}
