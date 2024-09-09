export * from "./apiLog/getMetrics";

import Queue from "better-queue";

interface AccountInfo {
  mongoUrl: string;
  organizationName: string;
  projectName: string;
  microserviceName: string;
}

export interface PluginOptions {
  accountInfo?: AccountInfo;
  logLevel?: "trace" | "info" | "error";
  serviceApiKey?: string;
  queueOptions?: Partial<Queue.QueueOptions<any, any>>;
  lambdaEnv?: boolean;
}

export type RequestLog = {
  url: string;
  routerUrl: string;
  version?: string;
  organizationId: string;
  projectId: string;
  microserviceId?: string;
  method: string;
  description?: string;
  statusCode: number;
  isSuccessfull: boolean;
  errorMessage?: string;
  responseTime: number;
};
