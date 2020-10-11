
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

export const <%= camelCase(name) %>TaskName = "<%= camelCase(name) %>-task-name";

class <%= camelCase(name) %>Task implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    return {
      name: <%= camelCase(name) %>TaskName,
      options: {
        command: "some command",
        args: ["some", "args"],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

// You need to add this in /src/new/index.ts in order to be registered properly
export const <%= camelCase(name) %>TaskTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: <%= camelCase(name) %>TaskName,
  create: (options) =>
    import(
      "../../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};

const serviceTiplogy = '<%= name %>'

export function <%= camelCase(name) %>Service(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/<%= name %>");

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy
    },
    templates: apply(templates, [template({ ..._context, ...strings })]),
    tasks: [
      new  <%= camelCase(name) %>Task(
        resolve(join(process.cwd(), "services", _context.name)),
        _context
      ),
    ],
  };
}

<%= camelCase(name) %>Service.tipology = serviceTiplogy