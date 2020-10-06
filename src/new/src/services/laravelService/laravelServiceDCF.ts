import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { generateDomainServiceName } from "../../../../shared/helpers/Utils";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [`${context.name}_frontend_runner`]: {
        build: {
          context: `./services/${context.name}`,
          dockerfile: "./docker/node/Dockerfile",
        },
        image: "${REGISTRY}" + context.name + "_frontend_runner:latest",
        container_name:
          "${COMPOSE_PROJECT_NAME}." + context.name + "_frontend_runner",
        restart: "unless-stopped",
        volumes: [
          `${context.name}_fpm_share_code:/usr/site`,
          `./services/${context.name}/src:/usr/site`,
        ],
        environment: ["PHP_ENV=${PHP_ENV}"],
      },
      [`${context.name}_ingress`]: {
        image: "${REGISTRY}" + context.name + "_entrypoint:latest",
        container_name:
          "${COMPOSE_PROJECT_NAME}." + context.name + "_entrypoint",
        restart: "unless-stopped",
        build: {
          context: `./services/${context.name}`,
          dockerfile: "./docker/nginx/Dockerfile",
        },
        volumes: [
          `${context.name}_fpm_share_code:/usr/site`,
          `./services/${context.name}/src:/usr/site`,
          `./services/${context.name}/docker/nginx/default.conf:/etc/nginx/conf.d/default.conf`,
        ],
        networks: [`${context.name}_net`, "proxy"],
        environment: [
          `VIRTUAL_HOST=${generateDomainServiceName(context.name)}`,
        ],
        depends_on: ["proxy", context.name],
      },
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":latest",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        networks: [
          context.redisNetwork,
          context.dbNetwork,
          `${context.name}_net`,
        ],
        build: {
          context: `./services/${context.name}`,
          dockerfile: "./docker/laravel/Dockerfile",
        },
        volumes: [
          `${context.name}_fpm_share_code:/usr/site`,
          `./services/${context.name}/src:/usr/site`,
        ],
        environment: [
          "PHP_ENV=${PHP_ENV}",
          `APP_NAME=${context.name}`,
          "APP_ENV=${PHP_ENV}",
          "APP_KEY=${APP_KEY}",
          "APP_DEBUG=${APP_DEBUG}",
          "APP_URL=${APP_URL}",
          "LOG_CHANNEL=${LOG_CHANNEL}",
          "DB_CONNECTION=${DB_CONNECTION}",
          `DB_HOST=${context.dbHost}`,
          "DB_PORT=${DB_PORT}",
          "DB_DATABASE=${DB_DATABASE}",
          "DB_USERNAME=${DB_USERNAME}",
          "DB_PASSWORD=${DB_PASSWORD}",
          "BROADCAST_DRIVER=${BROADCAST_DRIVER}",
          "CACHE_DRIVER=${CACHE_DRIVER}",
          "QUEUE_CONNECTION=${QUEUE_CONNECTION}",
          "SESSION_DRIVER=${SESSION_DRIVER}",
          "SESSION_LIFETIME=${SESSION_LIFETIME}",
          "REDIS_HOST=${REDIS_HOST}",
          "REDIS_PASSWORD=${REDIS_PASSWORD}",
          "REDIS_PORT=${REDIS_PORT}",
          "MAIL_MAILER=${MAIL_MAILER}",
          "MAIL_HOST=${MAIL_HOST}",
          "MAIL_PORT=${MAIL_PORT}",
          "MAIL_USERNAME=${MAIL_USERNAME}",
          "MAIL_PASSWORD=${MAIL_PASSWORD}",
          "MAIL_ENCRYPTION=${MAIL_ENCRYPTION}",
          "MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}",
          "MAIL_FROM_NAME=${MAIL_FROM_NAME}",
          "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}",
          "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}",
          "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}",
          "AWS_BUCKET=${AWS_BUCKET}",
          "PUSHER_APP_ID=${PUSHER_APP_ID}",
          "PUSHER_APP_KEY=${PUSHER_APP_KEY}",
          "PUSHER_APP_SECRET=${PUSHER_APP_SECRET}",
          "PUSHER_APP_CLUSTER=${PUSHER_APP_CLUSTER}",
          "MIX_PUSHER_APP_KEY=${MIX_PUSHER_APP_KEY}",
          "MIX_PUSHER_APP_CLUSTER=${MIX_PUSHER_APP_CLUSTER}",
        ],
      },
    },
    networks: {
      [`${context.name}_net`]: null,
      [context.dbNetwork]: null,
      [context.redisNetwork]: null,
    },
    volumes: {
      [`${context.name}_fpm_share_code`]: null,
    },
  };
}
