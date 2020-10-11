import { readFileSync } from "fs";
import { injectable } from "inversify";
import { safeLoad } from "js-yaml";
import { flatten } from "lodash";
import { join } from "path";
import { ConfigFacade } from "../../../../shared/helpers/injectableServices/Config.service";
import { LoggerService } from "../../../../shared/helpers/injectableServices/Logger.service";
import { PathResolverService } from "../../../../shared/helpers/injectableServices/PathResolver.service";

@injectable()
export class GenerateHostHandler {
  constructor(
    private logger: LoggerService,
    private config: ConfigFacade,
    private pathResolver: PathResolverService
  ) {}

  handle() {
    const hostFile = this.config
      .expose()
      .services.map((service) => {
        const pathDc = join(this.pathResolver.cwd(), service.dcompose);
        const fileContent = readFileSync(pathDc).toString();
        const parsedDc = safeLoad(fileContent) as any;
        return (
          flatten(
            Object.keys(parsedDc?.services).map(
              (serviceName) =>
                parsedDc?.services[serviceName]?.environment || []
            )
          ) || []
        );
      })
      .reduce((acc, newEnvs) => [...acc, ...newEnvs], [])
      // Filter out all the fixed values
      .filter((env: string) => !!env.match(/VIRTUAL_HOST=/g))
      .map((env) =>
        /(VIRTUAL_HOST=)((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])/g.exec(
          env
        )
      )
      .map((match) => (match && match[2] ? match[2] : null))
      .filter((a) => !!a)
      .map((domain) => `127.0.0.1 ${domain}`)
      .reduce(
        (acc, host) => `${acc}\n${host}`,
        "## Host File generated via kitchen-tools ##"
      );
    this.logger.warn("Add this to your host file:");
    this.logger.plain(hostFile);
  }
}
