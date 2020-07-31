#!/usr/bin/env node

import { ConfigurationHelper } from "./shared/helpers/ConfigurationHelper";
import * as yaml from "js-yaml";
import { join, resolve } from "path";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { merge } from 'lodash'

let workspaceConfig = null;
try {
  workspaceConfig = require(resolve(join(process.cwd(), "wkspace.json")));
} catch (error) {
  console.error(
    "Unable to load wkspace.json, are you sure you are in the correct directory"
  );
  process.exit(1);
}

const config = new ConfigurationHelper(JSON.stringify(workspaceConfig));
const basePath = process.cwd();
const baseDockerCompose = {
  version: '3.5'
}
const dockerComposeProdPath = join(basePath, 'docker-compose.prod.yaml')

console.log(`Generating production files for ${config.projectName}`);

// Get all the project docker-composes
const dockerComposes = config.services.map(service => {
  const dcContent = readFileSync(join(basePath, service.dcompose), 'utf8').toString()
  const dockerCompose = yaml.safeLoad(dcContent) as any
  return { 
    ...dockerCompose,
    services: Object.keys(dockerCompose.services)
      .map(service => ({key: service, config: dockerCompose.services[service]}))
      .map(dc => {
        // Remove all the build configurations
        const conf = { ...dc.config }
        conf.build = null
        delete conf.build
        return { ...dc, config: conf }
      })
      .reduce(((acc, obj) => ({ ...acc, [obj.key]: obj.config })), {})
  }
})

console.log(`Target project are ${config.services.map(service => service.name).join(', ')}`);

// Merge in one docker-compose all the selected services (without the proxy stuff)
const mergedDockerCompose = dockerComposes.reduce((acc, dc) => merge(acc, dc), baseDockerCompose)

writeFileSync(dockerComposeProdPath, yaml.safeDump(mergedDockerCompose))