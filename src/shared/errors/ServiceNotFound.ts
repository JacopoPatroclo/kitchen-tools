export class ServiceNotFound extends Error {
    constructor(serviceName: string) {
        super(`Service named ${serviceName} not found, check for typo`)
    };
}
