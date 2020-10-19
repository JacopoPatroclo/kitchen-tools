import {
  url,
  apply,
  template,
  TaskExecutorFactory,
  TaskConfiguration,
  TaskConfigurationGenerator,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { TaskExecutorGenericOptionsInterface } from "../../../../../shared/tasks/taskExecutor/genericTaskExecutor";
import { join, resolve } from "path";
import { COMPOSER_BIN } from "../../../../../shared/constants";
import { ServiceDescriptor } from "../../../../../shared/serviceFactory/ServiceFactory";

export const LaravelTaskName = "laravel-init-task-name";

class LaravelTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    return {
      name: LaravelTaskName,
      options: {
        command: COMPOSER_BIN,
        args: ["create-project", "--prefer-dist", "laravel/laravel", "src"],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const LaravelTaskTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: LaravelTaskName,
  create: (options) =>
    import(
      "../../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = "laravel";

export function LaravelService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/laravel");

  const db = _context.db ? _context.db : "mysql";
  const dbServiceName = `${_context.name}_laravel_${db}`;

  const redisServiceName = `${_context.name}_laravel_redis`;

  const databaseService = {
    type: db,
    options: {
      name: dbServiceName,
    },
  };

  const cacheService = {
    type: "redis",
    options: {
      name: redisServiceName,
    },
  };

  const dbNetwork = `${db}_${dbServiceName}_network`;
  const redisNetwork = `${redisServiceName}_network`;
  const dbHost = dbServiceName;

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
      options: {
        dbNetwork,
        dbHost,
        redisNetwork,
      },
      depends: [databaseService],
    },
    templates: apply(templates, [
      template({
        dbNetwork,
        dbHost,
        ..._context,
        ...strings,
      }),
    ]),
    tasks: [
      new LaravelTask(
        resolve(join(process.cwd(), "services", _context.name)),
        _context
      ),
    ],
  };
}

LaravelService.tipology = serviceTiplogy;
