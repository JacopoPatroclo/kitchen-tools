import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  const networkDb = `postgres_${context.name}_network`;
  return {
    version: "3.5",
    services: {
      [context.name]: {
        build: buildConfig(context.name),
        image: "${REGISTRY}" + context.name + ":latest",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        networks: [networkDb],
        volumes: [
          `./services/${context.name}/src/initdb:/docker-entrypoint-initdb.d`,
          `./services/${context.name}/docker/postgresql:/etc/postgresql`,
          `postgres_data_${context.name}:/var/lib/postgresql/data`,
        ],
        environment: [
          "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}",
          "POSTGRES_USER=${POSTGRES_USER}",
          "POSTGRES_DB=${POSTGRES_DB}",
          "POSTGRES_INITDB_ARGS=${POSTGRES_INITDB_ARGS}",
          "POSTGRES_INITDB_WALDIR=${POSTGRES_INITDB_WALDIR}",
          "POSTGRES_HOST_AUTH_METHOD=${POSTGRES_HOST_AUTH_METHOD}",
        ],
      },
    },
    volumes: {
      [`postgres_data_${context.name}`]: null,
    },
    networks: {
      [networkDb]: null,
    },
  };
}
