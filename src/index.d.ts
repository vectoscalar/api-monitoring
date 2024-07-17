import { FastifyInstance, FastifyPluginOptions } from "fastify";

interface PluginOptions extends FastifyPluginOptions {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
  gst: string;
  logLevel?: 'trace' | 'info';
}

declare module "my-fastify-plugin" {
  export function apiMonitorPlugin(
    fastify: FastifyInstance,
    options: PluginOptions
  ): Promise<void>;
}
