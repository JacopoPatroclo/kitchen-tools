#!/usr/bin/env node

import { ConfigurationHelper } from "../shared/helpers/ConfigurationHelper";
import * as yaml from "js-yaml";
import { join, resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { merge } from "lodash";
import { spawnSync } from "child_process";
import { CONFIG_FILE_NAME, KOMPOSE_FILENAME } from "../shared/constants";

const komposePath = resolve(
  join(__dirname, "..", "bin", "kompose", KOMPOSE_FILENAME)
);

let workspaceConfig = null;
try {
  workspaceConfig = require(resolve(join(process.cwd(), CONFIG_FILE_NAME)));
} catch (error) {
  console.error(
    "Unable to load wkspace.json, are you sure you are in the correct directory"
  );
  process.exit(1);
}

const config = new ConfigurationHelper(JSON.stringify(workspaceConfig));
const basePath = process.cwd();
const baseDockerCompose = {
  version: "3.5",
};
const dockerComposeProdPath = join(basePath, "docker-compose.prod.yaml");

console.log(`Generating production files for ${config.projectName}`);

// Get all the project docker-composes
const dockerComposes = config.services.map((service) => {
  const dcContent = readFileSync(
    join(basePath, service.dcompose),
    "utf8"
  ).toString();
  const dockerCompose = yaml.safeLoad(dcContent) as any;
  return {
    ...dockerCompose,
    services: Object.keys(dockerCompose.services)
      .map((service) => ({
        key: service,
        config: dockerCompose.services[service],
      }))
      .map((dc) => {
        // Remove all the build configurations
        const conf = { ...dc.config };
        conf.build = null;
        delete conf.build;
        // Remove all the volumes that are referring to the current file structure
        conf.volumes = conf.volumes?.filter(
          (volume: string) => !volume.includes("./services")
        );
        // Remove dependency form proxy
        conf.depends_on =
          conf.depends_on?.filter(
            (dep) => dep !== "proxy" && dep !== "dockergen"
          ) || [];
        if (conf.depends_on.length <= 0) {
          delete conf.depends_on;
        }
        return { ...dc, config: sostituteEnv(conf, config) };
      })
      .reduce((acc, obj) => ({ ...acc, [obj.key]: obj.config }), {}),
  };
});

console.log(
  `Target project are ${config.services
    .map((service) => service.name)
    .join(", ")}`
);

// Merge in one docker-compose all the selected services (without the proxy stuff)
const mergedDockerCompose = dockerComposes.reduce(
  (acc, dc) => merge(acc, dc),
  baseDockerCompose
);

writeFileSync(dockerComposeProdPath, yaml.safeDump(mergedDockerCompose));

spawnSync(
  komposePath,
  [
    "convert",
    "-f",
    dockerComposeProdPath,
    "-o kube.yml",
    ...process.argv.slice(2, process.argv.length),
  ],
  {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
    },
    stdio: [process.stdin, process.stdout, process.stderr],
  }
);

function sostituteEnv(conf, wconfig: ConfigurationHelper) {
  if (conf.image) {
    conf.image = (conf.image as string).replace(
      "${REGISTRY}",
      wconfig.env.REGISTRY
    );
  }
  if (conf.container_name) {
    conf.container_name = (conf.container_name as string).replace(
      "${COMPOSE_PROJECT_NAME}",
      wconfig.env.COMPOSE_PROJECT_NAME
    );
  }
  return conf;
}
