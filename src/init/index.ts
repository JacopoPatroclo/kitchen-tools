import {
  Rule,
  SchematicContext,
  Tree,
  url,
  apply,
  template,
  mergeWith,
  move,
  chain,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import registerTaskExecutor from "../shared/tasks/helpers/schematicTaskExecutorRegister";
import {
  GitInitTaskTaskExec,
  GitInitTask,
} from "../shared/tasks/taskDescriptions/gitInitTask";
import { join } from "path";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function init(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (typeof _options.registry !== "string") {
      _options.registry = "registry.hub.docker.com";
    }

    registerTaskExecutor(_context, [GitInitTaskTaskExec]);

    const sourceTemp = url("./files");

    const sourceParametrizedTemplates = apply(sourceTemp, [
      template({
        ..._options,
        ...strings,
      }),
      move(".", `./${_options.name}`),
    ]);

    return chain([
      mergeWith(sourceParametrizedTemplates),
      log({
        name: _options.name,
      }),
    ]);
  };
}

function log(_options: { name: string }): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.addTask(
      new GitInitTask(join(process.cwd(), _options.name), _context)
    );
    return tree;
  };
}
