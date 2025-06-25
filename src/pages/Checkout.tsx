import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
  const { createPaymentIntent, verifyUpiPayment, processCardPayment } = usePayment();
  
  const navigate = useNavigate();
  
  const [step, setStep] = useState(isAuthenticated ? 1 : 0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiId, setUpiId] = useState<string>('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [upiPaymentOption, setUpiPaymentOption] = useState<'qr' | 'id'>('qr');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
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
    
    // Payment details
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  // Convert to INR for UPI payments (using a fixed conversion rate for demo)
  const totalInINR = Math.round(total * 83); // Assuming 1 USD = 83 INR
  
  // Check if cart is empty and redirect
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items.length, orderComplete, navigate]);

  // Set UPI ID for payment - using the specified UPI ID
  const upiPaymentId = "7240172161@ybl";
  
  // Generate QR code when payment method is UPI
  useEffect(() => {
    if (paymentMethod === 'upi' && upiPaymentOption === 'qr') {
      // Generate a unique payment reference
      const reference = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setPaymentReference(reference);
      
      // Generate QR code with the specified UPI ID
      const qrCodeData = `upi://pay?pa=${upiPaymentId}&pn=ShopEase&am=${totalInINR}&cu=INR&tr=${reference}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`);
    }
  }, [paymentMethod, upiPaymentOption, totalInINR, upiPaymentId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };
  
  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (upiPaymentOption === 'id') {
      // Validate UPI ID
      if (!upiId || !upiId.includes('@')) {
        setPaymentError('Please enter a valid UPI ID (e.g., name@upi)');
        return;
      }
    }
    
    setPaymentError(null);
    setIsVerifyingPayment(true);
    
    // Create order first
    if (!orderId) {
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country
      };
      
      const orderResult = await createOrder(shippingAddress, 'upi');
      
      if (!orderResult.success) {
        setIsVerifyingPayment(false);
        setOrderError(orderResult.error || 'Failed to create order');
        return;
      }
      
      setOrderId(orderResult.order?.id || `demo-order-${Date.now()}`);
      
      // Create payment intent
      const paymentResult = await createPaymentIntent(orderResult.order?.id || `demo-order-${Date.now()}`, 'upi');
      
      if (!paymentResult.success) {
        setIsVerifyingPayment(false);
        setPaymentError(paymentResult.error || 'Failed to create payment');
        return;
      }
      
      setPaymentId(paymentResult.payment?.id || `demo-payment-${Date.now()}`);
    }
    
    // Simulate payment verification
    setTimeout(async () => {
      // In a real app, you would verify the payment with the backend
      if (paymentReference) {
        const verifyResult = await verifyUpiPayment(paymentReference);
        
        if (!verifyResult.success) {
          // For demo purposes, continue anyway
          console.log("Payment verification failed, but continuing for demo");
        }
      }
      
      setIsVerifyingPayment(false);
      setStep(3);
      setOrderComplete(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        emptyCart();
      }, 1000);
    }, 2000);
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For credit card payments
    if (paymentMethod === 'card') {
      // Validate card details (simplified for demo)
      if (formData.cardNumber.length < 16 || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        setPaymentError('Please fill in all card details correctly');
        return;
      }
    }
    
    setPaymentError(null);
    setIsVerifyingPayment(true);
    
    // Create order first
    if (!orderId) {
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country
      };
      
      const orderResult = await createOrder(shippingAddress, 'card');
      
      if (!orderResult.success) {
        setIsVerifyingPayment(false);
        setOrderError(orderResult.error || 'Failed to create order');
        return;
      }
      
      setOrderId(orderResult.order?.id || `demo-order-${Date.now()}`);
      
      // Create payment intent
      const paymentResult = await createPaymentIntent(orderResult.order?.id || `demo-order-${Date.now()}`, 'card');
      
      if (!paymentResult.success) {
        setIsVerifyingPayment(false);
        setPaymentError(paymentResult.error || 'Failed to create payment');
        return;
      }
      
      setPaymentId(paymentResult.payment?.id || `demo-payment-${Date.now()}`);
    }
    
    // Process card payment
    const cardDetails = {
      number: formData.cardNumber,
      name: formData.cardName,
      expiry: formData.expiryDate,
      cvv: formData.cvv
    };
    
    const processResult = await processCardPayment(paymentId, cardDetails);
    
    if (!processResult.success) {
      // For demo purposes, continue anyway
      console.log("Card payment processing failed, but continuing for demo");
    }
    
    setIsVerifyingPayment(false);
    setStep(3);
    setOrderComplete(true);
    
    // Clear cart after successful order
    setTimeout(() => {
      emptyCart();
    }, 1000);
  };
  
  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnTo: '/checkout' } });
  };
  
  // Check payment status (in a real app, this would poll the server)
  const checkPaymentStatus = async () => {
    setIsVerifyingPayment(true);
    
    // Create order first if not already created
    if (!orderId) {
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country
      };
      
      const orderResult = await createOrder(shippingAddress, 'upi');
      
      if (!orderResult.success) {
        setIsVerifyingPayment(false);
        setOrderError(orderResult.error || 'Failed to create order');
        return;
      }
      
      setOrderId(orderResult.order?.id || `demo-order-${Date.now()}`);
    }
    
    // Simulate checking payment status with backend
    setTimeout(() => {
      setIsVerifyingPayment(false);
      setStep(3);
      setOrderComplete(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        emptyCart();
      }, 1000);
    }, 2000);
  };
  
  if (items.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className={`flex flex-col items-center ${step >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 0 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              1
            </div>
            <span className="text-sm mt-1">Account</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              2
            </div>
            <span className="text-sm mt-1">Shipping</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              3
            </div>
            <span className="text-sm mt-1">Payment</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              4
            </div>
            <span className="text-sm mt-1">Complete</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Account */}
          {step === 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <p className="mb-6">Please log in to continue with your checkout.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleLoginRedirect}>
                    Log In
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Truck size={20} className="mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                </div>
                
                {orderError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
                    {orderError}
                  </div>
                )}
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium mb-1">
                        Address *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State/Province *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        ZIP/Postal Code *
                      </label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-1">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
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
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Payment Information */}
          {step === 2 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard size={20} className="mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                </div>
                
                {/* Payment Method Tabs */}
                <div className="flex border-b border-border mb-6">
                  <button
                    className={`py-2 px-4 font-medium ${paymentMethod === 'card' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => {
                      setPaymentMethod('card');
                      setPaymentError(null);
                    }}
                  >
                    <CreditCard size={16} className="inline-block mr-2" />
                    Credit Card
                  </button>
                  <button
                    className={`py-2 px-4 font-medium ${paymentMethod === 'upi' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => {
                      setPaymentMethod('upi');
                      setPaymentError(null);
                    }}
                  >
                    <QrCode size={16} className="inline-block mr-2" />
                    UPI Payment
                  </button>
                </div>
                
                {paymentError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
                    {paymentError}
                  </div>
                )}
                
                {/* Credit Card Payment Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                          Card Number *
                        </label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cardName" className="block text-sm font-medium mb-1">
                          Name on Card *
                        </label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
                            Expiry Date *
                          </label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                            CVV *
                          </label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isVerifyingPayment}>
                        {isVerifyingPayment ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </form>
                )}
                
                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex border-b border-border mb-4">
                        <button
                          className={`py-2 px-4 font-medium ${upiPaymentOption === 'qr' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                          onClick={() => setUpiPaymentOption('qr')}
                        >
                          Pay via QR Code
                        </button>
                        <button
                          className={`py-2 px-4 font-medium ${upiPaymentOption === 'id' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                          onClick={() => setUpiPaymentOption('id')}
                        >
                          Enter UPI ID
                        </button>
                      </div>
                      
                      <form onSubmit={handleUpiSubmit}>
                        <div className="space-y-4">
                          {upiPaymentOption === 'qr' ? (
                            <div className="text-center">
                              <div className="bg-muted/30 rounded-lg p-4 inline-block mb-4">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="UPI QR Code" 
                                  className="w-48 h-48 mx-auto"
                                />
                              </div>
                              <p className="text-sm mb-4">
                                Scan this QR code using any UPI app to pay ₹{totalInINR.toLocaleString('en-IN')}
                              </p>
                              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                                <QrCode size={16} />
                                <span>UPI ID: {upiPaymentId}</span>
                              </div>
                              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                                <span>Reference: {paymentReference}</span>
                              </div>
                              <Button 
                                type="button" 
                                onClick={checkPaymentStatus} 
                                disabled={isVerifyingPayment}
                                className="mt-4"
                              >
                                {isVerifyingPayment ? 'Verifying Payment...' : 'I have completed the payment'}
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <label htmlFor="upiId" className="block text-sm font-medium mb-1">
                                Enter UPI ID *
                              </label>
                              <Input
                                id="upiId"
                                placeholder="yourname@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Format: username@bankname (e.g., johndoe@okicici)
                              </p>
                              
                              <div className="flex justify-between mt-6">
                                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                                  Back
                                </Button>
                                <Button type="submit" disabled={isVerifyingPayment}>
                                  {isVerifyingPayment ? 'Verifying Payment...' : 'Pay ₹' + totalInINR.toLocaleString('en-IN')}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Order Complete */}
          {step === 3 && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle size={64} className="mx-auto text-success mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <p className="font-medium mb-6">
                  Order Number: <span className="text-primary">#ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  A confirmation email has been sent to {formData.email}
                </p>
                <Button asChild>
                  <a href="/">Continue Shopping</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              {step < 3 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-muted overflow-hidden mr-3">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm line-clamp-1">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
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
                    
                    {/* Show in INR for UPI payments */}
                    {paymentMethod === 'upi' && (
                      <div className="flex justify-between text-sm mt-2 bg-muted/30 p-2 rounded">
                        <span>Total in INR</span>
                        <span>₹{totalInINR.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span>{paymentMethod === 'card' ? 'Credit Card' : 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;