import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Product } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-production-2fab.up.railway.app/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchProducts = useCallback(async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
      setProducts(data.products || []);
      return { success: true, products: data.products };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData: FormData) => {
    if (!token) return { success: false, error: 'Authentication required' };
    setCreateLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: productData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create product');
      if (data.product) setProducts(prev => [...prev, data.product]);
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCreateLoading(false);
    }
  }, [token]);

  const updateProduct = useCallback(async (id: string, productData: FormData) => {
    if (!token) return { success: false, error: 'Authentication required' };
    setUpdateLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: productData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update product');
      if (data.product) setProducts(prev => prev.map(p => (p.id === id ? data.product : p)));
      return { success: true, product: data.product };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdateLoading(false);
    }
  }, [token]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!token) return { success: false, error: 'Authentication required' };
    setDeleteLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleteLoading(false);
    }
  }, [token]);

  return {
    products,
    error,
    loading: {
      fetch: fetchLoading,
      create: createLoading,
      update: updateLoading,
      delete: deleteLoading,
    },
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export default useProducts;