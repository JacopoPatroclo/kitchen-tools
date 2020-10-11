import {
  url,
  apply,
  template,
  TaskConfigurationGenerator,
  TaskConfiguration,
  TaskExecutorFactory,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { TaskExecutorGenericOptionsInterface } from "../../../../shared/tasks/taskExecutor/genericTaskExecutor";
import { COMPOSER_BIN } from "../../../../shared/constants";
import { join, resolve } from "path";
import { ServiceDescriptor } from "../../../../shared/serviceFactory/ServiceFactory";

export const AddSageTaskName = "add-sage-task-name";

class AddSageTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    const name = this._context.themeName;
    return {
      name: AddSageTaskName,
      options: {
        command: COMPOSER_BIN,
        args: ["create-project", "roots/sage", name],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const AddSageTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: AddSageTaskName,
  create: (options) =>
    import(
      "../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

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
      "../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = "wordpress";

export function wordpressService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/wordpress");

  const mysqlServiceName = `${_context.name}_wordpress_mysql`;

  const dbNetwork = `mysql_${mysqlServiceName}_network`;

  const tasks: TaskConfigurationGenerator[] = [];

  tasks.push(
    new ComposerInstallTask(
      resolve(join(process.cwd(), "services", _context.name, "src")),
      _context
    )
  );

  if (typeof _context.sageThemeName === "string") {
    tasks.push(
      new AddSageTask(
        resolve(
          join(
            process.cwd(),
            "services",
            _context.name,
            "src",
            "wp-content",
            "themes"
          )
        ),
        {
          ..._context,
          themeName: _context.sageThemeName,
        }
      )
    );
  }

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
      options: {
        themeName: _context.sageThemeName,
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
        ..._context,
        ...strings,
      }),
    ]),
    tasks,
  };
}

wordpressService.tipology = serviceTiplogy;
