import { Rule, SchematicContext, Tree, url, apply, template, mergeWith, move } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function custom(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const sourceTemp = url('./files')

    const sourceParametrizedTemplates = apply(sourceTemp, [
      template({
        ..._options,
        ...strings
      }),
      move('.', _options.to || _options.name)
    ])

    return mergeWith(sourceParametrizedTemplates);
  };
}
