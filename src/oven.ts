#!/usr/bin/env node

import { ConfigurationHelper } from "./shared/helpers/ConfigurationHelper";
import { spawnSync } from "child_process";
import { join, resolve } from "path";
import { readFileSync, writeFileSync,  } from "fs";
import { safeLoad } from "js-yaml";

let workspaceConfig: any = {}
try {
    workspaceConfig = require(resolve(join(process.cwd(), 'wkspace.json')))
} catch (error) {
    console.error('Unable to load wkspace.json, are you sure you are in the correct directory')
    process.exit(1)
}

const envFilePath = resolve(join(process.cwd(), '.env.example'))

const config = new ConfigurationHelper(JSON.stringify(workspaceConfig))

console.log(`Starting project ${config.projectName}`)

const dockerFilesList = config.services.map(service => `-f ${service.dcompose}`)

try {
  readFileSync(envFilePath)
} catch (error) {
  if (error.code === 'ENOENT') {
    const envFile = config.services
    .map(service => {
      const pathDc = join(process.cwd(), service.dcompose)
      const fileContent = readFileSync(pathDc).toString()
      const parsedDc = safeLoad(fileContent) as any
      return parsedDc?.services[service.name]?.environment || []
    })
    .reduce((acc, newEnvs) => [...acc, ...newEnvs], [])
    // Filter out all the fixed values
    .filter((env: string) => !!env.match(/\$\{/g))
    .join('\n')

    writeFileSync(envFilePath, envFile)
    console.log('Created an example.env file from do')
  }
}

spawnSync(
  `docker-compose`,
  ['-f docker-compose.yaml', ...dockerFilesList, ...process.argv.slice(2, process.argv.length)],
  {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...workspaceConfig.env,
      ...process.env
    },
    stdio: [0, 1, 2]
  }
);
