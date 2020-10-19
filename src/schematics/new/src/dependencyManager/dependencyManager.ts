import { ConfigurationHelper } from "../../../../shared/helpers/ConfigurationHelper";

import {
  Tree,
  apply,
  move,
  mergeWith,
  SchematicContext,
  Rule,
} from "@angular-devkit/schematics";
import {
  ServiceDescriptor,
  ServiceFactory,
} from "../../../../shared/serviceFactory/ServiceFactory";

export class DependencyManager {
  constructor(
    private configService: ConfigurationHelper,
    private sFactory: ServiceFactory
  ) {}

  resolve(tipology: string, context: any) {
    const serviceDescription = this.sFactory.factory(tipology, context);
    if (this.configService.hasService(serviceDescription.json)) {
      throw new Error(
        `Unable to add service because it already exist with name ${context.name}`
      );
    }
    const serviceList = this.extractServicesList(serviceDescription);
    serviceList.push(serviceDescription);

    return [
      ...this.flatten(
        serviceList.map((serviceDesc) => [this.addService(serviceDesc)])
      ),
      this.runScript(serviceDescription),
    ];
  }

  addService(serviceDescription: ServiceDescriptor) {
    if (this.configService.hasService(serviceDescription.json)) {
      throw new Error(
        `Unable to add service because it already exist with name ${serviceDescription.json.name}`
      );
    }
    this.configService.addService(serviceDescription.json);
    return mergeWith(
      apply(serviceDescription.templates, [
        move(".", `./services/${serviceDescription.json.name}`),
      ])
    );
  }

  runScript(serviceDescription: ServiceDescriptor): Rule {
    return (_: Tree, context: SchematicContext) => {
      if (serviceDescription.tasks) {
        serviceDescription.tasks.forEach((task) => context.addTask(task));
      }
    };
  }

  extractServicesList(
    serviceDescription: ServiceDescriptor
  ): Array<ServiceDescriptor> {
    if (serviceDescription.json.depends?.length) {
      return this.flatten(
        serviceDescription.json.depends
          .map((dependentServiceConfig) =>
            this.sFactory.factory(
              dependentServiceConfig.type,
              dependentServiceConfig.options
            )
          )
          .map((service) => [service, ...this.extractServicesList(service)])
      );
    } else {
      return [];
    }
  }

  flatten<T>(
    items: Array<Array<T> | Array<Array<T>> | Array<Array<Array<T>>> | T>
  ): Array<T> {
    const flat: Array<T> = [];
    if (!Array.isArray(items)) {
      return [items];
    }
    items.forEach((item) => {
      if (Array.isArray(item)) {
        flat.push(...this.flatten(item));
      } else {
        flat.push(item);
      }
    });
    return flat;
  }
}
