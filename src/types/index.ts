// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Frontend uses camelCase
  image: string;
  category: string;
  discount: number;
  rating: number;
  stock: number;
  tags: string[];
  createdAt: string;
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
  productId: string;
  userId: string;
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
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'upi';
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'card' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  paymentReference: string;
  paymentDetails?: any;
  createdAt: string;
  updatedAt?: string;
}

// Filter Types
export interface ProductFilters {
  search?: string;
  categories?: string[];
  priceRanges?: string[];
  sort?: string;
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
  data: T[];
}