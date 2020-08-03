# Kitchen Tools ** BETA

Set of tools to generate and run docker-composes service oriented projects.

# Installation

You have to have installed docker and docker-compose on your machine

Just run `npm i -g kitchen-tools`

# Documentation

There are two important command: `bake` and `oven`.

bake: It help generate the project and the services

- To generate the project: ```bake init example_project```
- To generate a node app: ```bake new node example_service_app```
- To generate a service using an external template: ```bake new example_type example_service_name --path=./to/custom/template```
- To scaffold an external template: ```bake custom example_service_template_name --path=./to/custom/```

oven: It help starting the project, under the hood it uses docker-compose. Infact you can use docker-composes specific command

- To start the project: ```oven up```
- To buil the containers: ```oven build```

bake-help: Show a help page

- To show the help page: ```bake-help```
- To show the aviable buildt in services: ```bake-help services```
