import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logger } from '.';

class AxiosService {
  private service: AxiosInstance;

  constructor() {
    const service = axios.create({});
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
  }

  private handleSuccess(response: AxiosResponse): AxiosResponse {
    // logger.trace("response", response);
    return response;
  }

  private handleError = (error: AxiosError): AxiosError | Promise<AxiosError> => {
    // logger.error("handleError", error);
    return Promise.reject(error);
  };

  async get(url: string, headers?: Record<string, string>, params?: Record<string, any>, auth?: AxiosRequestConfig['auth']): Promise<AxiosResponse> {
    // logger.trace(`Will invoke url ${url}`);
    return this.service.request({
      method: 'GET',
      url,
      headers,
      params,
      auth,
      responseType: 'json',
    });
  }

  async patch(url: string, payload: any, headers?: Record<string, string>, params?: Record<string, any>, auth?: AxiosRequestConfig['auth']): Promise<AxiosResponse> {
    return this.service.request({
      method: 'PATCH',
      url,
      headers,
      params,
      data: payload,
      auth,
      responseType: 'json',
    });
  }

  async post(url: string, payload: any, headers: Record<string, string> = {}, params: Record<string, any> | null = null, auth: AxiosRequestConfig['auth'] | undefined = undefined): Promise<AxiosResponse> {
    // logger.trace(`Will invoke url ${url}`);
    // logger.trace("Payload: ", JSON.stringify(payload));
    return this.service.request({
      method: 'POST',
      url,
      headers,
      params,
      data: payload,
      auth,
      responseType: 'json',
    });
  }
}

export const axiosClient = new AxiosService();
