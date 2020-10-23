import {
  url,
  apply,
  template,
  TaskConfigurationGenerator,
  TaskConfiguration,
  TaskExecutorFactory,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { TaskExecutorGenericOptionsInterface } from "../../../../../shared/tasks/taskExecutor/genericTaskExecutor";
import { COMPOSER_BIN } from "../../../../../shared/constants";
import { join, resolve } from "path";
import { ServiceDescriptor } from "../../../../../shared/serviceFactory/ServiceFactory";
import { generateDomainServiceName } from "../../../../../shared/helpers/Utils";

export const ComposerInstallTaskName = "composer-install-task-name";

class ComposerInstallTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    return {
      name: ComposerInstallTaskName,
      options: {
        command: COMPOSER_BIN,
        args: ["install"],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const ComposerInstallTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: ComposerInstallTaskName,
  create: (options) =>
    import(
      "../../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = "wordpress-react";

export function wordpressReactService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  _context.themeName = _context.themeName || `${_context.name}-theme`;

  const templates = url("./files/services/wordpress-react");

  const mysqlServiceName = `${_context.name}_wordpress_mysql`;

  const dbNetwork = `mysql_${mysqlServiceName}_network`;

  const tasks: TaskConfigurationGenerator[] = [];

  tasks.push(
    new ComposerInstallTask(
      resolve(join(process.cwd(), "services", _context.name, "src")),
      _context
    )
  );

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
      options: {
        themeName: _context.themeName,
        dbNetwork,
      },
      depends: [
        {
          type: "mysql",
          options: {
            name: mysqlServiceName,
          },
        },
      ],
    },
    templates: apply(templates, [
      template({
        hostnameDb: mysqlServiceName,
        dbNetwork,
        themeName: _context.sageThemeName,
        devUri: generateDomainServiceName(`${_context.name}-dev`),
        ..._context,
        ...strings,
      }),
    ]),
    tasks,
  };
}

wordpressReactService.tipology = serviceTiplogy;
