import { DependencyManager } from "./dependencyManager";
import { ConfigurationHelper } from "../../../../shared/helpers/ConfigurationHelper";
import { apply, url, template } from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { services } from "../serviceFactory";
import { ServiceFactory } from "../../../../shared/serviceFactory/ServiceFactory";

let depManager: DependencyManager;

describe("dependency manager", () => {
  beforeEach(() => {
    const conf = {
      name: "ginello",
      services: [
        {
          name: "api",
          dcompose: "./services/api/docker-compose.yaml",
        },
        {
          name: "asdads",
          dcompose: "./services/asdads/docker-compose.yaml",
          type: "node",
        },
      ],
      env: {
        REGISTRY: "",
        COMPOSE_PROJECT_NAME: "ginello",
      },
    };
    const config = new ConfigurationHelper(JSON.stringify(conf));
    const sfactory = new ServiceFactory();
    sfactory.autoRegister(services);
    depManager = new DependencyManager(config, sfactory);
  });
  it("flatten works", () => {
    const result = depManager.flatten([
      [{ a: "b" }, { a: "b" }],
      [[{ a: "b" }], [{ a: "b" }]],
    ]);
    expect(result).toEqual([{ a: "b" }, { a: "b" }, { a: "b" }, { a: "b" }]);
  });
  it("flatten works", () => {
    const templates = url("./files/services/php7");
    const result = depManager.extractServicesList({
      json: {
        name: "bello",
        dcompose: "./services/bello/docker-compose.yaml",
        type: "php7",
        depends: [
          {
            type: "node",
            options: {
              name: "bello_php7_nginx",
              fpmDomain: "bello:9000",
            },
          },
        ],
      },
      templates: apply(templates, [template({ ...strings })]),
    });
    expect(result.length).toBe(1);
    expect(
      result.find((a) => a.json.name === "bello_php7_nginx")
    ).toBeDefined();
  });
});
