export const USER_ACCOUNT_INFO_ENDPOINT = "/api/v1/microservices";
export const BASE_URL_SAAS =
  " https://4auv2dy1jg.execute-api.ap-south-1.amazonaws.com";

export const ORGANIZATIONS_ROUTE = `/v1/organizations`;
export const PROJECTS_ROUTE = `/projects`;
export const ENDPOINT_LOGS_ROUTE = "/endpoint-logs";
export const DEFAULT_PLUGIN_OPTIONS = {
  lambdaEnv: false,
  queueOptions: {
    maxQueueSize: 2,
    batchDelay: 0,
    delayTimeout: 10000,    //timeout
  },
  logLevel: "error",
  accountInfo: undefined,
  serviceApiKey: undefined,
};

export const DEFAULT_MONGO_URL =
  "mongodb+srv://ss:ss786@cluster0.hjv8pvk.mongodb.net/new-db?retryWrites=true&w=majority&appName=Cluster0";

export const SYSTEM_METRICS_ROUTE = '/system-metrics'
export const EC2_METADATA_URL = 'http://169.254.169.254/latest/meta-data/instance-id';

export const ENV_TYPE = {
  SERVER: "SERVER",
  SERVERLESS: "SERVERLESS",
};
