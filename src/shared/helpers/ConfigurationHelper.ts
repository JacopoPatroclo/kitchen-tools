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

  hasService(serv: Service): boolean {
    return !!this.confObject.services.find(
      (service) => service.name === serv.name
    );
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
