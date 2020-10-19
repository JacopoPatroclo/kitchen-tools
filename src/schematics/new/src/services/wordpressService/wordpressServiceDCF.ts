import { ConfigSchema } from "../../../../../shared/helpers/dockerComposeWriter";
import { networkProxyConfig } from "../../../../../shared/helpers/partialsDC/networkProxy";
import { generateDomainServiceName } from "../../../../../shared/helpers/Utils";

function phpService(context: any) {
  return {
    image: "${REGISTRY}" + context.name + ":${TAG}",
    container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
    restart: "unless-stopped",
    build: {
      context: `./services/${context.name}`,
      dockerfile: "./docker/php/Dockerfile",
    },
    volumes: [
      `${context.name}_fpm_share_code:/usr/site/public`,
      `./services/${context.name}/src:/usr/site/public`,
    ],
    networks: [`${context.dbNetwork}`, `${context.name}_net`],
    environment: [
      "PHP_ENV=${PHP_ENV}",
      `MYSQL_HOST=${context.name}_wordpress_mysql`,
      "MYSQL_PASSWORD=${MYSQL_PASSWORD}",
      "MYSQL_USER=${MYSQL_USER}",
      "MYSQL_DATABASE=${MYSQL_DATABASE}",
    ],
  };
}

function nginxService(context: any) {
  return {
    image: "${REGISTRY}" + context.name + "_entrypoint:${TAG}",
    container_name: "${COMPOSE_PROJECT_NAME}." + context.name + "_entrypoint",
    restart: "unless-stopped",
    build: {
      context: `./services/${context.name}`,
      dockerfile: "./docker/nginx/Dockerfile",
    },
    volumes: [
      `${context.name}_fpm_share_code:/usr/site/public`,
      `./services/${context.name}/src:/usr/site/public`,
      `./services/${context.name}/docker/nginx/default.conf:/etc/nginx/conf.d/default.conf`,
    ],
    networks: [`${context.name}_net`, "proxy"],
    environment: [`VIRTUAL_HOST=${generateDomainServiceName(context.name)}`],
    depends_on: ["proxy", context.name],
  };
}

function nodeFrontendRunner(context: any) {
  return {
    image:
      "${REGISTRY}" +
      context.name +
      "_frunner_" +
      context.themeName +
      ":${TAG}",
    container_name:
      "${COMPOSE_PROJECT_NAME}." +
      context.name +
      "_frunner_" +
      context.themeName,
    restart: "unless-stopped",
    build: {
      context: `./services/${context.name}`,
      dockerfile: "./docker/node/Dockerfile",
    },
    volumes: [
      `${context.name}_fpm_share_code:/usr/site/public`,
      `./services/${context.name}/src:/usr/site/public`,
    ],
    networks: [`${context.name}_net`, "proxy"],
    environment: [
      "PHP_ENV=${PHP_ENV}",
      `VIRTUAL_HOST=${generateDomainServiceName(`${context.name}-dev`)}`,
      "VIRTUAL_PORT=80",
    ],
    depends_on: ["proxy", context.name],
  };
}

export default function (context: any): ConfigSchema {
  const services = {
    [context.name]: phpService(context),
    [`${context.name}_entrypoint`]: nginxService(context),
  };

  if (context.themeName) {
    services[
      `${context.name}_frunner_${context.themeName}`
    ] = nodeFrontendRunner(context);
  }

  return {
    version: "3.5",
    services,
    networks: {
      ...networkProxyConfig(),
      [`${context.name}_net`]: null,
      [`${context.dbNetwork}`]: null,
    },
    volumes: {
      [`${context.name}_fpm_share_code`]: null,
    },
  };
}
