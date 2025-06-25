// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number; // Backend uses snake_case
  image: string;
  category: string;
  discount: number;
  rating: number;
  stock: number;
  tags: string[];
  created_at: string;
  updated_at?: string;
  
  // Frontend properties (camelCase)
  originalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
}

// Order Types
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress;
  payment_method: 'card' | 'upi';
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'card' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  payment_reference: string;
  payment_details?: any;
  created_at: string;
  updated_at?: string;
}

// Filter Types
export interface ProductFilters {
  search?: string;
  categories?: string[];
  priceRanges?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors?: any[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  products: T[];
}