import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useProductSearch from '@/hooks/useProductSearch';
import useMediaQuery from '@/hooks/useMediaQuery';

// Category filter options matching existing data but visually adapted
const categories = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'home', label: 'Home & Kitchen' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'books', label: 'Books' },
  { id: 'sports', label: 'Sports & Outdoors' },
];

const colorOptions = [
  { id: 'black', label: 'Black', bg: 'bg-primary' },
  { id: 'white', label: 'White', bg: 'bg-[#E5E5E5]' },
  { id: 'red', label: 'Red', bg: 'bg-accent-red' },
  { id: 'gold', label: 'Gold', bg: 'bg-accent-gold' },
  { id: 'navy', label: 'Navy', bg: 'bg-[#2a4d69]' },
];

const MIN_PRICE = 0;
const MAX_PRICE = 100000;

const Products = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const {
    products,
    loading,
    error,
    searchQuery,
    selectedCategories,
    sortParam,
    currentPage,
    totalPages,
    totalProducts,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handleMinPriceChange,
    handleMaxPriceChange,
  } = useProductSearch();

  const toggleCategory = (categoryId: string) => {
    handleCategoryChange(categoryId);
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const handleMinSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(val);
    handleMinPriceChange(val);
  }, [maxPrice, handleMinPriceChange]);

  const handleMaxSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(val);
    handleMaxPriceChange(val);
  }, [minPrice, handleMaxPriceChange]);

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) setMinPrice(Math.max(MIN_PRICE, Math.min(raw, maxPrice - 1)));
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) setMaxPrice(Math.min(MAX_PRICE, Math.max(raw, minPrice + 1)));
  };

  const applyMinInput = () => handleMinPriceChange(minPrice);
  const applyMaxInput = () => handleMaxPriceChange(maxPrice);

  const handleInputKeyDown = (apply: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') apply();
  };

  const handleRatingClick = (rating: number) => {
    setMinRating(prev => prev === rating ? 0 : rating);
  };

  // Client-side rating filter (since ratings are not stored in DB)
  const filteredProducts = minRating > 0
    ? products.filter(p => (p.rating ?? 4) >= minRating)
    : products;

  return (
    <div className="bg-background-light text-primary selection:bg-accent-red/20 font-body min-h-screen">
      <main className="mx-auto flex w-full max-w-7xl flex-1 px-6 lg:px-12 py-8 gap-12">
        {/* Left Sidebar Filter */}
        <aside className={`${isMobile && !filtersVisible ? 'hidden' : 'block'} w-full lg:w-64 shrink-0 space-y-8 lg:sticky lg:top-28 lg:h-fit lg:max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar`}>
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">tune</span> Filters
            </h3>
            
            {/* Category Section */}
            <div className="border-b border-primary/10 pb-6 mb-6">
              <button className="flex w-full items-center justify-between font-bold text-sm uppercase tracking-widest mb-4">
                Category
                <span className="material-symbols-outlined">expand_less</span>
              </button>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded-sm border-primary/20 text-primary focus:ring-primary"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm text-primary/70 group-hover:text-primary">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className="border-b border-primary/10 pb-6 mb-6">
              <button className="flex w-full items-center justify-between font-bold text-sm uppercase tracking-widest mb-4">
                Price Range
                <span className="material-symbols-outlined">expand_less</span>
              </button>
              <div className="px-1 space-y-4">
                {/* Manual inputs */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-primary/40 font-semibold uppercase tracking-wider block mb-1">Min (₹)</label>
                    <div className="flex items-center border border-primary/20 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
                      <span className="pl-2 text-sm text-primary/40 font-bold select-none">₹</span>
                      <input
                        type="number"
                        min={MIN_PRICE}
                        max={maxPrice - 1}
                        value={minPrice}
                        onChange={handleMinInput}
                        onBlur={applyMinInput}
                        onKeyDown={handleInputKeyDown(applyMinInput)}
                        className="w-full bg-transparent py-1.5 px-1 text-sm font-bold text-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <span className="text-primary/30 font-bold text-sm mt-4">—</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-primary/40 font-semibold uppercase tracking-wider block mb-1">Max (₹)</label>
                    <div className="flex items-center border border-primary/20 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
                      <span className="pl-2 text-sm text-primary/40 font-bold select-none">₹</span>
                      <input
                        type="number"
                        min={minPrice + 1}
                        max={MAX_PRICE}
                        value={maxPrice}
                        onChange={handleMaxInput}
                        onBlur={applyMaxInput}
                        onKeyDown={handleInputKeyDown(applyMaxInput)}
                        className="w-full bg-transparent py-1.5 px-1 text-sm font-bold text-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dual range slider */}
                <div className="relative h-5 flex items-center">
                  <div className="absolute w-full h-1 bg-primary/10 rounded-full" />
                  <div
                    className="absolute h-1 bg-primary rounded-full"
                    style={{
                      left: `${(minPrice / MAX_PRICE) * 100}%`,
                      right: `${100 - (maxPrice / MAX_PRICE) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={1000}
                    value={minPrice}
                    onChange={handleMinSlider}
                    className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                    style={{ zIndex: minPrice > MAX_PRICE - 20000 ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={1000}
                    value={maxPrice}
                    onChange={handleMaxSlider}
                    className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-primary/40 font-semibold">
                  <span>₹0</span>
                  <span>₹1,00,000</span>
                </div>

                {(minPrice > MIN_PRICE || maxPrice < MAX_PRICE) && (
                  <button
                    onClick={() => {
                      setMinPrice(MIN_PRICE);
                      setMaxPrice(MAX_PRICE);
                      handleMinPriceChange(MIN_PRICE);
                      handleMaxPriceChange(MAX_PRICE);
                    }}
                    className="text-xs text-accent-red font-bold hover:underline"
                  >
                    Reset price
                  </button>
                )}
              </div>
            </div>

            {/* Rating Section */}
            <div className="border-b border-primary/10 pb-6 mb-6">
              <div className="flex w-full items-center justify-between font-bold text-sm uppercase tracking-widest mb-4">
                Rating
              </div>
              <div className="flex flex-col gap-1">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all w-fit ${
                      minRating === rating
                        ? 'bg-accent-gold/15 ring-1 ring-accent-gold/50'
                        : 'hover:bg-primary/5'
                    }`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-base ${
                          i < rating ? 'text-accent-gold fill-1' : 'text-primary/20'
                        }`}
                      >
                        star
                      </span>
                    ))}
                    <span className="text-xs text-primary/60 font-semibold ml-1">&amp; Up</span>
                  </button>
                ))}
                {minRating > 0 && (
                  <button
                    onClick={() => setMinRating(0)}
                    className="mt-1 text-xs text-accent-red font-bold hover:underline text-left px-2"
                  >
                    Clear rating
                  </button>
                )}
              </div>
            </div>
            
            {/* Color Swatches */}
            <div className="pb-6">
              <button className="flex w-full items-center justify-between font-bold text-sm uppercase tracking-widest mb-4">
                Colors
              </button>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    title={color.label}
                    onClick={() => toggleColor(color.id)}
                    className={`size-6 rounded-full ${color.bg} border border-black/10 ring-offset-2 transition-all ${
                      selectedColors.includes(color.id)
                        ? 'ring-2 ring-primary scale-110'
                        : 'ring-0 hover:ring-1 ring-primary/40 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
              {selectedColors.length > 0 && (
                <button
                  onClick={() => setSelectedColors([])}
                  className="mt-3 text-xs text-accent-red font-bold hover:underline"
                >
                  Clear colors
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Header Actions */}
          <div className="flex flex-col gap-6">
            <nav className="flex text-xs font-bold uppercase tracking-widest text-primary/40 gap-2 items-center">
              <Link className="hover:text-primary" to="/">Home</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">Collections</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-primary leading-none">
                  {searchQuery ? `Search: "${searchQuery}"` : 'Premium Edit'}
                </h1>
                <p className="text-primary/60 mt-3 font-medium">
                  Showing {products.length} of {totalProducts} results
                </p>
                {isMobile && (
                  <button onClick={() => setFiltersVisible(!filtersVisible)} className="mt-4 px-4 py-2 bg-primary/10 rounded-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition">
                    {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select 
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-transparent border-b border-primary/20 py-2 pr-8 text-sm font-bold uppercase tracking-widest focus:ring-0 focus:border-primary cursor-pointer outline-none"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="featured">Popularity</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-sm">expand_more</span>
                </div>
                <div className="flex items-center border border-primary/10 rounded-lg overflow-hidden hidden sm:flex">
                  <button className="p-2 bg-primary text-cream-bg flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                  </button>
                  <button className="p-2 hover:bg-primary/5 text-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl">list</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-accent-red/10 text-accent-red p-4 rounded-md mb-6 font-bold text-sm">
              {error}
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-12 text-center text-primary/60 font-medium">Loading premium selection...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-primary/60 font-medium">No products match your criteria.</div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col gap-4">
                  <Link to={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-primary/5 flex items-center justify-center block">
                    <img 
                      src={(() => {
                        const img = product.images?.[0];
                        if (!img) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop';
                        return typeof img === 'string' ? img : (img as any).url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop';
                      })()} 
                      alt={product.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                      className="absolute top-4 right-4 size-10 bg-cream-bg rounded-full flex items-center justify-center shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-xl">favorite</span>
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                        className="w-full bg-primary text-cream-bg font-bold py-3 uppercase tracking-widest text-xs rounded-lg shadow-xl"
                      >
                        Quick Add
                      </button>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <Link to={`/products/${product.id}`} className="text-sm font-bold uppercase tracking-wide hover:underline truncate mr-2 w-3/4">
                        {product.name}
                      </Link>
                      <p className="text-sm font-bold shrink-0">₹{product.price}</p>
                    </div>
                    <p className="text-primary/50 text-xs uppercase tracking-widest font-bold">Premium Brand</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex text-accent-gold">
                        <span className="material-symbols-outlined text-xs fill-1">star</span>
                        <span className="material-symbols-outlined text-xs fill-1">star</span>
                        <span className="material-symbols-outlined text-xs fill-1">star</span>
                        <span className="material-symbols-outlined text-xs fill-1">star</span>
                        <span className="material-symbols-outlined text-xs fill-1">star_half</span>
                      </div>
                      <span className="text-[10px] text-primary/40 font-bold">({Math.floor(Math.random() * 100) + 10})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 mb-20 gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="size-10 flex items-center justify-center border border-primary/10 rounded-lg hover:bg-primary hover:text-cream-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <button 
                   key={page}
                   onClick={() => handlePageChange(page)}
                   className={`size-10 flex items-center justify-center rounded-lg font-bold transition-colors ${currentPage === page ? 'bg-primary text-cream-bg' : 'border border-primary/10 hover:bg-primary/5'}`}
                 >
                   {page}
                 </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="size-10 flex items-center justify-center border border-primary/10 rounded-lg hover:bg-primary hover:text-cream-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;