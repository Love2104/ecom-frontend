import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToCart, updateQuantity, removeFromCart, clearCart } from '@/store/cartSlice';
import { Product } from '@/types';
import useApi from './useApi';

/**
 * Custom hook for cart operations
 */
export function useCart() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const orderApi = useApi({ requireAuth: true });
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  // Add item to cart
  const addItem = (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      return { success: false, error: 'Not enough stock available' };
    }
    
    dispatch(addToCart({ product, quantity }));
    return { success: true };
  };
  
  // Update item quantity
  const updateItem = (productId: string, quantity: number) => {
    const item = items.find(item => item.product.id === productId);
    
    if (!item) {
      return { success: false, error: 'Product not found in cart' };
    }
    
    if (item.product.stock < quantity) {
      return { success: false, error: 'Not enough stock available' };
    }
    
    dispatch(updateQuantity({ productId, quantity }));
    return { success: true };
  };
  
  // Remove item from cart
  const removeItem = (productId: string) => {
    dispatch(removeFromCart(productId));
    return { success: true };
  };
  
  // Clear the entire cart
  const emptyCart = () => {
    dispatch(clearCart());
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
        return { success: true, order: response.order };
      } else {
        return { 
          success: false, 
          error: response?.error?.message || 'Failed to create order' 
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