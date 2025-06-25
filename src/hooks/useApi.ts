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

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-40dr.onrender.com/api';

export function useApi<T = any>(initialOptions?: Partial<ApiOptions>): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchData = useCallback(
    async (options?: Partial<ApiOptions>): Promise<T | null> => {
      const url = options?.url || initialOptions?.url;
      if (!url) {
        setError('API URL is required.');
        return null;
      }

      const method = options?.method || initialOptions?.method || 'GET';
      const body = options?.body || initialOptions?.body;
      const requireAuth = options?.requireAuth ?? initialOptions?.requireAuth ?? false;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(initialOptions?.headers || {}),
        ...(options?.headers || {})
      };

      if (requireAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}${url}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage =
            responseData?.error?.message ||
            responseData?.message ||
            'Something went wrong.';
          throw new Error(errorMessage);
        }

        setData(responseData);
        return responseData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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