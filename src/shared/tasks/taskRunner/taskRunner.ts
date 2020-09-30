import { join, resolve } from "path";
import { TaskExecutorGenericOptionsInterface } from "../taskExecutor/genericTaskExecutor";

export interface TaskInterface<T = any> {
  name: string;
  run: (options: T) => Promise<any>;
}

export class TaskNotFoundError extends Error {
  constructor(name: string) {
    super(`Unable to find ${name} task, check your syntax`);
  }
}

export class TaskRunner {
  private tasks: TaskInterface<TaskExecutorGenericOptionsInterface>[] = [];

  register(tasks: TaskInterface[]) {
    tasks.forEach((task) => {
      this.tasks.push(task);
    });
  }

  async execute(name: string, project: string, args: string[]) {
    console.log(this.tasks);
    const task = this.tasks.find((task) => task.name === name);
    if (task) {
      await task.run({
        command: args[0],
        workingDirectory: resolve(join(process.cwd(), "services", project)),
        args: args.slice(1, args.length),
      });
    } else {
      throw new TaskNotFoundError(name);
    }
  }
}
