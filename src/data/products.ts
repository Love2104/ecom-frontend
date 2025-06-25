import { Product, ProductFilters, PaginatedResponse } from '@/types';

// Utility to build query string from filters
const buildQueryString = (filters?: ProductFilters): string => {
  const params = new URLSearchParams();

  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);
  
  if (filters?.categories && filters.categories.length > 0) {
    params.set('category', filters.categories.join(','));
  }
  
  if (filters?.priceRanges && filters.priceRanges.length > 0) {
    // Convert price ranges to minPrice and maxPrice
    const priceRanges = filters.priceRanges;
    
    if (priceRanges.includes('under-25')) {
      params.set('maxPrice', '25');
    }
    
    if (priceRanges.includes('25-50')) {
      if (!params.has('minPrice') || Number(params.get('minPrice')) > 25) {
        params.set('minPrice', '25');
      }
      if (!params.has('maxPrice') || Number(params.get('maxPrice')) < 50) {
        params.set('maxPrice', '50');
      }
    }
    
    if (priceRanges.includes('50-100')) {
      if (!params.has('minPrice') || Number(params.get('minPrice')) > 50) {
        params.set('minPrice', '50');
      }
      if (!params.has('maxPrice') || Number(params.get('maxPrice')) < 100) {
        params.set('maxPrice', '100');
      }
    }
    
    if (priceRanges.includes('100-200')) {
      if (!params.has('minPrice') || Number(params.get('minPrice')) > 100) {
        params.set('minPrice', '100');
      }
      if (!params.has('maxPrice') || Number(params.get('maxPrice')) < 200) {
        params.set('maxPrice', '200');
      }
    }
    
    if (priceRanges.includes('over-200')) {
      if (!params.has('minPrice') || Number(params.get('minPrice')) < 200) {
        params.set('minPrice', '200');
      }
    }
  }

  // Add pagination
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  return params.toString();
};

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-40dr.onrender.com/api';

/**
 * Fetch all products with optional filters
 */
export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const query = buildQueryString(filters);
    const response = await fetch(`${API_URL}/products?${query}`);
    
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data: PaginatedResponse<Product> = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Fetch a single product by ID
 */
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    
    if (!response.ok) throw new Error(`Failed to fetch product ${id}`);
    
    const data = await response.json();
    return data.success ? data.product : null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

/**
 * Fetch featured products
 */
export const fetchFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products/featured?limit=${limit}`);
    
    if (!response.ok) throw new Error('Failed to fetch featured products');
    
    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

/**
 * Fetch new arrivals
 */
export const fetchNewArrivals = async (limit: number = 8): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products/new-arrivals?limit=${limit}`);
    
    if (!response.ok) throw new Error('Failed to fetch new arrivals');
    
    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
};

/**
 * Fetch related products
 */
export const fetchRelatedProducts = async (productId: string, limit: number = 4): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/related?limit=${limit}`);
    
    if (!response.ok) throw new Error('Failed to fetch related products');
    
    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};

/**
 * Fetch products on sale
 */
export const fetchProductsOnSale = async (limit: number = 8): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products/on-sale?limit=${limit}`);
    
    if (!response.ok) throw new Error('Failed to fetch sale products');
    
    const data = await response.json();
    return data.success ? data.products : [];
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
};