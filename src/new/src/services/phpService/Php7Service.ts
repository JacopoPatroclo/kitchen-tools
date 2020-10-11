import { url, apply, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { ServiceDescriptor } from "../../../../shared/serviceFactory/ServiceFactory";

const serviceTiplogy = "php7";

export function Php7Service(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/php7");

  const nginxServiceName = `${_context.name}_php7_nginx`;

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
      depends: [
        {
          type: "nginx",
          options: {
            name: nginxServiceName,
            fpmService: `${_context.name}`,
            fpmServicePort: 9000,
            fpmCodePath: "/usr/site",
          },
        },
      ],
    },
    templates: apply(templates, [template({ ..._context, ...strings })]),
  };
}

Php7Service.tipology = serviceTiplogy;
