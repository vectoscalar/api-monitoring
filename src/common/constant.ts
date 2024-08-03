export const USER_ACCOUNT_INFO_ENDPOINT = '/api/v1/microservices';
export const BASE_URL_SAAS = ' https://4auv2dy1jg.execute-api.ap-south-1.amazonaws.com'

export function getSaveLogsEndpoint(organizationId: string, projectId: string) {
  return `/v1/organizations/${organizationId}/projects/${projectId}/endpoint-logs`
}

