import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types';
import { fetchFeaturedProducts, fetchNewArrivals, fetchProductsOnSale } from '@/data/products';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featured, newProducts, onSale] = await Promise.all([
          fetchFeaturedProducts(),
          fetchNewArrivals(),
          fetchProductsOnSale()
        ]);
        
        setFeaturedProducts(featured);
        setNewArrivals(newProducts);
        setOnSaleProducts(onSale);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden mb-16">
        <div className="bg-gradient-to-r from-primary/90 to-primary/70 h-[500px] flex items-center">
          <div className="container mx-auto px-8 md:px-16 relative z-10">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Summer Sale Is Now On
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Discover amazing deals with up to 50% off on our summer collection. Limited time offer.
              </p>
              <Button size="lg" asChild>
                <Link to="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}
        />
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard 
            title="Electronics" 
            image="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            link="/products?category=electronics"
          />
          <CategoryCard 
            title="Clothing" 
            image="https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
            link="/products?category=clothing"
          />
          <CategoryCard 
            title="Home & Kitchen" 
            image="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80"
            link="/products?category=home"
          />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <TrendingUp size={24} className="mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Featured Products</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/products?sort=featured" className="flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
        
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <ProductGrid products={featuredProducts} loading={loading} />
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Clock size={24} className="mr-2 text-primary" />
            <h2 className="text-2xl font-bold">New Arrivals</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/products?sort=newest" className="flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
        
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <ProductGrid products={newArrivals} loading={loading} />
        )}
      </section>

      {/* On Sale Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Tag size={24} className="mr-2 text-primary" />
            <h2 className="text-2xl font-bold">On Sale</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/products?sort=discount" className="flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
        
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <ProductGrid products={onSaleProducts} loading={loading} />
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted rounded-xl p-8 md:p-12 text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Stay updated with the latest products, exclusive offers and shopping tips.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button>Subscribe</Button>
        </div>
      </section>
    </div>
  );
};

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
}

const CategoryCard = ({ title, image, link }: CategoryCardProps) => {
  return (
    <Link to={link}>
      <Card className="overflow-hidden h-64 group relative">
        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
        <CardContent className="relative h-full flex items-center justify-center p-6">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Home;