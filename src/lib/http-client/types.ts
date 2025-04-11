
// Opciones para personalizar las peticiones
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  timeout?: number;
  retries?: number;
  baseURL?: string;
}

// Tipos de respuesta
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestOptions;
}

// Error personalizado para las peticiones HTTP
export class HttpError extends Error {
  public response?: HttpResponse;
  public request?: Request;
  public status?: number;

  constructor(message: string, options?: { response?: HttpResponse; request?: Request; status?: number }) {
    super(message);
    this.name = 'HttpError';
    this.response = options?.response;
    this.request = options?.request;
    this.status = options?.status || options?.response?.status;
  }
}
