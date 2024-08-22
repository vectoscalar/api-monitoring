import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ApiLogService, EndpointService } from "./services";

import {PluginOptions} from "./types"

declare module "api-monitor-plugin" {
  export function apiMonitorPlugin(
    fastify: FastifyInstance,
    options: PluginOptions
  ): Promise<void>;

  export { ApiLogService, EndpointService, PluginOptions };
}
