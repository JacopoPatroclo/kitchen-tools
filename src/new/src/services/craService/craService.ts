import { ServiceDescriptor } from "../../serviceFactory";
import {
  url,
  apply,
  template,
  TaskConfigurationGenerator,
  TaskConfiguration,
  TaskExecutorFactory,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { resolve, join } from "path";
import { TaskExecutorGenericOptionsInterface } from "../../../../shared/tasks/taskExecutor/genericTaskExecutor";

export const CRAJsTaskName = "CRA-task-name";

class CRAJsTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    const template = this._context.template || "typescript";
    return {
      name: CRAJsTaskName,
      options: {
        command: "npx",
        args: ["create-react-app", "--template", template, "src"],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const CRAJsTaskTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: CRAJsTaskName,
  create: (options) =>
    import(
      "../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = "cra";

export function craService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/cra");

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
    },
    templates: apply(templates, [template({ ..._context, ...strings })]),
    tasks: [
      new CRAJsTask(
        resolve(join(process.cwd(), "services", _context.name)),
        _context
      ),
    ],
  };
}

craService.tipology = serviceTiplogy;
