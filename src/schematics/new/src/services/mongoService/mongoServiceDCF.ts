import { ConfigSchema } from "../../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  const dbVolumeName = `mongo_data_${context.name}`;
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        build: buildConfig(context.name),
        volumes: [
          `./services/${context.name}/src/initdb:/docker-entrypoint-initdb.d`,
          `${dbVolumeName}:/data/db`,
        ],
        environment: [
          "MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}",
          "MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}",
          "MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}",
        ],
      },
    },
    volumes: {
      [dbVolumeName]: null,
    },
    networks: {
      [`mongo_${context.name}_network`]: null,
    },
  };
}
