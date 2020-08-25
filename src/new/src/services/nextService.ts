import { ServiceDescriptor } from "../serviceFactory";
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

export const NextJsTaskName = "next-task-name";

export interface TaskExecutorOptionsGenericInterface {
  command: string;
  workingDirectory: string;
  args: string[];
}

class NextJsTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorOptionsGenericInterface> {
    const example =
      this._context.example || "with-typescript-styled-components";
    return {
      name: NextJsTaskName,
      options: {
        command: "npx",
        args: ["create-next-app", "--example", example, "src"],
        workingDirectory: this.workingDirectory
      },
    };
  }
}

export const NextJsTaskTaskExec: TaskExecutorFactory<TaskExecutorOptionsGenericInterface> = {
  name: NextJsTaskName,
  create: (options) =>
    import("../taskExecutor/genericTaskExecutor").then((mod) =>
      mod.default(options)
    ),
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
    task: new NextJsTask(
      resolve(join(process.cwd(), "services", _context.name)),
      _context
    ),
  };
}

nextService.tipology = serviceTiplogy;
