import { ConfigSchema } from "../../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../../shared/helpers/partialsDC/buildConfig";
import { generateDomainServiceName } from "../../../../../shared/helpers/Utils";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        build: buildConfig(context.name, true),
        environment: [
          `VIRTUAL_HOST=${generateDomainServiceName(context.name)}`,
        ],
        volumes: [`./services/${context.name}/src:/app`],
        networks: ["proxy"],
        stdin_open: true,
      },
    },
    networks: {
      proxy: {
        name: "tier_1",
      },
    },
  };
}
