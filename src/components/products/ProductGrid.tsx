import { Product } from '@/types';
import ProductCard from './ProductCard';
import React from 'react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

const SkeletonProductCard = () => (
  <div className="rounded-lg border border-border bg-card shadow-sm animate-pulse h-[400px]">
    <div className="pt-[100%] relative bg-muted"></div>
    <div className="p-4">
      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-muted rounded w-3/4 mb-4"></div>
      <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
      <div className="h-9 bg-muted rounded w-full"></div>
    </div>
  </div>
);

// Using memo to prevent unnecessary re-renders
const ProductGrid = React.memo(({ 
  products, 
  loading = false, 
  emptyMessage = "No products found. Try adjusting your search or filter criteria."
}: ProductGridProps) => {
  // Show loading skeletons only if no products are available
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonProductCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Show empty state only when not loading and products are empty
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Show existing products during loading */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      
      {/* Show additional skeletons when loading with existing products */}
      {loading && products.length > 0 && Array.from({ length: 4 }).map((_, index) => (
        <SkeletonProductCard key={`additional-skeleton-${index}`} />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;