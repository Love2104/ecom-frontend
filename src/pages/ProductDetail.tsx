import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ChevronRight, Minus, Plus, Heart, Share, Truck, RotateCcw, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import ProductReviews from '@/components/products/ProductReviews';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types';
import { addToCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';
import useApi from '@/hooks/useApi';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
  loading: loadingProduct,
  error: errorProduct,
  fetchData: fetchProduct
} = useApi<Product>();

const {
  fetchData: fetchRelated
} = useApi<Product[]>();

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const fetchedProduct = await fetchProduct({
        url: `/products/${id}`,
        method: 'GET',
      });

      if (fetchedProduct) {
        setProduct(fetchedProduct);
        const related = await fetchRelated({
          url: `/products?category=${fetchedProduct.category}`,
        });

        if (related) {
          setRelatedProducts(
            related.filter(p => p.id !== fetchedProduct.id).slice(0, 4)
          );
        }
      }

      setQuantity(1);
      setSelectedImage(0);
      window.scrollTo(0, 0);
    };

    load();
  }, [id]);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
    }
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorProduct || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {errorProduct || "The product you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const images = [product.image, product.image, product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/products" className="hover:text-primary">Products</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary capitalize">
          {product.category}
        </Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-muted'}`}
                >
                  <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.discount > 0 && (
            <Badge variant="destructive">{product.discount}% OFF</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="line-through text-muted-foreground">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <p className="text-muted-foreground">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <span className="text-foreground">Quantity:</span>
            <div className="flex items-center border border-input rounded-md">
              <button onClick={decreaseQuantity} disabled={quantity <= 1} className="px-3 py-1 text-muted-foreground hover:text-foreground">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button onClick={increaseQuantity} className="px-3 py-1 text-muted-foreground hover:text-foreground">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>Add to Cart</Button>
            <Button variant="outline" size="lg" className="flex-1">
              <Heart size={18} className="mr-2" /> Wishlist
            </Button>
          </div>

          {/* Features */}
          <div className="pt-6 space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2"><Truck size={18} /><span>Free shipping on orders over $50</span></div>
              <div className="flex items-center space-x-2"><RotateCcw size={18} /><span>30-day return policy</span></div>
              <div className="flex items-center space-x-2"><ShieldCheck size={18} /><span>1 year warranty</span></div>
              <div className="flex items-center space-x-2"><Share size={18} /><span>Share this product</span></div>
            </div>
            <Separator />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-4">Product Description</h2>
        <div className="prose max-w-none text-muted-foreground">
          <p>{product.description}</p>
          <ul>
            <li>High-quality materials</li>
            <li>Durable construction</li>
            <li>Easy to use</li>
            <li>Versatile functionality</li>
          </ul>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews
        reviews={[
          {
            id: '1', user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
            rating: 5, date: 'Aug 12, 2023', comment: 'Great product! Exactly as described and arrived quickly.'
          },
          {
            id: '2', user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
            rating: 4, date: 'Aug 10, 2023', comment: 'Very good quality for the price. Would recommend to others.'
          }
        ]}
        averageRating={4.5}
        totalReviews={2}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
