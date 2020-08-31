import { NodeModulesEngineHost } from "@angular-devkit/schematics/tools";
import {
  TaskExecutorFactory,
  SchematicContext,
} from "@angular-devkit/schematics";

export default function registerTaskExecutor<T = any>(
  _context: SchematicContext,
  tasksExecutors: Array<TaskExecutorFactory<T>>
) {
  const host = <NodeModulesEngineHost>(<any>_context.engine)._host;

  tasksExecutors.forEach((tasksExecutor) => {
    host.registerTaskExecutor<T>(tasksExecutor);
  });
}
