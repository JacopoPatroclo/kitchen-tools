import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  const dbVolumeName = `mysql_data_${context.name}`;
  const networkDbName = `mysql_${context.name}_network`;
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        command: [
          "--character-set-server=utf8mb4",
          "--collation-server=utf8mb4_unicode_ci",
          "--default-authentication-plugin=mysql_native_password",
        ],
        build: buildConfig(context.name),
        volumes: [
          `./services/${context.name}/src/initdb:/docker-entrypoint-initdb.d`,
          `mysql_data_${context.name}:/var/lib/mysql`,
        ],
        networks: [networkDbName],
        environment: [
          "MYSQL_DATABASE=${MYSQL_DATABASE}",
          "MYSQL_USER=${MYSQL_USER}",
          "MYSQL_PASSWORD=${MYSQL_PASSWORD}",
          "MYSQL_RANDOM_ROOT_PASSWORD=yes",
        ],
      },
    },
    volumes: {
      [dbVolumeName]: null,
    },
    networks: {
      [networkDbName]: null,
    },
  };
}
