import { ServiceDescriptor } from "../../serviceFactory";
import { url, apply, template, Tree, Rule } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { readFileSync, writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { makeConfiguratorFacade } from "../../../../shared/helpers/ConfigurationHelper";

const serviceTiplogy = "nginx";

const updateNetworkOfTarget: (options) => Rule = (options) => (
  tree: Tree,
  _context
) => {
  if (options.fpmService || options.proxyPass) {
    const serviceName = options.fpmService || options.proxyPass;
    const config = makeConfiguratorFacade();
    const networkNew = `${serviceName}_net`;
    if (config.hasService(serviceName)) {
      const dcPath = config.getService(serviceName)!.dcompose;
      const dcfileContent = readFileSync(dcPath).toString();
      const dockerfile = yaml.safeLoad(dcfileContent) as any;
      if (dockerfile?.services[serviceName]) {
        if (!Array.isArray(dockerfile?.services[serviceName]?.networks)) {
          dockerfile!.services[serviceName]!.networks = [];
        }
        dockerfile!.services[serviceName]!.networks.push(networkNew);
        writeFileSync(dcPath, yaml.dump(dockerfile));
        console.log(`Add network ${networkNew} to ${serviceName}`);
      }
    }
    return tree;
  }
};

export function NginxService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/nginx");

  const templateOptions = {
    fpmCodePath: "/usr/site/public",
    fpmIndexService: null,
    fpmService: null,
    proxyPass: null,
    proxyProtocol: null,
    proxyPassRewrite: false,
    ..._context,
    ...strings,
  };

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
    },
    templates: apply(templates, [
      template(templateOptions),
      updateNetworkOfTarget(templateOptions),
    ]),
  };
}

NginxService.tipology = serviceTiplogy;