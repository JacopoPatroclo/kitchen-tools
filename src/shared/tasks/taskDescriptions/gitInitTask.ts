import {
  TaskConfigurationGenerator,
  TaskConfiguration,
  TaskExecutorFactory,
} from "@angular-devkit/schematics";
import { TaskExecutorGenericOptionsInterface } from "../taskExecutor/genericTaskExecutor";

export const GitInitTaskName = "git-init";

export class GitInitTask implements TaskConfigurationGenerator {
  constructor(private workingDirectory: string, private _context) {}

  toConfiguration(): TaskConfiguration<TaskExecutorGenericOptionsInterface> {
    return {
      name: GitInitTaskName,
      options: {
        command: "git init",
        args: [],
        workingDirectory: this.workingDirectory,
      },
    };
  }
}

export const GitInitTaskTaskExec: TaskExecutorFactory<TaskExecutorGenericOptionsInterface> = {
  name: GitInitTaskName,
  create: (options) =>
    import(
      "../../../shared/tasks/taskExecutor/genericTaskExecutor"
    ).then((mod) => mod.default(options)),
};
