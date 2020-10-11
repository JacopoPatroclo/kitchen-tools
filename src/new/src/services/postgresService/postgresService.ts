import { url, apply, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { ServiceDescriptor } from "../../../../shared/serviceFactory/ServiceFactory";

const serviceTiplogy = "postgres";

export function postgresService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/postgres");

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
    },
    templates: apply(templates, [
      template({ fpmService: null, proxyPass: null, ..._context, ...strings }),
    ]),
  };
}

postgresService.tipology = serviceTiplogy;
