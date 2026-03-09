import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { fetchProductById, fetchRelatedProducts } from '@/data/products';
import useCart from '@/hooks/useCart';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const productData = await fetchProductById(id);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        
        const related = await fetchRelatedProducts(id);
        setRelatedProducts(related.filter(p => p.id !== id));
        
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
      
      setQuantity(1);
      setSelectedImage(0);
      window.scrollTo(0, 0);
    };

    loadProduct();
  }, [id]);

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    setAddToCartError(null);
    
    try {
      const result = await addItem(product, quantity);
      
      if (!result.success) {
        setAddToCartError(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      setAddToCartError('An unexpected error occurred');
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-20 min-h-screen text-primary/60 text-center font-display font-bold text-xl">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-32 text-center min-h-screen">
        <h1 className="text-3xl font-extrabold font-display mb-4 text-primary">Product Not Found</h1>
        <p className="text-primary/60 mb-8 font-body">
          {error || "The product you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/products" className="bg-primary text-cream-bg py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.url)
    : ['https://via.placeholder.com/800x800', 'https://via.placeholder.com/800x800', 'https://via.placeholder.com/800x800', 'https://via.placeholder.com/800x800'];

  return (
    <div className="bg-background-light text-primary selection:bg-accent-gold/30 font-body min-h-screen">
      <main className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-primary/60 font-medium whitespace-nowrap overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to={`/products?category=${product.category_name}`} className="hover:text-primary transition-colors capitalize">
            {product.category_name}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm border border-primary/5">
              <img 
                src={images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {(product.discount ?? 0) > 0 && (
                <div className="absolute top-4 right-4 bg-accent-gold text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  {product.discount}% OFF
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-xl flex items-center justify-center border-2 overflow-hidden ${selectedImage === index ? 'border-primary ring-offset-2 ring-1 ring-primary' : 'border-primary/5 hover:border-accent-gold'} transition-all`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex text-accent-gold">
                <span className="material-symbols-outlined fill-1">star</span>
                <span className="material-symbols-outlined fill-1">star</span>
                <span className="material-symbols-outlined fill-1">star</span>
                <span className="material-symbols-outlined fill-1">star</span>
                <span className="material-symbols-outlined">star_half</span>
              </div>
              <span className="text-sm font-bold text-primary/60">(128 Reviews)</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-[1.1] mb-4 text-primary tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-primary font-display">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="text-xl text-primary/40 line-through font-display">{formatPrice(product.original_price)}</span>
              )}
            </div>

            <p className="text-lg text-primary/70 leading-relaxed mb-8 font-body">
              {product.description || 'A timeless piece designed to elevate your everyday experience stringently crafted for perfection.'}
            </p>

            {/* Options */}
            <div className="space-y-8 mb-10">
              {/* Product Variants Mockup */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-4">Select Option</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-2.5 rounded-full border-2 border-primary bg-primary text-white font-bold text-sm transition-all">Standard</button>
                  <button className="px-6 py-2.5 rounded-full border-2 border-primary/10 hover:border-primary/30 text-primary font-bold text-sm transition-all">Premium</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-10">
                {/* Quantity */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-4">Quantity</h3>
                  <div className="flex items-center bg-white border border-primary/10 rounded-lg p-1 w-fit">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1} className="size-8 flex items-center justify-center hover:bg-primary/5 rounded disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold">{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= product.stock} className="size-8 flex items-center justify-center hover:bg-primary/5 rounded disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end h-full">
                  <span className={`text-sm font-bold mt-8 ${product.stock > 0 ? 'text-green-600' : 'text-accent-red'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {addToCartError && (
              <div className="text-sm font-bold text-accent-red mb-4">
                {addToCartError}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-auto bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={async () => {
                  if (product && product.stock > 0) {
                    await addItem(product, quantity);
                    // Navigate to checkout
                    window.location.href = '/checkout';
                  }
                }}
                disabled={product.stock === 0}
                className="flex-auto border-2 border-primary text-primary py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">bolt</span>
                Buy Now
              </button>
            </div>

            {/* Accordion */}
            <div className="border-t border-primary/10">
              <details className="group py-4 border-b border-primary/10" open>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-bold font-display uppercase tracking-wider">Specifications</span>
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="pt-4 text-primary/70 text-sm space-y-2">
                  <div className="flex justify-between border-b border-primary/5 py-1">
                    <span>Category</span>
                    <span className="font-bold capitalize">{product.category_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-primary/5 py-1">
                    <span>SKU</span>
                    <span className="font-bold uppercase">{product.id.substring(0, 8)}</span>
                  </div>
                </div>
              </details>

              <details className="group py-4 border-b border-primary/10">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-bold font-display uppercase tracking-wider">Shipping & Returns</span>
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="pt-4 text-primary/70 text-sm">
                  <p>Complimentary express shipping on all orders over $1,000. 30-day hassle-free returns in original packaging.</p>
                </div>
              </details>

              <details className="group py-4 border-b border-primary/10">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-bold font-display uppercase tracking-wider">Reviews (128)</span>
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="pt-4 text-primary/70 text-sm">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-accent-gold scale-75 origin-left">
                        <span className="material-symbols-outlined fill-1">star</span>
                        <span className="material-symbols-outlined fill-1">star</span>
                        <span className="material-symbols-outlined fill-1">star</span>
                        <span className="material-symbols-outlined fill-1">star</span>
                        <span className="material-symbols-outlined fill-1">star</span>
                      </div>
                      <span className="font-bold text-primary">James W.</span>
                    </div>
                    <p className="italic">"The finish is absolutely breathtaking. Even better in person than the photos."</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Similar Products Row */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold font-display tracking-tight">Complete the Look</h2>
                <p className="text-primary/50 mt-1">Recommended for your collection</p>
              </div>
              <div className="flex gap-2 hidden sm:flex">
                <button className="p-2 border border-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">west</span>
                </button>
                <button className="p-2 border border-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">east</span>
                </button>
              </div>
            </div>
            
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {relatedProducts.map(related => (
                <div key={related.id} className="min-w-[280px] max-w-[280px] shrink-0 group snap-start">
                  <Link to={`/products/${related.id}`} className="block aspect-[4/5] bg-primary/5 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden shadow-sm border border-primary/5">
                    <img 
                      src={Array.isArray(related.images) ? (typeof related.images[0] === 'string' ? related.images[0] : related.images[0]?.url) : related.images} 
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(related, 1); }} 
                      className="absolute bottom-4 right-4 bg-white size-10 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-white hover:bg-primary"
                    >
                      <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                    </button>
                  </Link>
                  <Link to={`/products/${related.id}`}>
                    <h3 className="font-bold font-display text-lg truncate hover:underline">{related.name}</h3>
                  </Link>
                  <p className="text-primary/60 font-medium font-display">{formatPrice(related.price)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;