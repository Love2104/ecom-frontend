import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Product } from '@/types';
import { addToCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);

    setTimeout(() => {
      dispatch(addToCart({ product, quantity: 1 }));
      setIsAddingToCart(false);
    }, 300);
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card
        className="overflow-hidden transition-all duration-300 h-full flex flex-col hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative pt-[100%] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            loading="lazy"
          />
          {product.discount > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              -{product.discount}% OFF
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="outline" className="text-lg font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-grow p-4">
          <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
          <h3 className="font-medium text-foreground line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Rating display */}
          <div className="flex items-center mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(Number(product.rating))
                      ? 'text-yellow-400 fill-yellow-400'
                      : i < Number(product.rating)
                      ? 'text-yellow-400 fill-yellow-400 opacity-50'
                      : 'text-gray-300 fill-gray-300'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 group"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} className="mr-2 group-hover:text-primary transition-colors" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label={`Add ${product.name} to wishlist`}
            >
              <Heart size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
