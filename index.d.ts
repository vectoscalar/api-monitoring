import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ApiLogService, EndpointService } from "./src/services";

import { PluginOptions } from "./src/types";

declare module "api-monitor-plugin" {
  export function apiMonitorPlugin(
    fastify: FastifyInstance,
    options: PluginOptions
  ): Promise<void>;

  export { ApiLogService, EndpointService, PluginOptions };
}
