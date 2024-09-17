export const USER_ACCOUNT_INFO_ENDPOINT = "/api/v1/microservices";
export const BASE_URL_SAAS =
  " https://4auv2dy1jg.execute-api.ap-south-1.amazonaws.com";

export const ORGANIZATIONS_ROUTE = `/v1/organizations`;
export const PROJECTS_ROUTE = `/projects`;
export const ENDPOINT_LOGS_ROUTE = "/endpoint-logs";
export const DEFAULT_PLUGIN_OPTIONS = {
  lambdaEnv: false,
  queueOptions: {
    batchSize: 2,
    batchDelay: 0,
    batchDelayTimeout: 10000,
  },
  logLevel: "error",
  accountInfo: undefined,
  serviceApiKey: undefined,
};

export const DEFAULT_MONGO_URL =
  "mongodb+srv://ss:ss786@cluster0.hjv8pvk.mongodb.net/new-db?retryWrites=true&w=majority&appName=Cluster0";

export const ENV_TYPE = {
  SERVER: "SERVER",
  SERVERLESS: "SERVERLESS",
};
