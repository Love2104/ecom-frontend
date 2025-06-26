import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Product } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-production-2fab.up.railway.app/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product ${id}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, product: data.product };
      } else {
        throw new Error(data.message || 'Failed to fetch product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(`Error fetching product ${id}:`, err);
      return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData: FormData) => {
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: productData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }
      
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProduct = useCallback(async (id: string, productData: FormData) => {
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: productData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
      
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      
      // Remove the deleted product from the state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

export default useProducts;