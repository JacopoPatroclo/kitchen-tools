import { Rule, SchematicContext, Tree, url, apply, template, move, mergeWith, chain } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { camelCase } from 'lodash';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function service(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemp = url('./files')

    const sourceParametrizedTemplates = apply(sourceTemp, [
      template({
        ..._options,
        ...strings,
        camelCase: camelCase,
        templateName: '<%= name %>'
      }),
      move('.', `./src/new`)
    ])

    const serviceFactory = tree.read('./src/new/src/serviceFactory.ts')?.toString()
    const importnewService = `import { ${camelCase(_options.name)}Service } from "./services/${camelCase(_options.name)}Service";
    ${serviceFactory}`
    const updatedFactory = importnewService?.replace('/*ADDNEWSERVICE*/', `, ${camelCase(_options.name)}Service /*ADDNEWSERVICE*/`)

    tree.overwrite('./src/new/src/serviceFactory.ts', updatedFactory)

    return chain([
      mergeWith(sourceParametrizedTemplates)
    ])
  };
}
