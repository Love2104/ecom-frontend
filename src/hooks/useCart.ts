import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCartItems, addToCart, updateQuantity, removeFromCart, clearCart } from '@/store/cartSlice';
import { Product } from '@/types';
import useApi from './useApi';
import { useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-production-2fab.up.railway.app/api';

/**
 * Custom hook for cart operations
 */
export function useCart() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  
  const orderApi = useApi({ requireAuth: true });
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  // Fetch cart from backend when authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      
      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        dispatch(setCartItems(data.cart.items));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [isAuthenticated, token, dispatch]);
  
  // Sync cart with backend on authentication change
  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);
  
  // Add item to cart
  const addItem = async (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      return { success: false, error: 'Not enough stock available' };
    }
    
    // Update local state immediately for better UX
    dispatch(addToCart({ product, quantity }));
    
    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add item to cart');
        }
        
        // Refresh cart from backend to ensure consistency
        fetchCart();
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add item to cart' 
        };
      }
    }
    
    return { success: true };
  };
  
  // Update item quantity
  const updateItem = async (productId: string, quantity: number) => {
    const item = items.find(item => item.product.id === productId);
    
    if (!item) {
      return { success: false, error: 'Product not found in cart' };
    }
    
    if (item.product.stock < quantity) {
      return { success: false, error: 'Not enough stock available' };
    }
    
    // Update local state immediately for better UX
    dispatch(updateQuantity({ productId, quantity }));
    
    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId,
            quantity
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update cart item');
        }
        
        // Refresh cart from backend to ensure consistency
        fetchCart();
      } catch (error) {
        console.error('Error updating cart item:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update cart item' 
        };
      }
    }
    
    return { success: true };
  };
  
  // Remove item from cart
  const removeItem = async (productId: string) => {
    // Update local state immediately for better UX
    dispatch(removeFromCart(productId));
    
    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/cart/remove`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove item from cart');
        }
        
        // Refresh cart from backend to ensure consistency
        fetchCart();
      } catch (error) {
        console.error('Error removing item from cart:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to remove item from cart' 
        };
      }
    }
    
    return { success: true };
  };
  
  // Clear the entire cart
  const emptyCart = async () => {
    // Update local state immediately for better UX
    dispatch(clearCart());
    
    // If authenticated, sync with backend
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to clear cart');
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to clear cart' 
        };
      }
    }
    
    return { success: true };
  };
  
  // Check if a product is in the cart
  const isInCart = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };
  
  // Get quantity of a product in cart
  const getQuantity = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };
  
  // Create an order from the cart
  const createOrder = async (shippingAddress: any, paymentMethod: 'card' | 'upi') => {
    if (!isAuthenticated) {
      return { success: false, error: 'You must be logged in to create an order' };
    }
    
    if (items.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }
    
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));
      
      const response = await orderApi.fetchData({
        url: '/orders',
        method: 'POST',
        body: {
          items: orderItems,
          shipping_address: shippingAddress,
          payment_method: paymentMethod
        },
        requireAuth: true
      });
      
      if (response && response.success) {
        // Clear cart after successful order creation
        await emptyCart();
        return { success: true, order: response.order };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || response?.message || 'Failed to create order' 
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
    items,
    itemCount,
    subtotal,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    isInCart,
    getQuantity,
    createOrder,
    orderLoading: orderApi.loading,
    orderError: orderApi.error
  };
}

export default useCart;