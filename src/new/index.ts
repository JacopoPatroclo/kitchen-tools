import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from "@angular-devkit/schematics";
import { CONFIG_FILE_NAME } from "../shared/constants";
import { NotInWorkspaceError } from "../shared/errors/NotInWorkspaceError";
import { ConfigurationHelper } from "../shared/helpers/ConfigurationHelper";
import { DependencyManager } from "./src/dependencyManager/dependencyManager";
import { ServiceFactory, autoRegister } from "./src/serviceFactory";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function nev(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (!tree.exists(`./${CONFIG_FILE_NAME}`)) {
      throw new NotInWorkspaceError();
    }
    const rowData = tree.read(`./${CONFIG_FILE_NAME}`);
    if (!rowData) {
      throw new NotInWorkspaceError();
    }
    const config = new ConfigurationHelper(rowData.toString());
    const sFactory = new ServiceFactory()
    autoRegister(sFactory)
    const manager = new DependencyManager(config, sFactory)
    const ruleList = manager.resolve(_options.tipology, _options)

    tree.overwrite(`./${CONFIG_FILE_NAME}`, config.serialize());

    return chain(ruleList);
  };
}
