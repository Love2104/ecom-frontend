import { useState } from 'react';
import { Sliders, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Separator } from '../ui/Separator';
import { Checkbox } from '../ui/Checkbox';

interface FilterOption {
  id: string;
  label: string;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  priceRanges: FilterOption[];
  selectedCategories: string[];
  selectedPriceRanges: string[];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: string) => void;
  onClearFilters: () => void;
}

const ProductFilters = ({
  categories,
  priceRanges,
  selectedCategories,
  selectedPriceRanges,
  onCategoryChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0;

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-auto p-0 text-muted-foreground hover:text-primary text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryChange(category.id)}
                />
                <label 
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Price Ranges */}
        <div>
          <h4 className="text-sm font-medium mb-3">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`price-${range.id}`}
                  checked={selectedPriceRanges.includes(range.id)}
                  onCheckedChange={() => onPriceRangeChange(range.id)}
                />
                <label 
                  htmlFor={`price-${range.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent />
      </div>
      
      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Sliders size={16} className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCategories.length + selectedPriceRanges.length}
            </span>
          )}
        </Button>
      </div>
      
      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Filters</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <FilterContent />
            
            <div className="mt-8 pt-4 border-t border-border">
              <Button 
                className="w-full" 
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;