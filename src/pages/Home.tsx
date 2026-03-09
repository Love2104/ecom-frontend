import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '@/data/products';
import { Product } from '@/types';

const STORY_YOUTUBE_ID = 'dQw4w9WgXcQ'; // Replace with your actual YouTube video ID


const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);


  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const featured = await fetchFeaturedProducts(4);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  return (
    <div className="bg-background-light font-body text-primary selection:bg-indian-red/30">
      
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
               <span className="inline-block px-4 py-1.5 bg-indian-red/10 text-indian-red font-sans font-bold text-xs uppercase tracking-widest rounded-full">
                India's Premium Choice
               </span>
               <h2 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.04em]">
                 Elevate <br/>Your <span className="text-underline-animated">Lifestyle</span>
               </h2>
               <p className="font-sans text-lg text-primary/60 max-w-md leading-relaxed">
                 Curated luxury and everyday essentials for the modern Indian home. Join 2.4 million happy customers today.
               </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <Link to="/products" className="px-8 py-4 bg-primary text-white font-sans font-extrabold rounded-full flex items-center gap-3 hover:translate-y-[-2px] transition-all">
                 Shop Collection
                 <span className="material-symbols-outlined">arrow_forward</span>
               </Link>
               <button className="px-8 py-4 border-2 border-primary/10 font-sans font-extrabold rounded-full flex items-center gap-3 hover:bg-primary/5 transition-all">
                 <span className="material-symbols-outlined">play_circle</span>
                 Watch Story
               </button>
            </div>
            
            <div className="flex flex-wrap gap-8 pt-6 border-t border-primary/5">
               <div>
                  <p className="font-display text-3xl">2.4M+</p>
                  <p className="text-xs font-sans font-bold text-primary/40 uppercase">Active Users</p>
               </div>
               <div>
                  <p className="font-display text-3xl">500+</p>
                  <p className="text-xs font-sans font-bold text-primary/40 uppercase">Top Brands</p>
               </div>
               <div>
                  <p className="font-display text-3xl">100%</p>
                  <p className="text-xs font-sans font-bold text-primary/40 uppercase">Authentic</p>
               </div>
            </div>
          </div>
          
          {/* Right Visual */}
          <div className="relative bg-primary rounded-[2.5rem] h-[600px] overflow-hidden bg-hero-grid-texture flex items-center justify-center group">
            {/* Floating Cards */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="absolute transform -rotate-12 translate-x-[-100px] translate-y-[-80px] w-56 h-72 bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between hover:rotate-0 transition-transform duration-500">
                  <div className="text-6xl text-center pt-8">🎧</div>
                  <div>
                    <p className="font-sans font-bold text-lg">Premium Audio</p>
                    <p className="text-sm text-primary/40">From ₹2,499</p>
                  </div>
               </div>
               
               <div className="absolute transform rotate-6 translate-x-[80px] translate-y-[20px] w-56 h-72 bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between hover:rotate-0 transition-transform duration-500 z-10">
                  <div className="text-6xl text-center pt-8">👟</div>
                  <div>
                    <p className="font-sans font-bold text-lg">Elite Kicks</p>
                    <p className="text-sm text-primary/40">New Arrivals</p>
                  </div>
               </div>
               
               <div className="absolute transform -rotate-3 translate-x-[-40px] translate-y-[120px] w-56 h-72 bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between hover:rotate-0 transition-transform duration-500">
                  <div className="text-6xl text-center pt-8">⌚</div>
                  <div>
                    <p className="font-sans font-bold text-lg">Smart Gear</p>
                    <p className="text-sm text-primary/40">Limited Series</p>
                  </div>
               </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute top-12 right-12 w-28 h-28 bg-indian-red rounded-full flex flex-col items-center justify-center text-white rotate-12 shadow-xl border-4 border-white/20">
               <p className="text-xs font-bold font-sans">SALE</p>
               <p className="text-2xl font-display leading-none">70%</p>
               <p className="text-xs font-bold font-sans">OFF</p>
            </div>
            
            {/* Pill tags */}
            <div className="absolute bottom-10 flex gap-4 px-10 w-full justify-center">
               <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">local_shipping</span> Free Delivery
               </span>
               <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">sync</span> Easy Returns
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-primary py-6 overflow-hidden whitespace-nowrap border-y border-white/10">
        <div className="flex items-center gap-12 animate-marquee">
          <div className="flex items-center gap-12 text-white font-display text-sm uppercase tracking-[0.2em]">
            <span>Free Delivery</span> <span className="text-accent-gold">•</span>
            <span>Easy Returns</span> <span className="text-accent-gold">•</span>
            <span>2.4M Customers</span> <span className="text-accent-gold">•</span>
            <span>Genuine Products</span> <span className="text-accent-gold">•</span>
            <span>Premium Quality</span> <span className="text-accent-gold">•</span>
            <span>24/7 Support</span> <span className="text-accent-gold">•</span>
            <span>Secure Checkout</span> <span className="text-accent-gold">•</span>
            <span>Curated Trends</span> <span className="text-accent-gold">•</span>
          </div>
          {/* Duplicated for seamless loop */}
          <div className="flex items-center gap-12 text-white font-display text-sm uppercase tracking-[0.2em] ml-12">
            <span>Free Delivery</span> <span className="text-accent-gold">•</span>
            <span>Easy Returns</span> <span className="text-accent-gold">•</span>
            <span>2.4M Customers</span> <span className="text-accent-gold">•</span>
            <span>Genuine Products</span> <span className="text-accent-gold">•</span>
            <span>Premium Quality</span> <span className="text-accent-gold">•</span>
            <span>24/7 Support</span> <span className="text-accent-gold">•</span>
            <span>Secure Checkout</span> <span className="text-accent-gold">•</span>
            <span>Curated Trends</span> <span className="text-accent-gold">•</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="font-display text-4xl tracking-tight">Shop by Category</h3>
            <p className="font-sans text-primary/40 mt-2 font-bold uppercase text-xs tracking-widest">Find your style</p>
          </div>
          <Link to="/products" className="font-sans font-bold text-sm border-b-2 border-primary hover:text-indian-red hover:border-indian-red transition-all">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Link to="/products?category=clothing" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👕</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Fashion</p>
          </Link>
          <Link to="/products?category=electronics" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💻</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Gadgets</p>
          </Link>
          <Link to="/products?category=beauty" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧴</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Beauty</p>
          </Link>
          <Link to="/products?category=home" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Home Decor</p>
          </Link>
          <Link to="/products?category=kids" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧸</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Kids</p>
          </Link>
          <Link to="/products?category=sports" className="group bg-white p-8 rounded-2xl text-center border border-primary/5 hover:bg-primary transition-all duration-300">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚽</div>
            <p className="font-sans font-bold text-sm group-hover:text-white transition-colors">Sports</p>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h3 className="font-display text-4xl tracking-tight">Featured Products</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button className="px-6 py-2 bg-primary text-white text-sm font-sans font-bold rounded-full shrink-0">All</button>
             <button className="px-6 py-2 bg-primary/5 text-primary text-sm font-sans font-bold rounded-full hover:bg-primary/10 shrink-0">New Arrivals</button>
             <button className="px-6 py-2 bg-primary/5 text-primary text-sm font-sans font-bold rounded-full hover:bg-primary/10 shrink-0">Best Sellers</button>
             <button className="px-6 py-2 bg-primary/5 text-primary text-sm font-sans font-bold rounded-full hover:bg-primary/10 shrink-0">Top Rated</button>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-10">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative space-y-4">
                <Link to={`/products/${product.id}`} className="block aspect-[4/5] bg-primary/5 rounded-3xl overflow-hidden relative">
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
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* handle favorite */ }} 
                     className="absolute top-4 right-4 p-2 bg-white rounded-full text-primary/40 hover:text-indian-red shadow-sm transition-colors z-10"
                   >
                     <span className="material-symbols-outlined text-xl">favorite</span>
                   </button>
                   <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* handle add to cart */ }}
                        className="w-full bg-primary text-white py-3 rounded-xl font-sans font-bold text-sm shadow-xl flex items-center justify-center gap-2"
                      >
                         <span className="material-symbols-outlined text-lg">add_shopping_cart</span> Quick Add
                      </button>
                   </div>
                </Link>
                <div className="px-2">
                   <div className="flex items-center gap-1 mb-1">
                     <span className="material-symbols-outlined text-xs text-accent-gold fill-1">star</span>
                     <span className="material-symbols-outlined text-xs text-accent-gold fill-1">star</span>
                     <span className="material-symbols-outlined text-xs text-accent-gold fill-1">star</span>
                     <span className="material-symbols-outlined text-xs text-accent-gold fill-1">star</span>
                     <span className="material-symbols-outlined text-xs text-accent-gold fill-1">star_half</span>
                     <span className="text-[10px] text-primary/40 ml-1 font-bold">(4.5)</span>
                   </div>
                   <h4 className="font-sans font-bold text-lg truncate">{product.name}</h4>
                   <p className="text-accent-gold font-display text-xl">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner with Countdown */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden bg-hero-grid-texture group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="text-center md:text-left space-y-6 md:flex-1">
              <h3 className="font-display text-5xl md:text-6xl text-white leading-tight">Flash Sale is <span className="text-accent-gold">LIVE</span></h3>
              <p className="text-white/60 font-sans text-lg max-w-md">Grab exclusive deals before they disappear. Limited stock available on premium electronics.</p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[80px] text-center border border-white/10">
                  <p className="text-2xl font-display text-white">02</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Hours</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[80px] text-center border border-white/10">
                  <p className="text-2xl font-display text-white">45</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Mins</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[80px] text-center border border-white/10">
                  <p className="text-2xl font-display text-white">12</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Secs</p>
                </div>
              </div>
              
              <Link to="/products?sale=true" className="inline-block bg-accent-gold text-primary font-sans font-black px-10 py-4 rounded-full shadow-xl shadow-accent-gold/20 hover:scale-105 transition-transform">
                Shop the Sale
              </Link>
            </div>
            
            <div className="md:flex-1 flex justify-center relative">
              <div className="text-[200px] leading-none drop-shadow-2xl animate-pulse">🛍️</div>
              <div className="absolute inset-0 bg-accent-gold/20 blur-[100px] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        <Link to="/products?category=electronics" className="h-80 rounded-[2rem] bg-gradient-to-br from-purple-600 to-teal-500 p-10 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-20 group-hover:scale-110 transition-transform">🎧</div>
          <div className="relative z-10 space-y-2">
            <span className="text-white/80 font-bold font-sans text-xs uppercase tracking-widest">Tech Exclusive</span>
            <h4 className="text-4xl font-display text-white">Wireless <br/>Audio Pro</h4>
          </div>
          <div className="relative z-10">
            <span className="bg-white text-primary px-6 py-2 rounded-full font-sans font-bold text-sm inline-block">Shop 40% Off</span>
          </div>
        </Link>
        <Link to="/products?category=clothing" className="h-80 rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-600 p-10 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-20 group-hover:scale-110 transition-transform">👠</div>
          <div className="relative z-10 space-y-2">
            <span className="text-white/80 font-bold font-sans text-xs uppercase tracking-widest">Fashion Forward</span>
            <h4 className="text-4xl font-display text-white">Designer <br/>Footwear</h4>
          </div>
          <div className="relative z-10">
            <span className="bg-white text-primary px-6 py-2 rounded-full font-sans font-bold text-sm inline-block">Shop 50% Off</span>
          </div>
        </Link>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h3 className="font-display text-5xl tracking-tight">Loved by Millions</h3>
            <p className="text-white/40 font-sans font-bold text-xs uppercase tracking-[0.2em]">Verified Experiences</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl space-y-6">
              <div className="text-accent-gold flex gap-1">
                <span className="material-symbols-outlined fill-1 text-sm">star</span>
                <span className="material-symbols-outlined fill-1 text-sm">star</span>
                <span className="material-symbols-outlined fill-1 text-sm">star</span>
                <span className="material-symbols-outlined fill-1 text-sm">star</span>
                <span className="material-symbols-outlined fill-1 text-sm">star</span>
              </div>
              <p className="font-sans text-lg italic leading-relaxed text-white/80">"The quality of the smart home products I ordered is incredible. Fast delivery in Bangalore!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-xl">👨🏽‍💼</div>
                <div>
                  <p className="font-sans font-bold">Arjun M.</p>
                  <p className="text-xs text-white/40">Verified Buyer</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl space-y-6 mt-8 md:mt-0">
               <div className="text-accent-gold flex gap-1">
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
               </div>
               <p className="font-sans text-lg italic leading-relaxed text-white/80">"Finding authentic brands in India was hard until ShopEase. Their curation is spot on."</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-xl">👩🏾‍🎨</div>
                 <div>
                   <p className="font-sans font-bold">Priya S.</p>
                   <p className="text-xs text-white/40">Loyalty Member</p>
                 </div>
               </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl space-y-6 mt-8 md:mt-0">
               <div className="text-accent-gold flex gap-1">
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
                 <span className="material-symbols-outlined fill-1 text-sm">star</span>
               </div>
               <p className="font-sans text-lg italic leading-relaxed text-white/80">"Great customer support! Had an issue with sizing and they replaced it in 48 hours."</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl">🧔🏾‍♂️</div>
                 <div>
                   <p className="font-sans font-bold">Rohan D.</p>
                   <p className="text-xs text-white/40">Professional</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {showStoryModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md"
          onClick={() => setShowStoryModal(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${STORY_YOUTUBE_ID}?autoplay=1&rel=0`}
              title="ShopEase Story"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;