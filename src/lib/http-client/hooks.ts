
import { useQuery } from '@tanstack/react-query';
import { http, RequestOptions } from './index';

/**
 * Hook para realizar peticiones GET con React Query
 */
export function useGet<T = any>(
  url: string | null,
  options?: RequestOptions & {
    queryKey?: unknown[];
    enabled?: boolean;
    refetchInterval?: number | false;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const {
    queryKey = [url],
    enabled = !!url,
    refetchInterval,
    onSuccess,
    onError,
    ...requestOptions
  } = options || {};

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!url) throw new Error('URL no proporcionada');
      const response = await http.get<T>(url, requestOptions);
      return response.data;
    },
    enabled,
    refetchInterval,
    ...(onSuccess ? { onSuccess } : {}),
    ...(onError ? { onError } : {}),
  });
}

/**
 * Hook para realizar una petición con React Query de forma genérica
 */
export function useRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string | null,
  data?: any,
  options?: RequestOptions & {
    queryKey?: unknown[];
    enabled?: boolean;
    refetchInterval?: number | false;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const {
    queryKey = [method, url, data],
    enabled = !!url,
    refetchInterval,
    onSuccess,
    onError,
    ...requestOptions
  } = options || {};

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!url) throw new Error('URL no proporcionada');
      
      let response;
      
      switch (method) {
        case 'GET':
          response = await http.get<T>(url, requestOptions);
          break;
        case 'POST':
          response = await http.post<T>(url, data, requestOptions);
          break;
        case 'PUT':
          response = await http.put<T>(url, data, requestOptions);
          break;
        case 'PATCH':
          response = await http.patch<T>(url, data, requestOptions);
          break;
        case 'DELETE':
          response = await http.delete<T>(url, requestOptions);
          break;
        default:
          throw new Error(`Método no soportado: ${method}`);
      }
      
      return response.data;
    },
    enabled,
    refetchInterval,
    ...(onSuccess ? { onSuccess } : {}),
    ...(onError ? { onError } : {}),
  });
}
