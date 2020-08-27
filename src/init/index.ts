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

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function init(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (typeof _options.registry !== "string") {
      _options.registry = "registry.hub.docker.com";
    }

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
        message: `
Project named ${_options.name} created succesfuly:

  run cd ./${_options.name} and start bakeing !!
      `,
      }),
    ]);
  };
}

function log(_options: { message: string }): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    setTimeout(() => {
      console.log(_options.message);
    }, 500);
    return tree;
  };
}
