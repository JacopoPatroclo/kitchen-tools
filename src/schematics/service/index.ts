import {
  Rule,
  SchematicContext,
  Tree,
  url,
  apply,
  template,
  move,
  mergeWith,
  chain,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { camelCase } from "lodash";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function service(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemp = url("./files");

    const sourceParametrizedTemplates = apply(sourceTemp, [
      template({
        ..._options,
        ...strings,
        camelCase: camelCase,
        templateName: "<%= name %>",
      }),
      move(".", `./src/schematics/new`),
    ]);

    const serviceFactory = tree
      .read("./src/schematics/new/src/serviceFactory.ts")
      ?.toString();
    const importnewService = `import { ${camelCase(
      _options.name
    )}Service } from "./services/${camelCase(_options.name)}Service/${camelCase(
      _options.name
    )}Service";
${serviceFactory}`;
    const updatedFactory = importnewService?.replace(
      "/*ADDNEWSERVICE*/",
      `, ${camelCase(_options.name)}Service /*ADDNEWSERVICE*/`
    );
    tree.overwrite(
      "./src/schematics/new/src/serviceFactory.ts",
      updatedFactory
    );

    const pathDockerGenerator =
      "./src/schematics/new/src/docker.generator.map.json";
    const dockerComposeGenerationMap = JSON.parse(
      tree.read(pathDockerGenerator)!.toString()
    );
    dockerComposeGenerationMap[_options.name] = `./services/${camelCase(
      _options.name
    )}Service/${camelCase(_options.name)}ServiceDCF`;
    tree.overwrite(
      pathDockerGenerator,
      JSON.stringify(dockerComposeGenerationMap, null, 2)
    );

    return chain([mergeWith(sourceParametrizedTemplates)]);
  };
}
