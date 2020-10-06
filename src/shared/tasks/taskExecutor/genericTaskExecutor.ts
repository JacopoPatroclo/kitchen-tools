import { spawn } from "cross-spawn";
import { TaskExecutor, SchematicContext } from "@angular-devkit/schematics";

export interface TaskExecutorGenericOptionsInterface {
  command: string;
  workingDirectory: string;
  args: string[];
}

export const execute = (
  options: TaskExecutorGenericOptionsInterface,
  ignoreErrorStream?: boolean
) => {
  const outputStream: any = "inherit";
  const errorStream = ignoreErrorStream ? "ignore" : process.stderr;
  const spawnOptions = {
    stdio: [process.stdin, outputStream, errorStream],
    shell: true,
    cwd: options.workingDirectory,
    env: {
      ...process.env,
    },
  };

  return new Promise<void>((resolve, reject) => {
    spawn(options.command, options.args, spawnOptions).on(
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

export default function (factoryOptions: any = {}): TaskExecutor<any> {
  return async (
    options: TaskExecutorGenericOptionsInterface,
    context: SchematicContext
  ) => {
    await execute(options, false);
  };
}
