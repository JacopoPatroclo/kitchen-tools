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
import { ServiceDescriptor } from "../../../../shared/serviceFactory/ServiceFactory";

export const NextJsTaskName = "next-task-name";

class NextJsTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    const example =
      this._context.example || "with-typescript-styled-components";
    return {
      name: NextJsTaskName,
      options: {
        command: "npx",
        args: ["create-next-app", "--example", example, "src"],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const NextJsTaskTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: NextJsTaskName,
  create: (options) =>
    import(
      "../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = "next";

export function nextService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/next");

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
    },
    templates: apply(templates, [template({ ..._context, ...strings })]),
    tasks: [
      new NextJsTask(
        resolve(join(process.cwd(), "services", _context.name)),
        _context
      ),
    ],
  };
}

nextService.tipology = serviceTiplogy;
