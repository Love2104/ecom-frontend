import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import useCart from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

const Cart = () => {
  const { items, subtotal, updateItem, removeItem, emptyCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate cart totals
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem(productId, newQuantity);
  };
  
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };
  
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate coupon validation
    setTimeout(() => {
      // In a real app, you would validate the coupon with an API
      setCouponError('Invalid or expired coupon code');
      setIsProcessing(false);
    }, 800);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-muted-foreground mb-2 px-4">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          
          {items.map((item) => (
            <Card key={item.product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4">
                  {/* Product */}
                  <div className="col-span-1 md:col-span-6 flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link to={`/products/${item.product.id}`} className="font-medium hover:text-primary transition-colors">
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">{item.product.category}</div>
                      
                      {/* Mobile Price */}
                      <div className="md:hidden text-sm mt-2">
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-medium">{formatPrice(item.product.price)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price - Desktop */}
                  <div className="hidden md:block md:col-span-2 text-center">
                    {formatPrice(item.product.price)}
                  </div>
                  
                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-input rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end">
                    <span className="md:hidden text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="ml-4 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" asChild className="flex items-center">
              <Link to="/products">
                <ArrowLeft size={16} className="mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => emptyCart()}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              Clear Cart
            </Button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* Coupon Code */}
              <form onSubmit={handleApplyCoupon} className="mt-6">
                <div className="space-y-2">
                  <label htmlFor="coupon" className="text-sm font-medium">
                    Coupon Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      } }
                      placeholder="Enter coupon code"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={isProcessing}
                    />
                    <Button 
                      type="submit" 
                      variant="outline" 
                      size="sm"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive">{couponError}</p>
                  )}
                </div>
              </form>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
              
              <div className="mt-6 text-xs text-muted-foreground space-y-2">
                <p>Free shipping on orders over ₹50</p>
                <p>30-day return policy</p>
                <p>Secure checkout with SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;