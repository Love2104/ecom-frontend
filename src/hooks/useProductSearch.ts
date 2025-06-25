import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductFilters } from '@/types';
import { debounce } from '@/lib/utils';
import { fetchProducts } from '@/data/products';

export function useProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastFetchId = useRef<number>(0);
  
  // Parse search parameters
  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const categoryParam = searchParams.get('category');
  const priceParam = searchParams.get('price');
  
  // Fix: Properly handle empty category/price params
  const selectedCategories = useMemo(() => 
    categoryParam ? categoryParam.split(',').filter(Boolean) : []
  , [categoryParam]);
  
  const selectedPriceRanges = useMemo(() => 
    priceParam ? priceParam.split(',').filter(Boolean) : []
  , [priceParam]);

  // Create memoized filters object
  const filters: ProductFilters = useMemo(() => ({
    search: searchQuery,
    categories: selectedCategories,
    priceRanges: selectedPriceRanges,
    sort: sortParam,
  }), [searchQuery, selectedCategories, selectedPriceRanges, sortParam]);

  const fetchFilteredProducts = useCallback(
    async (filters: ProductFilters, fetchId: number) => {
      try {
        setLoading(true);
        
        // Fetch products with filters
        const filteredProducts = await fetchProducts(filters);
        
        // Only update state if this is still the latest request
        if (lastFetchId.current === fetchId) {
          setProducts(filteredProducts);
          setError(null);
        }
      } catch (err) {
        if (lastFetchId.current === fetchId) {
          setError('Failed to load products. Please try again.');
          console.error('Error fetching products:', err);
        }
      } finally {
        if (lastFetchId.current === fetchId) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Debounced fetch
  const debouncedFetch = useMemo(
    () => debounce((filters: ProductFilters, fetchId: number) => {
      fetchFilteredProducts(filters, fetchId);
    }, 300),
    [fetchFilteredProducts]
  );

  // Effect for fetching products when filters change
  useEffect(() => {
    const fetchId = Date.now();
    lastFetchId.current = fetchId;
    setLoading(true);

    debouncedFetch(filters, fetchId);

    return () => {
      debouncedFetch.cancel();
    };
  }, [filters, debouncedFetch]);

  // Filter param handlers
  const updateFilters = useCallback(
    (key: string, value: string | string[], action: 'set' | 'toggle' | 'remove') => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        const current = newParams.get(key)?.split(',').filter(Boolean) || [];

        if (action === 'toggle') {
          const valueArr = Array.isArray(value) ? value : [value];
          const valueToToggle = valueArr[0];
          
          const newValues = current.includes(valueToToggle)
            ? current.filter(v => v !== valueToToggle)
            : [...current, valueToToggle];
          
          if (newValues.length) {
            newParams.set(key, newValues.join(','));
          } else {
            newParams.delete(key);
          }
        } else if (action === 'remove') {
          newParams.delete(key);
        } else {
          const str = Array.isArray(value) ? value.join(',') : value;
          str ? newParams.set(key, str) : newParams.delete(key);
        }

        return newParams;
      });
    },
    [setSearchParams]
  );

  return {
    products,
    loading,
    error,
    searchQuery,
    selectedCategories,
    selectedPriceRanges,
    sortParam,
    handleCategoryChange: (id: string) => updateFilters('category', id, 'toggle'),
    handlePriceRangeChange: (id: string) => updateFilters('price', id, 'toggle'),
    handleSortChange: (val: string) => updateFilters('sort', val, 'set'),
    handleSearchChange: (val: string) => updateFilters('search', val, 'set'),
    clearFilters: () => {
      setSearchParams(prev => {
        const cleaned = new URLSearchParams();
        if (prev.get('search')) cleaned.set('search', prev.get('search')!);
        if (prev.get('sort')) cleaned.set('sort', prev.get('sort')!);
        return cleaned;
      });
    },
  };
}

export default useProductSearch;