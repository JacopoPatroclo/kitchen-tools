import { ServiceDescriptor } from "../serviceFactory";
import { url, apply, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";

const serviceTiplogy = 'wordpress'

export function wordpressService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/wordpress");

  const nginxServiceName = `${_context.name}_wordpress_nginx`
  const mysqlServiceName = `${_context.name}_wordpress_mysql`

  const dbNetwork = `mysql_${mysqlServiceName}_network`

  return {
    json: {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: serviceTiplogy,
      depends: [
        {
          type: 'nginx',
          options: {
            name: nginxServiceName,
            fpmService: `${_context.name}`,
            fpmServicePort: 9000
          }
        },
        {
          type: 'mysql',
          options: {
            name: mysqlServiceName,
          }
        }
      ]
    },
    templates: apply(templates, [template({ hostnameDb: mysqlServiceName, dbNetwork, ..._context, ...strings })]),
  };
}

wordpressService.tipology = serviceTiplogy