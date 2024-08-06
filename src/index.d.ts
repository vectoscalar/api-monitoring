import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ApiLogService, EndpointService } from "./services";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  logLevel?: 'trace' | 'info';
}

declare module "my-fastify-plugin" {
  export function apiMonitorPlugin(
    fastify: FastifyInstance,
    options: PluginOptions
  ): Promise<void>;

  export { ApiLogService, EndpointService };

}
