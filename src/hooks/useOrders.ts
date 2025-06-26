import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Order } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-production-2fab.up.railway.app/api';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return { success: false, error: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      // Use admin endpoint if user is admin, otherwise use user orders endpoint
      const endpoint = isAdmin ? '/orders' : '/orders/my-orders';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
      return { success: true, orders: data.orders || [] };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const fetchOrderById = useCallback(async (orderId: string) => {
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      return { success: true, order: data.order };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }, [token]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    if (!token || !isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      return { success: true, order: data.order };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }, [token, isAdmin]);

  const createOrder = useCallback(async (shippingAddress: any, paymentMethod: 'card' | 'upi') => {
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Get cart items from local storage or state
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (!cartItems.length) {
        return { success: false, error: 'Cart is empty' };
      }

      // Format items for the API
      const items = cartItems.map((item: any) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
          payment_method: paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return { success: true, order: data.order };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }, [token]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    createOrder,
    isAdmin
  };
}

export default useOrders;