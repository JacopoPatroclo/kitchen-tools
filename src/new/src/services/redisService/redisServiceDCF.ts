import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  const dbVolume = `rediss_data_${context.name}`;
  const dbNetwork = `rediss_${context.name}_network`;
  return {
    version: "3.5",
    services: {
      [context.name]: {
        build: buildConfig(context.name),
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        volumes: [`${dbVolume}:/data`],
        networks: [dbNetwork],
        environment: ["REDIS_PASSWORD=${REDIS_PASSWORD}"],
      },
    },
    volumes: {
      [dbVolume]: null,
    },
    networks: {
      [dbNetwork]: null,
    },
  };
}
