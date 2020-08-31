import { SpawnOptions, spawn } from "child_process";
import { TaskExecutor, SchematicContext } from "@angular-devkit/schematics";

export interface TaskExecutorGenericOptionsInterface {
  command: string;
  workingDirectory: string;
  args: string[];
}

export default function (factoryOptions: any = {}): TaskExecutor<any> {
  return async (
    options: TaskExecutorGenericOptionsInterface,
    context: SchematicContext
  ) => {
    const execute = (args: string[], ignoreErrorStream?: boolean) => {
      const outputStream = "inherit";
      const errorStream = ignoreErrorStream ? "ignore" : process.stderr;
      const spawnOptions: SpawnOptions = {
        stdio: [process.stdin, outputStream, errorStream],
        shell: true,
        cwd: options.workingDirectory,
        env: {
          ...process.env,
        },
      };

      return new Promise<void>((resolve, reject) => {
        spawn(options.command, args, spawnOptions).on(
          "close",
          (code: number) => {
            if (code === 0) {
              resolve();
            } else {
              reject(code);
            }
          }
        );
      });
    };
    await execute(options.args);
  };
}
