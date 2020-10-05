import { craService } from "./services/craService/craService";
import { nextService } from "./services/nextService/nextService";
import { redisService } from "./services/redisService/redisService";
import { mongoService } from "./services/mongoService/mongoService";
import { mysqlService } from "./services/mysqlService/mysqlService";
import { wordpressService } from "./services/wordpressService/wordpressService";
import { postgresService } from "./services/postgresService/postgresService";

import { Service } from "../../shared/helpers/ConfigurationHelper";
import { Source, TaskConfigurationGenerator } from "@angular-devkit/schematics";
import { NodeService } from "./services/nodeService/NodeService";
import { CustomService } from "./services/customService/CustomService";
import { Php7Service } from "./services/phpService/Php7Service";
import { NginxService } from "./services/nginxService/NginxService";
import { LaravelService } from "./services/laravelService/laravelService";

// prettier-ignore
const services = [NodeService, Php7Service, NginxService, postgresService , wordpressService , mysqlService , mongoService , redisService, LaravelService , nextService , craService /*ADDNEWSERVICE*/];
// prettier-ignore-end
export interface ServiceDescriptor {
  json: Service;
  templates: Source;
  tasks?: Array<TaskConfigurationGenerator>;
}

type FunctionServiceDescriptor = (context: any) => ServiceDescriptor;

export interface ServiceDescriptorCreator extends FunctionServiceDescriptor {
  tipology: string;
}

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
}

export const autoRegister = (sFactory: ServiceFactory) => {
  services.forEach((service) => sFactory.register(service));
  return sFactory;
};
