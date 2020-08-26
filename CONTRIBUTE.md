# Contribute to Kitchen Tools

Thanks

## Why

The purpose of this project it's to reduce the time it takes to generate new projects with a service oriented architecture promoting the used of already existing architectural recepy (hence the name) for solving common problems. Furthermore we want to create a better developer experience around docker and docker-compose that are already amazing tools.

## How to

This project uses yarn so it should be installed localy on your machine

As you can see in package.json you can run `yarn build` or `yarn build:watch` to build the project.

To develop this package localy you should run `yarn link`, remember if you have installed other version of this package globaly you should remove those installations.

If you want to run tests localy use the `yarn test` command.

If you want to create new services use the built in `service` schematics, simply run `yarn schematics .:service --name=testme --debug=false`

## Project structure

All the code is contained inside `/src`, here you can find `bake.ts` `help.ts` `mix.ts` `oven.ts`. This are the main scripts for the respective commands. Frthermore in this direcotry you can find all the schematics use for the project and services generation.

- new: It's the schematics that generates all the services. Inside files all the boilerplate can be found to generate the respective services. Every service is mapped to an `.ts` file that handle the schematic part. Essentialy a typescript service creator is a factory function that return an object with the shape of an `ServiceDescriptor`. This object is used by the schematic to generate the correct service. By default the only required option for a schematic is a name, if others property are required they must be implemented at a service level (ex. look at the name implementation).

- init: It's the schematics that generates a new cooking project.

- custom: It's a schematics that helps the scaffold of custom template for services.

- service: It's an internal schematics that helps the generation of internal service templates.

- shared: This directory gather all the shared modules that all the schematics use.

## Develop new services

After you run the `yarn schematics .:service --name=testme --debug=false` schematics you can see that this process have changed some files. First inside `src/new/src/services` a new service.ts file has been created.
The purpose of this file is to export a function that return a `ServiceDescriptor`. This object is used to generate the service boilerplate. The main parts are:

1. tson: The options that are stored inside the `wkspace.json` that describe where the docker-compose file is located and the type of the service, as well as the name. There are no restriction to the nodes that you are going to store there, outside the present of name, dcompose, type and if is needed depends. This node describe the services that are needed in order to work properly. For example a laravel application need a database and an nginx in order to run php through the fpm interface. You can describe the type of service and the configuration that is needed to that service in order to be setted up properly. Look at the laravel service for some context. The dependency structure can be as deep as needed but there are not check for circular dependency, so watch out and keep the dependency tree as flat as possible.

2. templates: Here all the `Source` object must be provided. Those are the angular schematic way to describe the changes that must be applyed to the filesystem. The default schematic generation already help you by using all the files inside `src/new/files/services/${service_name}` as templates.

3. tasks: This node is not required, and it's rappresent the list of tasks that can be runned after the schematic has been executed. This tasks are orchestrated using a not public api from the `@angular-devkit/schematics` package. Going a little bit into details, you should create two things: the first is a class that implements `TaskConfigurationGenerator` interface, the second is an object of type `TaskExecutorFactory`. Basically the factory tells the schematics how to generate the task and the class expose a standard way to declare the configurations passed to the task execution (that is a simple async function). This library expose a generic task executor, see `genericTaskExecutor.ts`, you can use this function to execute a script or a command. Form more complex stuff you shoul develop a custom one. To see an example of all of this look at the next.js service.
