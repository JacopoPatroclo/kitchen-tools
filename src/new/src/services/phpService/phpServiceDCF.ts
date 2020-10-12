import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [context.name]: {
        build: buildConfig(context.name),
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        volumes: [
          "fpm_share_code:/usr/site/public",
          `./services/${context.name}/src:/usr/site/public`,
        ],
        networks: [`${context.name}_net`],
        environment: ["PHP_ENV=${PHP_ENV}"],
      },
    },
    networks: {
      [`${context.name}_net`]: null,
    },
    volumes: {
      ["fpm_share_code"]: null,
    },
  };
}
