import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

class AxiosService {
  private service: AxiosInstance;

  constructor() {
    const service = axios.create({});
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
  }

  private handleSuccess(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private handleError = (
    error: AxiosError
  ): AxiosError | Promise<AxiosError> => {
    return Promise.reject(error);
  };

  async get(
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, any>,
    auth?: AxiosRequestConfig["auth"]
  ): Promise<AxiosResponse> {
    return this.service.request({
      method: "GET",
      url,
      headers,
      params,
      auth,
      responseType: "json",
    });
  }

  async patch(
    url: string,
    payload: any,
    headers?: Record<string, string>,
    params?: Record<string, any>,
    auth?: AxiosRequestConfig["auth"]
  ): Promise<AxiosResponse> {
    return this.service.request({
      method: "PATCH",
      url,
      headers,
      params,
      data: payload,
      auth,
      responseType: "json",
    });
  }

  async post(
    url: string,
    payload: any,
    headers: Record<string, string> = {},
    params: Record<string, any> | null = null,
    auth: AxiosRequestConfig["auth"] | undefined = undefined
  ): Promise<AxiosResponse> {
    return this.service.request({
      method: "POST",
      url,
      headers,
      params,
      data: payload,
      auth,
      responseType: "json",
    });
  }
}

export const axiosClient = new AxiosService();
