#!/usr/bin/env node

import { makeConfiguratorFacade } from "../shared/helpers/ConfigurationHelper";
import { TaskRunner } from "../shared/tasks/taskRunner/taskRunner";

const project = process.argv[2];
const command = process.argv[3];
const args = process.argv.slice(4, process.argv.length);

if (!project || !command) {
  console.error(
    "You should pass a project and a command like: bake-run project command someParam --arg"
  );
  process.exit(1);
}

const config = makeConfiguratorFacade();

if (!config.hasService(project)) {
  console.error(`Unable to find ${project}, check your spelling`);
  process.exit(1);
}

const projectType = config.getService(project)!.type;

const taskRunner = new TaskRunner();

taskRunner
  .execute(command, project, args)
  .then(() => console.log("Done!"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
