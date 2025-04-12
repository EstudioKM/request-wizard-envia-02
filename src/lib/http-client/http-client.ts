import { HttpError, HttpResponse, RequestOptions } from './types';

const DEFAULT_TIMEOUT = 30000; // 30 segundos
const DEFAULT_RETRIES = 2;

/**
 * Cliente HTTP para realizar peticiones con funcionalidades avanzadas
 */
export class HttpClient {
  private baseURL: string;
  public defaultOptions: RequestOptions;
  private proxyEnabled: boolean;

  constructor(baseURL: string = '', defaultOptions: RequestOptions = {}, proxyEnabled: boolean = true) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
    this.proxyEnabled = proxyEnabled;
  }

  /**
   * Realizar una petición HTTP
   */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    const mergedOptions = this.mergeOptions(options);
    let fullURL = this.buildURL(url, mergedOptions.params);
    
    // Aplicar proxy si está habilitado y la URL contiene estudiokm.com.ar
    if (this.proxyEnabled && fullURL.includes('estudiokm.com.ar')) {
      fullURL = this.applyProxy(fullURL);
    }
    
    const controller = new AbortController();
    const { signal } = controller;
    
    // Configurar timeout
    const timeout = mergedOptions.timeout || DEFAULT_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const requestOptions: RequestInit = {
      ...mergedOptions,
      signal,
      mode: 'cors',
      credentials: mergedOptions.credentials || 'omit',
    };
    
    // Si hay un body y es un objeto, convertirlo a JSON
    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
      requestOptions.headers = {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
      };
    }
    
    try {
      console.log('Realizando petición a:', fullURL);
      console.log('Opciones de la petición:', JSON.stringify(requestOptions, (key, value) => 
        key === 'signal' ? '[AbortSignal]' : value
      ));
      
      let retriesLeft = mergedOptions.retries || DEFAULT_RETRIES;
      let response: Response | null = null;
      let error: Error | null = null;
      
      // Implementación de reintentos
      do {
        try {
          response = await fetch(fullURL, requestOptions);
          error = null;
          break;
        } catch (err) {
          error = err as Error;
          console.error('Error en intento de petición:', err);
          retriesLeft--;
          if (retriesLeft > 0) {
            console.log(`Reintentando petición. Quedan ${retriesLeft} intentos.`);
            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } while (retriesLeft > 0);
      
      // Si después de los reintentos sigue habiendo error, lanzarlo
      if (error) {
        console.error('Error después de reintentos:', error);
        throw error;
      }
      
      if (!response) {
        throw new Error('No se pudo realizar la petición');
      }
      
      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
      });
      
      // Procesar la respuesta según el tipo solicitado
      let data: T;
      const responseType = mergedOptions.responseType || 'json';
      
      switch (responseType) {
        case 'text':
          data = await response.text() as unknown as T;
          break;
        case 'blob':
          data = await response.blob() as unknown as T;
          break;
        case 'arraybuffer':
          data = await response.arrayBuffer() as unknown as T;
          break;
        case 'json':
        default:
          // Para respuestas vacías, devolver un objeto vacío
          if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            data = {} as T;
          } else {
            try {
              data = await response.json() as T;
            } catch (e) {
              // Si falla el parseo JSON, devolver un objeto vacío
              console.warn('Error al parsear la respuesta como JSON:', e);
              data = {} as T;
            }
          }
          break;
      }
      
      console.log('Datos de respuesta:', data);
      
      // Crear objeto de respuesta
      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: mergedOptions,
      };
      
      // Comprobar si la respuesta es un error basado en la configuración
      const shouldEvaluateAsError = mergedOptions.evaluateAllStatesAsErrors 
        ? response.status >= 400 
        : !response.ok;
        
      if (shouldEvaluateAsError) {
        console.error('Error en respuesta HTTP:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        
        throw new HttpError(`Petición fallida con código ${response.status}`, {
          response: httpResponse,
          status: response.status,
        });
      }
      
      return httpResponse;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpError('Petición cancelada por timeout', { status: 408 });
      }
      
      console.error('Error en petición HTTP:', error);
      
      throw new HttpError(
        (error as Error)?.message || 'Error desconocido en la petición',
        { status: 0 }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * Realizar una petición GET
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  /**
   * Realizar una petición POST
   */
  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body: data });
  }
  
  /**
   * Realizar una petición PUT
   */
  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body: data });
  }
  
  /**
   * Realizar una petición PATCH
   */
  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body: data });
  }
  
  /**
   * Realizar una petición DELETE
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
  
  /**
   * Combinar las opciones por defecto con las opciones específicas
   */
  private mergeOptions(options: RequestOptions): RequestOptions {
    return {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };
  }
  
  /**
   * Construir la URL completa con los parámetros
   */
  private buildURL(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Construir la URL base
    const baseURL = this.baseURL || '';
    let fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    // Añadir parámetros si existen
    if (params) {
      const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (queryParams) {
        fullURL += (fullURL.includes('?') ? '&' : '?') + queryParams;
      }
    }
    
    return fullURL;
  }

  /**
   * Aplicar proxy a la URL
   */
  private applyProxy(url: string): string {
    // Si la URL ya es del proxy, devolverla sin cambios
    if (url.includes('/api-proxy')) {
      return url;
    }

    // Convertir https://app.estudiokm.com.ar/api/... a /api-proxy/api/...
    try {
      const urlObj = new URL(url);
      const pathWithQuery = urlObj.pathname + urlObj.search;
      return `/api-proxy${pathWithQuery}`;
    } catch (e) {
      console.error('Error al parsear URL para proxy:', e);
      return url;
    }
  }

  /**
   * Habilitar o deshabilitar el proxy
   */
  setProxyEnabled(enabled: boolean): void {
    this.proxyEnabled = enabled;
  }

  /**
   * Establecer opciones por defecto
   */
  setDefaultOptions(options: RequestOptions): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };
  }
}

// Crear una instancia por defecto
export const http = new HttpClient();

// Exportar funciones de conveniencia
export const get = <T = any>(url: string, options?: RequestOptions) => http.get<T>(url, options);
export const post = <T = any>(url: string, data?: any, options?: RequestOptions) => http.post<T>(url, data, options);
export const put = <T = any>(url: string, data?: any, options?: RequestOptions) => http.put<T>(url, data, options);
export const patch = <T = any>(url: string, data?: any, options?: RequestOptions) => http.patch<T>(url, data, options);
export const del = <T = any>(url: string, options?: RequestOptions) => http.delete<T>(url, options);
