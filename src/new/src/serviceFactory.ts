import { craService } from "./services/craService/craService";
import { nextService } from "./services/nextService/nextService";
import { redisService } from "./services/redisService/redisService";
import { mongoService } from "./services/mongoService/mongoService";
import { mysqlService } from "./services/mysqlService/mysqlService";
import { wordpressService } from "./services/wordpressService/wordpressService";
import { postgresService } from "./services/postgresService/postgresService";

import { NodeService } from "./services/nodeService/NodeService";
import { Php7Service } from "./services/phpService/Php7Service";
import { NginxService } from "./services/nginxService/NginxService";
import { LaravelService } from "./services/laravelService/laravelService";

// prettier-ignore
export const services = [NodeService, Php7Service, NginxService, postgresService , wordpressService , mysqlService , mongoService , redisService, LaravelService , nextService , craService /*ADDNEWSERVICE*/];
// prettier-ignore-end
