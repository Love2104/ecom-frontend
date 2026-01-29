import { useState } from 'react';
import useApi from './useApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface PaymentIntent {
  id: string;
  reference: string;
  amount: number;
  method: 'card' | 'upi';
  status: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    payment_reference: string;
    order_id: string;
  };
  theme: {
    color: string;
  };
}

export function usePayment() {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const createIntentApi = useApi({ requireAuth: true });
  const verifyPaymentApi = useApi({ requireAuth: true });
  
  // Create a payment intent
  const createPaymentIntent = async (orderId: string, method: 'card' | 'upi') => {
    try {
      const response = await createIntentApi.fetchData({
        url: '/payments/create-intent',
        method: 'POST',
        body: { orderId, method },
        requireAuth: true
      });
      
      if (response && response.success) {
        setPaymentIntent(response.payment);
        
        if (response.razorpay && response.razorpay.orderId) {
          setRazorpayOrderId(response.razorpay.orderId);
          return { 
            success: true, 
            payment: response.payment, 
            razorpay: response.razorpay 
          };
        }
        
        return { success: true, payment: response.payment };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || response?.message || 'Failed to create payment intent' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  };
  
  // Process Razorpay payment
  const processRazorpayPayment = (razorpayData: any) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      const options: RazorpayOptions = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: razorpayData.name || "ShopEase",
        description: razorpayData.description || "Payment for your order",
        order_id: razorpayData.orderId,
        handler: function(response) {
          // Handle the success callback
          verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            razorpayData.notes?.payment_reference
          ).then(result => {
            resolve(result);
          }).catch(err => {
            resolve({ 
              success: false, 
              error: err instanceof Error ? err.message : 'Payment verification failed' 
            });
          });
        },
        prefill: {
          name: razorpayData.prefill?.name || user?.name || '',
          email: razorpayData.prefill?.email || user?.email || '',
          contact: razorpayData.prefill?.contact || ''
        },
        notes: razorpayData.notes || {},
        theme: {
          color: "#3399cc"
        }
      };
      
      try {
        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', function(response: any) {
          resolve({ 
            success: false, 
            error: response.error.description || 'Payment failed'
          });
        });
        razorpayInstance.open();
      } catch (err) {
        resolve({ 
          success: false, 
          error: err instanceof Error ? err.message : 'Failed to initialize Razorpay'
        });
      }
    });
  };
  
  // Verify Razorpay payment
  const verifyRazorpayPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    paymentReference?: string
  ) => {
    try {
      const response = await verifyPaymentApi.fetchData({
        url: '/payments/verify',
        method: 'POST',
        body: { 
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature,
          paymentReference
        },
        requireAuth: true
      });
      
      if (response && response.success) {
        return { success: true, payment: response.payment };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || response?.message || 'Failed to verify payment' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  };
  
  // Get payment status
  const getPaymentStatus = async (paymentId: string) => {
    try {
      const response = await createIntentApi.fetchData({
        url: `/payments/${paymentId}`,
        requireAuth: true
      });
      
      if (response && response.success) {
        return { success: true, payment: response.payment };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || response?.message || 'Failed to get payment status' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  };
  
  return {
    paymentIntent,
    razorpayOrderId,
    createPaymentIntent,
    processRazorpayPayment,
    verifyRazorpayPayment,
    getPaymentStatus,
    createIntentLoading: createIntentApi.loading,
    createIntentError: createIntentApi.error,
    verifyPaymentLoading: verifyPaymentApi.loading,
    verifyPaymentError: verifyPaymentApi.error
  };
}

export default usePayment;