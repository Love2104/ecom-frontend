import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Product } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-production-2fab.up.railway.app/api';

interface ProductState {
  products: Product[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}

export function useProducts() {
  const [state, setState] = useState<ProductState>({
    products: [],
    loading: {
      fetch: false,
      create: false,
      update: false,
      delete: false
    },
    error: null
  });

  const { token, user } = useSelector((state: RootState) => state.auth);

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true; // Accept any valid URL for images
    } catch {
      return false;
    }
  };

  const fetchProducts = useCallback(async () => {
    if (!token) return { success: false, error: 'Authentication required' };

    setState(prev => ({ ...prev, loading: { ...prev.loading, fetch: true }, error: null }));

    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch products');
      }

      setState(prev => ({ 
        ...prev, 
        products: data.products || [], 
        loading: { ...prev.loading, fetch: false } 
      }));

      return { success: true, products: data.products };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: { ...prev.loading, fetch: false } 
      }));
      return { success: false, error: errorMessage };
    }
  }, [token]);

  const fetchProductById = useCallback(async (id: string) => {
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch product');
      }

      return { success: true, product: data.product };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }, [token]);

  const createProduct = useCallback(async (productData: FormData) => {
    if (!token || user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const imageUrl = productData.get('image_url') as string;
    if (!imageUrl || !validateImageUrl(imageUrl)) {
      return { success: false, error: 'Invalid image URL' };
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, create: true }, error: null }));

    try {
      // Convert FormData to a plain object for the API
      const productObject: any = {};
      for (const [key, value] of productData.entries()) {
        productObject[key] = value;
      }

      // Send the request as JSON
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productObject)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create product');
      }

      setState(prev => ({ 
        ...prev, 
        products: [...prev.products, data.product], 
        loading: { ...prev.loading, create: false } 
      }));

      return { success: true, product: data.product };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: { ...prev.loading, create: false } 
      }));
      return { success: false, error: errorMessage };
    }
  }, [token, user, validateImageUrl]);

  const updateProduct = useCallback(async (id: string, productData: FormData) => {
    if (!token || user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, update: true }, error: null }));

    try {
      // Convert FormData to a plain object for the API
      const productObject: any = {};
      for (const [key, value] of productData.entries()) {
        productObject[key] = value;
      }

      // Send the request as JSON
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productObject)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update product');
      }

      setState(prev => ({ 
        ...prev, 
        products: prev.products.map(p => p.id === id ? data.product : p), 
        loading: { ...prev.loading, update: false } 
      }));

      return { success: true, product: data.product };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: { ...prev.loading, update: false } 
      }));
      return { success: false, error: errorMessage };
    }
  }, [token, user]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!token || user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, delete: true }, error: null }));

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error?.message || 'Failed to delete product');
      }

      // Update the local state to remove the deleted product
      setState(prev => ({ 
        ...prev, 
        products: prev.products.filter(p => p.id !== id), 
        loading: { ...prev.loading, delete: false } 
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: { ...prev.loading, delete: false } 
      }));
      return { success: false, error: errorMessage };
    }
  }, [token, user]);

  return {
    ...state,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

export default useProducts;