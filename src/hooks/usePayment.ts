import { useState } from 'react';
import useApi from './useApi';

interface PaymentIntent {
  id: string;
  reference: string;
  amount: number;
  method: 'card' | 'upi';
  status: string;
}

interface UpiPaymentDetails {
  qrCode: string;
  reference: string;
  upiId: string;
}

export function usePayment() {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [upiDetails, setUpiDetails] = useState<UpiPaymentDetails | null>(null);
  
  const createIntentApi = useApi({ requireAuth: true });
  const verifyUpiApi = useApi({ requireAuth: true });
  const processCardApi = useApi({ requireAuth: true });
  
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
        
        if (method === 'upi' && response.upi) {
          setUpiDetails(response.upi);
        }
        
        return { success: true, payment: response.payment, upi: response.upi };
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
  
  // Verify UPI payment
  const verifyUpiPayment = async (paymentReference: string) => {
    try {
      const response = await verifyUpiApi.fetchData({
        url: '/payments/verify-upi',
        method: 'POST',
        body: { paymentReference },
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
  
  // Process card payment
  const processCardPayment = async (paymentId: string, cardDetails: any) => {
    try {
      const response = await processCardApi.fetchData({
        url: '/payments/process-card',
        method: 'POST',
        body: { paymentId, cardDetails },
        requireAuth: true
      });
      
      if (response && response.success) {
        return { success: true, payment: response.payment };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || response?.message || 'Failed to process payment' 
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
    upiDetails,
    createPaymentIntent,
    verifyUpiPayment,
    processCardPayment,
    getPaymentStatus,
    createIntentLoading: createIntentApi.loading,
    createIntentError: createIntentApi.error,
    verifyUpiLoading: verifyUpiApi.loading,
    verifyUpiError: verifyUpiApi.error,
    processCardLoading: processCardApi.loading,
    processCardError: processCardApi.error
  };
}

export default usePayment;