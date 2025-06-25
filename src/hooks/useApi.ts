import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (options?: Partial<ApiOptions>) => Promise<T | null>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useApi<T = any>(initialOptions?: Partial<ApiOptions>): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchData = useCallback(
    async (options?: Partial<ApiOptions>): Promise<T | null> => {
      const mergedOptions: ApiOptions = {
        url: options?.url || initialOptions?.url || '',
        method: options?.method || initialOptions?.method || 'GET',
        body: options?.body || initialOptions?.body,
        headers: {
          'Content-Type': 'application/json',
          ...(initialOptions?.headers || {}),
          ...(options?.headers || {})
        },
        requireAuth: options?.requireAuth !== undefined 
          ? options.requireAuth 
          : initialOptions?.requireAuth !== undefined
            ? initialOptions.requireAuth
            : false
      };

      // Add auth token if required
      if (mergedOptions.requireAuth && token) {
        mergedOptions.headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}${mergedOptions.url}`, {
          method: mergedOptions.method,
          headers: mergedOptions.headers,
          body: mergedOptions.body ? JSON.stringify(mergedOptions.body) : undefined
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage = responseData.error?.message || 
            responseData.message || 
            'Something went wrong. Please try again.';
          throw new Error(errorMessage);
        }

        setData(responseData);
        return responseData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [initialOptions, token]
  );

  return { data, loading, error, fetchData };
}

export default useApi;