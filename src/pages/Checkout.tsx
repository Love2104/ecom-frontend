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
  const { createPaymentIntent, verifyUpiPayment, processCardPayment } = usePayment();
  
  const navigate = useNavigate();
  
  const [step, setStep] = useState(isAuthenticated ? 1 : 0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiId, setUpiId] = useState<string>('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [upiPaymentOption, setUpiPaymentOption] = useState<'qr' | 'id'>('qr');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
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
  
  // No need for conversion as we're already using INR
  const totalInINR = total;
  
  // Check if cart is empty and redirect
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items.length, orderComplete, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && step === 0) {
      navigate('/login', { state: { returnTo: '/checkout' } });
    }
  }, [isAuthenticated, step, navigate]);

  // Set UPI ID for payment
  const upiPaymentId = "7240172161@ybl";
  
  // Generate QR code when UPI payment method is selected
  useEffect(() => {
    if (paymentMethod === 'upi' && upiPaymentOption === 'qr') {
      // In a real app, you would generate a QR code from your backend
      // For demo purposes, we'll use a placeholder QR code
      setQrCodeUrl(`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=upi://pay?pa=${upiPaymentId}&pn=ShopEase&am=${totalInINR}&cu=INR&tn=Order%20Payment`);
    }
  }, [paymentMethod, upiPaymentOption, totalInINR]);
  
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
  
  const validatePaymentForm = () => {
    if (paymentMethod === 'card') {
      // Validate card details
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        return false;
      }
      
      // Basic card number validation (should be 16 digits)
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        return false;
      }
      
      // Basic expiry date validation (should be in MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        return false;
      }
      
      // Basic CVV validation (should be 3 digits)
      if (!/^\d{3}$/.test(formData.cvv)) {
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (upiPaymentOption === 'id' && !upiId) {
        return false;
      }
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
    if (!validatePaymentForm()) {
      setPaymentError('Please fill all payment details correctly.');
      return;
    }
    
    setIsProcessingOrder(true);
    setOrderError(null);
    
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
      
      if (paymentMethod === 'card') {
        // Process card payment
        const cardDetails = {
          number: formData.cardNumber.replace(/\s/g, ''),
          name: formData.cardName,
          expiry: formData.expiryDate,
          cvv: formData.cvv
        };
        
        const processResult = await processCardPayment(paymentResult.payment.id, cardDetails);
        
        if (!processResult.success) {
          throw new Error(processResult.error || 'Failed to process card payment');
        }
        
        // Order complete
        setOrderComplete(true);
        emptyCart();
        setStep(3);
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${newOrderId}`);
      } else if (paymentMethod === 'upi') {
        // For UPI, we move to the verification step
        if (paymentResult.upi) {
          setQrCodeUrl(paymentResult.upi.qrCode || qrCodeUrl);
          setPaymentReference(paymentResult.upi.reference);
        }
        
        setStep(3); // UPI verification step
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setOrderError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessingOrder(false);
    }
  };
  
  const handleVerifyUpiPayment = async () => {
    if (!paymentReference) {
      setPaymentError('Payment reference is missing');
      return;
    }
    
    setIsVerifyingPayment(true);
    setPaymentError(null);
    
    try {
      const result = await verifyUpiPayment(paymentReference);
      
      if (result.success) {
        // Payment verified successfully
        setOrderComplete(true);
        emptyCart();
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${orderId}`);
      } else {
        setPaymentError(result.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('UPI verification error:', error);
      setPaymentError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsVerifyingPayment(false);
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
                      <span>Credit/Debit Card</span>
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
                  
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mt-6">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number *</label>
                        <Input 
                          id="cardNumber" 
                          name="cardNumber" 
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cardName" className="block text-sm font-medium mb-1">Name on Card *</label>
                        <Input 
                          id="cardName" 
                          name="cardName" 
                          value={formData.cardName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Expiry Date *</label>
                          <Input 
                            id="expiryDate" 
                            name="expiryDate" 
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium mb-1">CVV *</label>
                          <Input 
                            id="cvv" 
                            name="cvv" 
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          Your card information is secure and encrypted. We don't store your full card details.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 mt-6">
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setUpiPaymentOption('qr')}
                          className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-md ${
                            upiPaymentOption === 'qr' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <QrCode size={16} />
                          <span>Scan QR Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiPaymentOption('id')}
                          className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-md ${
                            upiPaymentOption === 'id' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span>Enter UPI ID</span>
                        </button>
                      </div>
                      
                      {upiPaymentOption === 'qr' && (
                        <div className="flex flex-col items-center justify-center p-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                          </p>
                          <div className="bg-white p-4 rounded-md shadow-md">
                            <img 
                              src={qrCodeUrl} 
                              alt="UPI Payment QR Code" 
                              className="w-48 h-48"
                            />
                          </div>
                          <p className="text-sm font-medium mt-4">
                            Amount: {formatPrice(totalInINR)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            UPI ID: {upiPaymentId}
                          </p>
                        </div>
                      )}
                      
                      {upiPaymentOption === 'id' && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="upiId" className="block text-sm font-medium mb-1">UPI ID *</label>
                            <Input 
                              id="upiId" 
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@upi"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: yourname@okhdfcbank, yourname@ybl
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {paymentError && (
                    <div className="text-sm text-destructive mt-4">
                      {paymentError}
                    </div>
                  )}
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
          
          {/* Step 3: UPI Payment Verification */}
          {step === 3 && paymentMethod === 'upi' && !orderComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode size={20} className="mr-2" />
                  UPI Payment Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p>
                    Please complete the payment using your UPI app and click 'Verify Payment' once done.
                  </p>
                  
                  {paymentError && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                      {paymentError}
                    </div>
                  )}
                  
                  <div className="bg-muted/30 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Payment Reference:</p>
                    <p className="font-medium">{paymentReference}</p>
                  </div>
                  
                  <Button 
                    onClick={handleVerifyUpiPayment} 
                    disabled={isVerifyingPayment}
                    className="mt-4"
                  >
                    {isVerifyingPayment ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Payment'
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