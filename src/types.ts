export type RequestLog = {
  url: string;
  version?: string;
  organizationId: string;
  projectId: string;
  microserviceId: string;
  method: string;
  description?: string;
  statusCode: number;
  isSuccessfull: boolean;
  errorMessage?: string;
  responseTime: number;
};
