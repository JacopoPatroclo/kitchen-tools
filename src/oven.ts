#!/usr/bin/env node

import { ConfigurationHelper } from "./shared/helpers/ConfigurationHelper";
import { spawnSync } from "child_process";
import { join, resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { safeLoad } from "js-yaml";

let workspaceConfig: any = {};
try {
  workspaceConfig = require(resolve(join(process.cwd(), "wkspace.json")));
} catch (error) {
  console.error(
    "Unable to load wkspace.json, are you sure you are in the correct directory"
  );
  process.exit(1);
}

const envFilePath = resolve(join(process.cwd(), ".env.example"));

const config = new ConfigurationHelper(JSON.stringify(workspaceConfig));

const dockerFilesList = config.services.map(
  (service) => `-f ${service.dcompose}`
);

if (process.argv[2] === "env") {
  const envFile = config.services
    .map((service) => {
      const pathDc = join(process.cwd(), service.dcompose);
      const fileContent = readFileSync(pathDc).toString();
      const parsedDc = safeLoad(fileContent) as any;
      return parsedDc?.services[service.name]?.environment || [];
    })
    .reduce((acc, newEnvs) => [...acc, ...newEnvs], [])
    // Filter out all the fixed values
    .filter((env: string) => !!env.match(/\$\{/g))
    .join("\n");

  writeFileSync(envFilePath, envFile);
  console.log("Created an example.env file from the project services");
  process.exit(0);
}

if (process.argv[2] === "host") {
  const hostFile = config.services
    .map((service) => {
      const pathDc = join(process.cwd(), service.dcompose);
      const fileContent = readFileSync(pathDc).toString();
      const parsedDc = safeLoad(fileContent) as any;
      return parsedDc?.services[service.name]?.environment || [];
    })
    .reduce((acc, newEnvs) => [...acc, ...newEnvs], [])
    // Filter out all the fixed values
    .filter((env: string) => !!env.match(/VIRTUAL_HOST=/g))
    .map((env) => /(VIRTUAL_HOST=)([a-z\.]*)/g.exec(env))
    .map((match) => (match[2] ? match[2] : null))
    .filter((a) => !!a)
    .map((domain) => `127.0.0.1 ${domain}`)
    .reduce((acc, host) => `${acc}\n${host}`, '## Host File generated via kitchen-tools ##')
  
  console.log(hostFile)
  process.exit(0);
}

console.log(`Starting project ${config.projectName}`);

spawnSync(
  `docker-compose`,
  [
    "-f docker-compose.yaml",
    ...dockerFilesList,
    ...process.argv.slice(2, process.argv.length),
  ],
  {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...workspaceConfig.env,
      ...process.env,
    },
    stdio: 'inherit',
  }
);
