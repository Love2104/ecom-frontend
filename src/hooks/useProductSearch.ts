import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductFilters } from '@/types';
import { debounce } from '@/lib/utils';

export function useProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const lastFetchId = useRef<number>(0);
  
  // Parse search parameters
  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const categoryParam = searchParams.get('category');
  const priceParam = searchParams.get('price');
  const pageParam = searchParams.get('page') || '1';
  
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
    page: parseInt(pageParam, 10),
    limit: 12,
  }), [searchQuery, selectedCategories, selectedPriceRanges, sortParam, pageParam]);

  const fetchFilteredProducts = useCallback(
    async (filters: ProductFilters, fetchId: number) => {
      try {
        setLoading(true);
        
        // Fetch products with filters
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecom-backend-cc2o.onrender.com/api'}/products?${new URLSearchParams({
          search: filters.search || '',
          sort: filters.sort || 'featured',
          category: filters.categories?.join(',') || '',
          page: String(filters.page || 1),
          limit: String(filters.limit || 12),
          ...(filters.priceRanges?.includes('under-25') ? { maxPrice: '25' } : {}),
          ...(filters.priceRanges?.includes('over-200') ? { minPrice: '200' } : {}),
          ...(filters.priceRanges?.includes('25-50') ? { minPrice: '25', maxPrice: '50' } : {}),
          ...(filters.priceRanges?.includes('50-100') ? { minPrice: '50', maxPrice: '100' } : {}),
          ...(filters.priceRanges?.includes('100-200') ? { minPrice: '100', maxPrice: '200' } : {})
        })}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Only update state if this is still the latest request
        if (lastFetchId.current === fetchId && data.success) {
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setCurrentPage(data.page || 1);
          setTotalPages(data.pages || 1);
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
        
        // Reset to page 1 when changing filters
        if (key !== 'page') {
          newParams.set('page', '1');
        }
        
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
    currentPage,
    totalPages,
    totalProducts,
    handleCategoryChange: (id: string) => updateFilters('category', id, 'toggle'),
    handlePriceRangeChange: (id: string) => updateFilters('price', id, 'toggle'),
    handleSortChange: (val: string) => updateFilters('sort', val, 'set'),
    handleSearchChange: (val: string) => updateFilters('search', val, 'set'),
    handlePageChange: (page: number) => updateFilters('page', page.toString(), 'set'),
    clearFilters: () => {
      setSearchParams(prev => {
        const cleaned = new URLSearchParams();
        if (prev.get('search')) cleaned.set('search', prev.get('search')!);
        if (prev.get('sort')) cleaned.set('sort', prev.get('sort')!);
        cleaned.set('page', '1');
        return cleaned;
      });
    },
  };
}

export default useProductSearch;