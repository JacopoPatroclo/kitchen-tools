import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        build: buildConfig(context.name),
        volumes: [],
        networks: [],
        environment: [],
      },
    },
    volumes: {},
    networks: {},
  };
}
