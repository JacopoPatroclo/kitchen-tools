import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";

export default function (context: any): ConfigSchema {
  return {
    version: "3.5",
    services: {
      [context.name]: {
        image: "${REGISTRY}" + context.name + ":latest",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        build: buildConfig(context.name),
        volumes: [
          "fpm_share_code:/usr/site",
          `./services/${context.name}/src:/usr/site`,
        ],
        environment: [
          "PHP_ENV=${PHP_ENV}",
          `APP_NAME=${context.name}`,
          "APP_ENV=${PHP_ENV}",
          `APP_KEY=${context.appkey}`,
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
    },
    volumes: {
      ["fpm_share_code"]: null,
    },
  };
}
