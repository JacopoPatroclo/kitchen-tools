import { ConfigSchema } from "../../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../../shared/helpers/partialsDC/buildConfig";
import { networkProxyConfig } from "../../../../../shared/helpers/partialsDC/networkProxy";
import { generateDomainServiceName } from "../../../../../shared/helpers/Utils";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        build: buildConfig(context.name),
        volumes: [`./services/${context.name}/src:/usr/src/app`],
        environment: [
          "NODE_ENV=${NODE_ENV}",
          "PORT=9000",
          `VIRTUAL_HOST=${generateDomainServiceName(context.name)}`,
        ],
        networks: ["proxy"],
        depends_on: ["proxy", "dockergen"],
      },
    },
    networks: {
      ...networkProxyConfig(),
    },
  };
}
