import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '@/store';
import useAuth from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';
import usePayment from '@/hooks/usePayment';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const Checkout = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useAuth();
  const { createOrder, emptyCart } = useCart();
  const { createPaymentIntent, processRazorpayPayment } = usePayment();
  const { showToast } = useToast();
  
  const navigate = useNavigate();
  
  const [step, setStep] = useState(isAuthenticated ? 1 : 1); // Mock auth required or not
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India',
  });
  
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; 
  const discount = 0; 
  const total = subtotal - discount + shipping + tax;
  
  useEffect(() => {
    if (!isAuthenticated && step === 0) {
      navigate('/login', { state: { returnTo: '/checkout' } });
    }
  }, [isAuthenticated, step, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (paymentError) setPaymentError(null);
  };
  
  const handlePaymentMethodChange = (method: 'card' | 'upi') => {
    setPaymentMethod(method);
    setPaymentError(null);
  };
  
  const validateShippingForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return false;
    return true;
  };
  
  const handleContinueToPayment = () => {
    if (validateShippingForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      alert('Please fill all required fields correctly.');
    }
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessingOrder(true);
    setOrderError(null);
    setPaymentError(null);
    
    try {
      const shippingAddress = {
        name: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.city, // dummy
        zip_code: formData.zipCode,
        country: formData.country,
        phone: formData.phone
      };
      
      const orderResult = await createOrder(shippingAddress, paymentMethod, total);
      if (!orderResult.success) throw new Error(orderResult.error || 'Failed to create order');
      
      const newOrderId = orderResult.order.id;
      
      const paymentResult = await createPaymentIntent(newOrderId, paymentMethod);
      if (!paymentResult.success) throw new Error(paymentResult.error || 'Failed to create payment intent');
      
      if (paymentResult.razorpay) {
        const razorpayResult = await processRazorpayPayment(paymentResult.razorpay);
        if (razorpayResult.success) {
          showToast('Payment successful! Order confirmed.', 'success');
          emptyCart();
          setStep(3);
          navigate(`/order-confirmation/${newOrderId}`);
        } else {
          showToast(razorpayResult.error || 'Payment processing failed', 'error');
          throw new Error(razorpayResult.error || 'Payment processing failed');
        }
      } else {
        showToast('Razorpay configuration missing', 'error');
        throw new Error('Razorpay configuration missing');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="bg-background-light font-display text-primary min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-3xl font-extrabold mb-4 font-display">Your cart is empty</h2>
          <p className="mb-8 text-primary/60 font-body">Please add some items before checking out.</p>
          <Link to="/products" className="bg-primary text-white py-3 px-8 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light text-primary font-display min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Checkout Steps */}
          <div className="lg:col-span-8 space-y-10">
            {/* Progress Stepper */}
            <nav aria-label="Progress" className="mb-12">
              <ol className="flex items-center justify-between w-full" role="list">
                <li className="relative flex-1">
                  <div className="flex items-center group cursor-pointer" onClick={() => step > 1 && setStep(1)}>
                    <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-background-light ${step >= 1 ? 'bg-primary text-white' : 'border-2 border-primary/20 bg-white text-primary/40'}`}>
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </span>
                    <span className={`ml-4 text-sm font-bold uppercase tracking-widest hidden md:block ${step >= 1 ? 'text-primary' : 'text-primary/40'}`}>Address</span>
                  </div>
                  <div className={`absolute top-5 left-10 w-full h-0.5 -z-10 ${step >= 2 ? 'bg-primary' : 'bg-primary/10'}`}></div>
                </li>
                <li className="relative flex-1">
                  <div className="flex items-center justify-center group">
                    <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-background-light ${step >= 2 ? 'bg-primary text-white' : 'border-2 border-primary/20 bg-white text-primary/40'}`}>
                      <span className="material-symbols-outlined text-xl">payments</span>
                    </span>
                    <span className={`ml-4 text-sm font-bold uppercase tracking-widest hidden md:block ${step >= 2 ? 'text-primary' : 'text-primary/40'}`}>Payment</span>
                  </div>
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${step >= 3 ? 'bg-primary' : 'bg-primary/10'}`}></div>
                </li>
                <li className="relative">
                  <div className="flex items-center group">
                    <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-background-light ${step >= 3 ? 'bg-primary text-white' : 'border-2 border-primary/20 bg-white text-primary/40'}`}>
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </span>
                    <span className={`ml-4 text-sm font-bold uppercase tracking-widest hidden md:block ${step >= 3 ? 'text-primary' : 'text-primary/40'}`}>Confirm</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Section 1: Address Form */}
            {step === 1 && (
              <section className="bg-white p-8 rounded-xl shadow-sm border border-primary/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
                    <span className="text-accent-gold font-bold">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary font-display">Shipping Details</h2>
                </div>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group col-span-2">
                    <input 
                      id="fullName" 
                      type="text" 
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="fullName" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Full Name</label>
                  </div>

                  <div className="relative group">
                    <input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="email" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Email Address</label>
                  </div>

                  <div className="relative group">
                    <input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="phone" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Phone Number</label>
                  </div>

                  <div className="relative group col-span-2">
                    <input 
                      id="address" 
                      type="text" 
                      value={formData.address}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="address" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Street Address</label>
                  </div>

                  <div className="relative group">
                    <input 
                      id="city" 
                      type="text" 
                      value={formData.city}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="city" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">City</label>
                  </div>

                  <div className="relative group">
                    <input 
                      id="zipCode" 
                      type="text" 
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-background-light border-0 border-b-2 border-primary/10 focus:border-accent-gold focus:ring-0 transition-colors"
                      required 
                    />
                    <label htmlFor="zipCode" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Postal Code</label>
                  </div>
                </form>

                <div className="flex items-center justify-between pt-10">
                  <Link to="/cart" className="flex items-center gap-2 text-primary font-bold hover:text-accent-gold transition-colors font-display">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Cart
                  </Link>
                  <button 
                    onClick={handleContinueToPayment}
                    className="bg-primary text-white px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-accent-red transition-all shadow-lg hover:shadow-accent-red/20 text-xs font-display flex items-center"
                  >
                    Continue to Payment
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="bg-white p-8 rounded-xl shadow-sm border border-primary/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
                    <span className="text-accent-gold font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary font-display">Payment Method</h2>
                </div>

                {orderError && (
                  <div className="bg-accent-red/10 text-accent-red p-4 rounded-md mb-6 font-bold text-sm">
                    {orderError}
                  </div>
                )}
                {paymentError && (
                  <div className="bg-accent-red/10 text-accent-red p-4 rounded-md mb-6 font-bold text-sm">
                    {paymentError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => handlePaymentMethodChange('card')}
                    className={`p-4 border rounded-lg flex items-center gap-3 font-body transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-primary/10 bg-white hover:border-primary/30'}`}
                  >
                    <span className={`material-symbols-outlined ${paymentMethod === 'card' ? 'text-primary' : 'text-primary/40'}`}>credit_card</span>
                    <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-primary' : 'text-primary/60'}`}>Card / Net Banking (Razorpay)</span>
                  </button>
                  <button 
                    onClick={() => handlePaymentMethodChange('upi')}
                    className={`p-4 border rounded-lg flex items-center gap-3 font-body transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-primary/10 bg-white hover:border-primary/30'}`}
                  >
                    <span className={`material-symbols-outlined ${paymentMethod === 'upi' ? 'text-primary' : 'text-primary/40'}`}>qr_code_2</span>
                    <span className={`text-sm font-bold ${paymentMethod === 'upi' ? 'text-primary' : 'text-primary/60'}`}>UPI</span>
                  </button>
                </div>

                <div className="p-6 bg-background-light rounded-lg border border-primary/5 mb-8 text-sm text-primary/70 font-body">
                  <p className="mb-4">
                    {paymentMethod === 'card' 
                      ? 'You will be redirected to Razorpay to complete your payment securely using credit/debit card, net banking, or wallets.' 
                      : 'You will be redirected to Razorpay to complete the payment via any UPI app.'}
                  </p>
                  <p className="text-xs">Your payment information is secure and encrypted. We don't store your full payment details.</p>
                  <div className="mt-4 opacity-50 flex gap-2">
                    <img src="https://cdn.razorpay.com/static/assets/merchant-badge/badge-dark.png" alt="Razorpay" className="h-8 rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-primary font-bold hover:text-accent-gold transition-colors font-display"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Shipping
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessingOrder}
                    className="bg-primary text-white px-10 py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-accent-red transition-all shadow-lg hover:shadow-accent-red/20 text-xs font-display flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingOrder ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : (
                      'Pay & Place Order'
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* Preview of step 2 if step 1 is active */}
            {step === 1 && (
              <section className="bg-white/50 p-8 rounded-xl border border-dashed border-primary/20 opacity-70">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary/40 font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary/40 font-display">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-primary/10 rounded-lg flex items-center gap-3 bg-white">
                    <span className="material-symbols-outlined text-primary/20">qr_code_2</span>
                    <span className="text-sm font-bold text-primary/40">UPI</span>
                  </div>
                  <div className="p-4 border border-primary/10 rounded-lg flex items-center gap-3 bg-white">
                    <span className="material-symbols-outlined text-primary/20">credit_card</span>
                    <span className="text-sm font-bold text-primary/40">Card</span>
                  </div>
                  <div className="p-4 border border-primary/10 rounded-lg flex items-center gap-3 bg-white">
                    <span className="material-symbols-outlined text-primary/20">account_balance</span>
                    <span className="text-sm font-bold text-primary/40">Net Banking</span>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-primary/5">
                <div className="bg-primary p-6 text-white">
                  <h3 className="text-lg font-bold tracking-tight font-display">Order Summary</h3>
                  <p className="text-white/60 text-xs uppercase tracking-widest mt-1 font-body">{items.length} Items in Cart</p>
                </div>
                
                <div className="p-6 space-y-4 font-body">
                  {/* Items */}
                  <div className="max-h-64 overflow-y-auto no-scrollbar space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-background-light rounded-lg overflow-hidden flex-shrink-0">
                          <img src={Array.isArray(item.product.images) ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : (item.product.images[0] as any)?.url) : item.product.images} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-primary hover:underline"><Link to={`/products/${item.product.id}`}>{item.product.name}</Link></h4>
                          <p className="text-xs text-primary/50 mt-1 capitalize">{item.product.category_name} | Qty: {item.quantity}</p>
                          <p className="text-sm font-bold mt-2 text-accent-red">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-primary/5 my-4" />
                  
                  {/* Calculation */}
                  <div className="space-y-3 font-body">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary/60">Subtotal</span>
                      <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-bold">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-primary/60">Shipping</span>
                      <span className="font-bold text-accent-gold uppercase text-[10px] tracking-tighter">
                        {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                      </span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary/60">Tax</span>
                        <span className="font-bold text-primary">{formatPrice(tax)}</span>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-between items-end border-t border-primary/10">
                      <div>
                        <p className="text-xs text-primary/40 uppercase font-bold tracking-widest mb-1">Total</p>
                        <p className="text-3xl font-black text-primary font-display leading-none">{formatPrice(total)}</p>
                      </div>
                      <span className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-1 rounded font-bold uppercase tracking-widest">INR</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 font-body">
                <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg border border-primary/5 text-center shadow-sm">
                  <span className="material-symbols-outlined text-accent-gold mb-2">lock</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg border border-primary/5 text-center shadow-sm">
                  <span className="material-symbols-outlined text-accent-gold mb-2">local_shipping</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;