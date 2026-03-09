import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const discount = 0; // Assuming no promo applied initially
  const total = subtotal - discount + shipping + tax;
  
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
      setCouponError('Invalid or expired coupon code');
      setIsProcessing(false);
    }, 800);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="bg-background-light font-display text-primary min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-md mx-auto">
            <span className="material-symbols-outlined text-primary/40 text-7xl mb-6">shopping_bag</span>
            <h1 className="text-3xl font-extrabold mb-4 font-display">Your Cart is Empty</h1>
            <p className="text-primary/60 mb-8 font-body">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/products" className="bg-primary text-white py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all inline-block">
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="bg-background-light font-display text-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-primary/50 font-medium">
          <Link to="/" className="hover:text-primary hover:underline transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary cursor-default">Shopping Cart</span>
        </nav>

        <div className="mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 font-display">Shopping Cart</h2>
          <p className="text-primary/60 font-body">
            You have {items.length} item{items.length !== 1 ? 's' : ''} in your bag.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* Left Column: Cart Items (65%) */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-primary/5 shadow-sm transition-all hover:shadow-md">
                <Link to={`/products/${item.product.id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={Array.isArray(item.product.images) ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url) : item.product.images} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="text-lg font-bold font-display hover:underline">{item.product.name}</h3>
                    </Link>
                    <p className="text-lg font-bold font-display">{formatPrice(item.product.price)}</p>
                  </div>
                  <p className="text-primary/50 text-sm mb-4 font-body capitalize">Category: {item.product.category_name}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-primary/10 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-4 font-semibold text-sm w-12 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="flex items-center gap-1 text-accent-red hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between pt-4">
              <Link to="/products" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all font-display">
                <span className="material-symbols-outlined">arrow_back</span>
                Continue Shopping
              </Link>
              <button 
                onClick={emptyCart}
                className="text-primary/50 font-medium hover:text-accent-red transition-colors underline underline-offset-4 text-sm"
              >
                Clear All Items
              </button>
            </div>
          </div>
          
          {/* Right Column: Summary Card (35%) */}
          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="sticky top-24 bg-white rounded-xl p-8 border border-primary/5 shadow-xl">
              <h3 className="text-xl font-bold mb-6 font-display">Order Summary</h3>
              
              <div className="space-y-4 mb-8 text-sm font-body">
                <div className="flex justify-between text-primary/60">
                  <span>Subtotal</span>
                  <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-primary/60">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "text-primary font-medium"}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-primary/60">
                  <span>Estimated Taxes</span>
                  <span className="text-primary font-medium">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t border-primary/10 pt-4 flex justify-between items-end">
                  <span className="font-bold text-lg text-primary font-display">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary leading-none font-display">{formatPrice(total)}</p>
                    <p className="text-[10px] text-primary/40 mt-1 uppercase tracking-widest">Included VAT</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-bold mb-2 font-display">Promo Code</label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    disabled={isProcessing}
                    placeholder="Enter code" 
                    className="flex-1 bg-background-light border border-primary/10 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors text-sm disabled:opacity-50"
                  >
                    {isProcessing ? '...' : 'Apply'}
                  </button>
                </form>
                {couponError && <p className="text-xs text-accent-red mt-2 font-bold">{couponError}</p>}
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 font-display"
              >
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              
              <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col gap-4 font-body">
                <div className="flex items-center gap-3 text-primary/50 text-xs font-medium">
                  <span className="material-symbols-outlined text-green-600 text-lg">verified_user</span>
                  Secure 256-bit SSL encrypted payment
                </div>
                <div className="flex items-center gap-3 text-primary/50 text-xs font-medium">
                  <span className="material-symbols-outlined text-blue-500 text-lg">local_shipping</span>
                  Free delivery for orders over ₹50
                </div>
                <div className="flex items-center gap-3 text-primary/50 text-xs font-medium">
                  <span className="material-symbols-outlined text-accent-gold text-lg">history</span>
                  30-day easy returns policy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended / Cross-sell */}
        <section className="mt-24">
          <h3 className="text-2xl font-bold mb-8 font-display">You might also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-4 rounded-xl border border-primary/5 hover:shadow-lg transition-all">
              <div className="aspect-square bg-primary/5 rounded-lg flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <img src="https://via.placeholder.com/300x300" className="object-cover w-full h-full opacity-50" alt="Placeholder" />
              </div>
              <h4 className="font-bold font-display">Featured Item</h4>
              <p className="text-primary/50 text-sm font-medium">₹85.00</p>
              <Link to="/products" className="mt-4 w-full py-2 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all block text-center">View More</Link>
            </div>
            
            <div className="group bg-white p-4 rounded-xl border border-primary/5 hover:shadow-lg transition-all">
              <div className="aspect-square bg-primary/5 rounded-lg flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                <img src="https://via.placeholder.com/300x300" className="object-cover w-full h-full opacity-50" alt="Placeholder" />
              </div>
              <h4 className="font-bold font-display">Premium accessory</h4>
              <p className="text-primary/50 text-sm font-medium">₹32.00</p>
              <Link to="/products" className="mt-4 w-full py-2 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all block text-center">View More</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Cart;