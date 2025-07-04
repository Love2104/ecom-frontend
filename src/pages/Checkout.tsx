import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { RootState } from '@/store';
import useAuth from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';
import usePayment from '@/hooks/usePayment';
import { formatPrice } from '@/lib/utils';

const Checkout = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useAuth();
  const { createOrder, emptyCart } = useCart();
  const { createPaymentIntent, processRazorpayPayment } = usePayment();
  
  const navigate = useNavigate();
  
  const [step, setStep] = useState(isAuthenticated ? 1 : 0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Shipping details
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  // Check if cart is empty and redirect
  if (items.length === 0 && step !== 3) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
      <p className="mb-4">Please add some items before checking out.</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );
}
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && step === 0) {
      navigate('/login', { state: { returnTo: '/checkout' } });
    }
  }, [isAuthenticated, step, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any payment errors when user types
    if (paymentError) {
      setPaymentError(null);
    }
  };
  
  const handlePaymentMethodChange = (method: 'card' | 'upi') => {
    setPaymentMethod(method);
    setPaymentError(null);
  };
  
  const validateShippingForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address', 'city', 'state', 'zipCode', 'country'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    
    return true;
  };
  
  const handleContinueToPayment = () => {
    if (validateShippingForm()) {
      setStep(2);
    } else {
      alert('Please fill all required fields correctly.');
    }
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessingOrder(true);
    setOrderError(null);
    setPaymentError(null);
    
    try {
      // Create shipping address object
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        phone: formData.phone
      };
      
      // Create order
      const orderResult = await createOrder(shippingAddress, paymentMethod);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }
      
      const newOrderId = orderResult.order.id;
      setOrderId(newOrderId);
      
      // Create payment intent
      const paymentResult = await createPaymentIntent(newOrderId, paymentMethod);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment intent');
      }
      
      if (paymentResult.razorpay) {
        // Process Razorpay payment
        const razorpayResult = await processRazorpayPayment(paymentResult.razorpay);
        
        if (razorpayResult.success) {
          // Payment successful
          setOrderComplete(true);
          emptyCart();
          setStep(3);
          
          console.log("✅ Razorpay success, navigating to confirmation page");
console.log("📦 Order ID:", newOrderId);
          // Redirect to order confirmation page
          navigate(`/order-confirmation/${newOrderId}`);
          

        } else {
          throw new Error(razorpayResult.error || 'Payment processing failed');
        }
      } else {
        throw new Error('Razorpay configuration missing');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessingOrder(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <span className="text-xs mt-1">Shipping</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
          <span className="text-xs mt-1">Payment</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            3
          </div>
          <span className="text-xs mt-1">Confirmation</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck size={20} className="mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name *</label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name *</label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number *</label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium mb-1">Address *</label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St, Apt 4B"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">City *</label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">State/Province *</label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP/Postal Code *</label>
                    <Input 
                      id="zipCode" 
                      name="zipCode" 
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">Country *</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" asChild>
                    <Link to="/cart">
                      <ArrowLeft size={16} className="mr-2" />
                      Back to Cart
                    </Link>
                  </Button>
                  <Button onClick={handleContinueToPayment}>
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Payment Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard size={20} className="mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderError && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                    {orderError}
                  </div>
                )}
                
                {paymentError && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                    {paymentError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('card')}
                      className={`flex-1 flex items-center justify-center space-x-2 p-4 border rounded-md ${
                        paymentMethod === 'card' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <CreditCard size={20} />
                      <span>Razorpay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('upi')}
                      className={`flex-1 flex items-center justify-center space-x-2 p-4 border rounded-md ${
                        paymentMethod === 'upi' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <QrCode size={20} />
                      <span>UPI Payment</span>
                    </button>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      {paymentMethod === 'card' 
                        ? 'You will be redirected to Razorpay to complete your payment securely.' 
                        : 'You will be redirected to your UPI app to complete the payment.'}
                    </p>
                    
                    <div className="mt-4 p-4 bg-muted/30 rounded-md">
                      <h3 className="font-medium mb-2">Payment Information</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your payment information is secure and encrypted. We don't store your full payment details.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <img src="https://cdn.razorpay.com/static/assets/merchant-badge/badge-dark.png" alt="Razorpay" className="h-8" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Shipping
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isProcessingOrder}>
                    {isProcessingOrder ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Order Confirmation */}
          {step === 3 && orderComplete && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle size={48} className="mx-auto text-success mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <Button asChild>
                  <Link to={`/order-confirmation/${orderId}`}>
                    View Order Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <div className="flex items-start">
                        <span className="text-sm font-medium mr-2">
                          {item.quantity} ×
                        </span>
                        <span className="text-sm">{item.product.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;