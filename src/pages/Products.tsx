import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import useProductSearch from '@/hooks/useProductSearch';
import useMediaQuery from '@/hooks/useMediaQuery';

// Sort options
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

// Category filter options
const categories = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'home', label: 'Home & Kitchen' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'books', label: 'Books' },
  { id: 'sports', label: 'Sports & Outdoors' },
];

// Price range filter options
const priceRanges = [
  { id: 'under-25', label: 'Under $25' },
  { id: '25-50', label: '$25 to $50' },
  { id: '50-100', label: '$50 to $100' },
  { id: '100-200', label: '$100 to $200' },
  { id: 'over-200', label: 'Over $200' },
];

const Products = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    products,
    loading,
    error,
    searchQuery,
    selectedCategories,
    selectedPriceRanges,
    sortParam,
    handleCategoryChange,
    handlePriceRangeChange,
    handleSortChange,
    clearFilters,
  } = useProductSearch();

  const activeFilterCount = useMemo(
    () => selectedCategories.length + selectedPriceRanges.length,
    [selectedCategories, selectedPriceRanges]
  );

  const emptyMessage = useMemo(
    () =>
      activeFilterCount > 0 || searchQuery
        ? 'No products match your current filters. Try adjusting your criteria.'
        : 'No products found. Please check back later.',
    [activeFilterCount, searchQuery]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
      </h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              categories={categories}
              priceRanges={priceRanges}
              selectedCategories={selectedCategories}
              selectedPriceRanges={selectedPriceRanges}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setFiltersVisible((v) => !v)}
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              )}
              {!loading ? (
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{products.length}</span> products
                </p>
              ) : (
                <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center w-full sm:w-auto">
              <label htmlFor="sort" className="text-sm text-muted-foreground mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortParam}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={loading}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters Panel (Mobile) */}
          {isMobile && filtersVisible && (
            <div className="mb-6">
              <ProductFilters
                categories={categories}
                priceRanges={priceRanges}
                selectedCategories={selectedCategories}
                selectedPriceRanges={selectedPriceRanges}
                onCategoryChange={handleCategoryChange}
                onPriceRangeChange={handlePriceRangeChange}
                onClearFilters={clearFilters}
              />
              <Separator className="mt-6" />
            </div>
          )}

          {/* Products Grid */}
          <div className="min-h-[400px]">
            <ProductGrid
              products={products}
              loading={loading}
              emptyMessage={emptyMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;