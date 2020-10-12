#!/usr/bin/env node
import "reflect-metadata";

import { CommandContainer } from "../shared/commands/CommandsRepository";
import {
  ConfigFacade,
  ConfigService,
} from "../shared/helpers/injectableServices/Config.service";
import { EnvManager } from "../shared/helpers/injectableServices/EnvManager.service";
import { LoggerService } from "../shared/helpers/injectableServices/Logger.service";
import { BakeCommnad } from "./commands/BakeCommand/BakeCommand";
import { GeneratorCommand } from "./commands/GeneratorCommand/GeneratorCommand";
import { HelpCommand } from "./commands/HelpCommand/HelpCommand";
import { NotFoundCommand } from "./commands/NotFoundCommand/NotFoundCommand";
import { OvenCommand } from "./commands/OvenCommand/OvenCommand";
import { SetupProdCommand } from "./commands/SetupProdCommand/SetupProdCommand";

const commands = new CommandContainer();
const COMMANDS = [
  BakeCommnad,
  OvenCommand,
  HelpCommand,
  SetupProdCommand,
  GeneratorCommand,
];

// Base shared services
commands.bind(LoggerService).toSelf();
commands.bind(EnvManager).toSelf();
commands.bind(ConfigService).toSelf();
commands.bind(ConfigFacade).toSelf();

// Autobind all the commands and all the respective dependencies
commands.autobind(COMMANDS);

// Set the default command
commands.setDefaultCommand(NotFoundCommand);

// Execute the command that match the arguments
commands
  .match(process.argv)
  .then(() => process.exit(0))
  .catch((error) => {
    const logger = commands.get(LoggerService);
    logger.error(error);
    process.exit(error.exitCode || 1);
  });
