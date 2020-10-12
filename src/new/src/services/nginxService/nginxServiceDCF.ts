import { ConfigSchema } from "../../../../shared/helpers/dockerComposeWriter";
import { buildConfig } from "../../../../shared/helpers/partialsDC/buildConfig";
import { networkProxyConfig } from "../../../../shared/helpers/partialsDC/networkProxy";
import { generateDomainServiceName } from "../../../../shared/helpers/Utils";

export default function (context: any): ConfigSchema {
  const networks = {
    ...networkProxyConfig(),
  };
  const volumes = {};
  const depends_on = ["proxy", "dockergen"];
  const serviceVolumes = [
    `./services/${context.name}/docker/config/fastcgi_params.conf:/etc/nginx/fastcgi_params.conf`,
    `./services/${context.name}/docker/config/mime.types:/etc/nginx/conf/mime.types`,
    `./services/${context.name}/docker/config/nginx.conf:/etc/nginx/nginx.conf`,
    `./services/${context.name}/docker/config/proxy.conf:/etc/nginx/proxy.conf`,
  ];
  const serviceNetworks = ["proxy"];

  if (context.fpmService || context.proxyPass) {
    networks[`${context.fpmService || context.proxyPass}_net`] = null;
    volumes["fpm_share_code"] = null;
    serviceNetworks.push(`${context.fpmService || context.proxyPass}_net`);
    if (context.fpmService) {
      serviceVolumes.push(`fpm_share_code:${context.fpmCodePath}`);
      serviceVolumes.push(
        `./services/${context.fpmService}/src:${context.fpmCodePath}`
      );
    } else {
      serviceVolumes.push(
        `./services/${context.name}/src:${context.fpmCodePath}`
      );
    }
  }

  if (context.fpmService) {
    depends_on.push(context.fpmService);
  }

  if (context.proxyPass) {
    depends_on.push(context.proxyPass);
  }

  return {
    version: "3.5",
    services: {
      [context.name]: {
        build: buildConfig(context.name),
        image: "${REGISTRY}" + context.name + ":${TAG}",
        container_name: "${COMPOSE_PROJECT_NAME}." + context.name,
        restart: "unless-stopped",
        volumes: serviceVolumes,
        environment: [
          `VIRTUAL_HOST=${generateDomainServiceName(
            context.fpmService || context.proxyPass
          )}`,
        ],
        networks: serviceNetworks,
        depends_on,
      },
    },
    networks,
    volumes,
  };
}
