import { Rule, SchematicContext, Tree, url, apply, template, move, mergeWith, chain } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { upperCase } from 'lodash';
import { join } from 'path';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function service(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemp = url('./files')

    const sourceParametrizedTemplates = apply(sourceTemp, [
      template({
        ..._options,
        ...strings,
        upperCase: upperCase
      }),
      move('.', join(__dirname, '..', 'new'))
    ])

    const serviceFactory = tree.read(join(__dirname,'../new/src/serviceFactory.ts'))?.toString()
    const importnewService = `import { ${upperCase(_options.name)}Service } from "./services/${upperCase(_options.name)}Service";/n${serviceFactory}`
    const updatedFactory = importnewService?.replace('/*ADDNEWSERVICE*/', `, ${upperCase(_options.name)}Service /*ADDNEWSERVICE*/`)

    tree.overwrite(join(__dirname,'../new/src/serviceFactory.ts'), updatedFactory)

    return chain([
      mergeWith(sourceParametrizedTemplates)
    ])
  };
}
