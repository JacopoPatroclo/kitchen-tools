#!/usr/bin/env node
import { ServiceFactory, autoRegister } from "../new/src/serviceFactory";
import { readFileSync } from "fs";
import { join } from "path";
import * as marked from "marked";
import * as TerminalRenderer from "marked-terminal";

const type = process.argv[2];

switch (type) {
  case "services":
    const sFactory = new ServiceFactory();
    autoRegister(sFactory);

    console.log("Aviable services:");
    for (const service of sFactory.services()) {
      console.log(`- ${service}`);
    }
    break;

  default:
    genericHelp();
    break;
}

function genericHelp() {
  marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer(),
  });
  console.log(
    marked(
      readFileSync(join(__dirname, "..", "README.md"), { encoding: "utf8" })
    )
  );
}
