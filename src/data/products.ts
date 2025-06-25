import { Product, ProductFilters } from '@/types';

const BASE_URL = "https://ecom-backend-40dr.onrender.com/api/products";

// Utility to build query string from filters
const buildQueryString = (filters?: ProductFilters): string => {
  const params = new URLSearchParams();

  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.categories) params.set('category', filters.categories.join(','));
  if (filters?.priceRanges) params.set('price', filters.priceRanges.join(','));

  return params.toString();
};

/**
 * Fetch all products with optional filters
 */
export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const query = buildQueryString(filters);
    const response = await fetch(`${BASE_URL}?${query}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Fetch a single product by ID
 */
export const ProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch product ${id}`);
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch featured products
 */
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/featured`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    const data = await response.json();
    return data.products || [];
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
    const response = await fetch(`${BASE_URL}/new`);
    if (!response.ok) throw new Error('Failed to fetch new arrivals');
    const data = await response.json();
    return data.products || [];
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
    const response = await fetch(`${BASE_URL}/related?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch related products');
    const data = await response.json();
    return data.products || [];
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
    const response = await fetch(`${BASE_URL}/sale`);
    if (!response.ok) throw new Error('Failed to fetch sale products');
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
};
