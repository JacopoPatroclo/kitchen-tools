import "reflect-metadata";
import { Source, TaskConfigurationGenerator } from "@angular-devkit/schematics";
import { injectable } from "inversify";
import { CustomService } from "../../new/src/services/customService/CustomService";
import { Service } from "../helpers/ConfigurationHelper";

export interface ServiceDescriptor {
  json: Service;
  templates: Source;
  tasks?: Array<TaskConfigurationGenerator>;
}

type FunctionServiceDescriptor = (context: any) => ServiceDescriptor;

export interface ServiceDescriptorCreator extends FunctionServiceDescriptor {
  tipology: string;
}

@injectable()
export class ServiceFactory {
  private serivceMap = new Map<string, ServiceDescriptorCreator>();

  register(service: ServiceDescriptorCreator) {
    this.serivceMap.set(service.tipology, service);
  }

  factory(tipology: string, _context: any) {
    if (this.serivceMap.has(tipology)) {
      return this.serivceMap.get(tipology)!(_context);
    } else {
      return CustomService(tipology, _context);
    }
  }

  services() {
    return this.serivceMap.keys();
  }

  autoRegister(services: Array<ServiceDescriptorCreator>) {
    services.forEach((service) => this.register(service));
    return this;
  }
}
