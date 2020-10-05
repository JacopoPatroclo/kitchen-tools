import { ServiceDescriptor } from "../../serviceFactory";
import { url, apply, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { execSync } from "child_process";

const serviceTiplogy = "laravel";

const generatedAppKey = () => {
  const key = execSync('echo "base64:$(openssl rand -base64 32)"', {
    encoding: "utf8",
  });
  return key.trim();
};

export function LaravelService(_context: any): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  const templates = url("./files/services/laravel");

  const nginxServiceName = `${_context.name}_laravel_nginx`;

  const dbServiceName = `${_context.name}_laravel_${
    _context.db ? _context.db : "postgres"
  }`;

  let databaseService = {
    type: _context.db ? _context.db : "postgres",
    options: {
      name: dbServiceName,
    },
  };

  const dbNetwork = `${
    _context.db ? _context.db : "postgres"
  }_${dbServiceName}_network`;
  const dbHost = dbServiceName;

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
        databaseService,
      ],
    },
    templates: apply(templates, [
      template({
        dbNetwork,
        dbHost,
        generatedAppKey: generatedAppKey(),
        ..._context,
        ...strings,
      }),
    ]),
  };
}

LaravelService.tipology = serviceTiplogy;
