import { Product, ProductFilters } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-40dr.onrender.com/api';

// Utility to build query string from filters
const buildQueryString = (filters?: ProductFilters): string => {
  const params = new URLSearchParams();

  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.categories?.length) params.set('category', filters.categories.join(','));
  if (filters?.priceRanges?.length) params.set('price', filters.priceRanges.join(','));

  return params.toString();
};

/**
 * Fetch all products with optional filters
 */
export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const query = buildQueryString(filters);
    const url = `${API_URL}/products${query ? `?${query}` : ''}`;
    
    console.log(`Fetching products from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Products response:', data);
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.products && Array.isArray(data.products)) {
      return data.products;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
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
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${id}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (data.product) {
      return data.product;
    } else if (data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

/**
 * Fetch featured products
 */
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    // Try the dedicated featured endpoint first
    try {
      const response = await fetch(`${API_URL}/products/featured`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (e) {
      console.log('Featured endpoint not available, falling back to regular products');
    }
    
    // Fallback to regular products if featured endpoint doesn't exist
    const allProducts = await fetchProducts();
    // Return first 4 products as featured
    return allProducts.slice(0, 4);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

/**
 * Fetch new arrivals
 */
export const fetchNewArrivals = async (): Promise<Product[]> => {
  try {
    // Try the dedicated new arrivals endpoint first
    try {
      const response = await fetch(`${API_URL}/products/new`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (e) {
      console.log('New arrivals endpoint not available, falling back to sorted products');
    }
    
    // Fallback to regular products sorted by date if new endpoint doesn't exist
    const allProducts = await fetchProducts({ sort: 'newest' });
    return allProducts.slice(0, 4);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
};

/**
 * Fetch related products
 */
export const fetchRelatedProducts = async (category: string): Promise<Product[]> => {
  try {
    // Try the dedicated related products endpoint first
    try {
      const response = await fetch(`${API_URL}/products/related?category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (e) {
      console.log('Related products endpoint not available, falling back to category filter');
    }
    
    // Fallback to products with same category if related endpoint doesn't exist
    const products = await fetchProducts({ categories: [category] });
    return products.slice(0, 4);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};

/**
 * Fetch products on sale
 */
export const fetchProductsOnSale = async (): Promise<Product[]> => {
  try {
    // Try the dedicated sale products endpoint first
    try {
      const response = await fetch(`${API_URL}/products/sale`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (e) {
      console.log('Sale products endpoint not available, falling back to filtered products');
    }
    
    // Fallback to products with discount if sale endpoint doesn't exist
    const allProducts = await fetchProducts();
    return allProducts.filter(product => 
      product.discount > 0 || 
      (product.originalPrice && product.originalPrice > product.price)
    ).slice(0, 4);
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
};