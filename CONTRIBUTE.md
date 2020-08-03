# Contribute to Kitchen Tools

Thanks

# Why

The purpose of this project it's to reduce the time it takes to generate new projects with a service oriented architecture promoting the used of already existing architectural recepy (hence the name) for solving common problems. Furthermore we want to create a better developer experience around docker and docker-compose that are already amazing tools.

# How to

This project uses yarn so it should be installed localy on your machine

As you can see in package.json you can run `yarn build` or `yarn build:watch` to build the project.

To develop this package localy you should run `yarn link`, remember if you have installed other version of this package globaly you should remove those installations.

If you want to run tests localy use the `yarn test` command.

If you want to create new services use the built in `service` schematics, simply run `yarn schematics .:service --name=testme --debug=false`

# Project structure

All the code is contained inside `/src`, here you can find `bake.ts` `help.ts` `mix.ts` `oven.ts`. This are the main scripts for the respective commands. Frthermore in this direcotry you can find all the schematics use for the project and services generation.

- new: It's the schematics that generates all the services. Inside files all the boilerplate can be found to generate the respective services. Every service is mapped to an `.ts` file that handle the schematic part. Essentialy a typescript service creator is a factory function that return an object with the shape of an `ServiceDescriptor`. This object is used by the schematic to generate the correct service. By default the only required option for a schematic is a name, if others property are required they must be implemented at a service level (ex. look at the name implementation).

- init: It's the schematics that generates a new cooking project.

- custom: It's a schematics that helps the scaffold of custom template for services.

- service: It's an internal schematics that helps the generation of internal service templates.

- shared: This directory gather all the shared modules that all the schematics use.
