import { ServiceDescriptor } from "../../serviceFactory";
import { url, apply, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { resolve, join } from "path";
import { Service } from "../../../../shared/helpers/ConfigurationHelper";

export function CustomService(
  tipology: string,
  _context: any
): ServiceDescriptor {
  if (!_context?.name) {
    throw new Error("Missing name as a parameter");
  }

  if (!_context?.path) {
    throw new Error("Missing path as a parameter");
  }

  const resolvedPath = resolve(join(process.cwd(), _context.path));

  let serviceDescription: Service;
  try {
    const generateJsonConfig = require(join(resolvedPath, "schemaGenerator"));
    serviceDescription = {
      name: _context.name,
      dcompose: `./services/${_context.name}/docker-compose.yaml`,
      type: tipology,
      ...generateJsonConfig(_context),
    };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const templates = url(join(resolvedPath, "files"));

  return {
    json: serviceDescription,
    templates: apply(templates, [template({ ..._context, ...strings })]),
  };
}
