// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  category_id: string;
  supplier_id: string;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  supplier_name?: string;
  category_name?: string;
}

export interface ProductFilters {
  search?: string;
  categories?: string[];
  priceRanges?: string[];
  sort?: string;
  page?: number;
  limit?: number;
  supplier_id?: string;
}

// User Types
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  MANAGER = 'MANAGER',
  SUPPLIER = 'SUPPLIER',
  BUYER = 'BUYER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  is_verified: boolean;
  supplier_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  business_name?: string;
  gst_number?: string;
  avatar?: string; // Optional frontend-only field if used
}

// Order Types
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string; // May need to be joined from products
  quantity: number;
  price: number;
  price_at_purchase: number;
  supplier_id: string;
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
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shipping_address: ShippingAddress;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payment_method?: 'card' | 'upi'; // Optional if not strict in DB
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  created_at: string;
  updated_at?: string;
}

// Cart Types (If implementing local or remote cart)
export interface CartItem {
  product: Product;
  quantity: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  products?: T; // For list responses sometimes
  product?: T; // For single responses
  user?: T;
  users?: T; // For user list responses
  key?: string; // For manager creation
  token?: string;
  error?: string; // Simple error string
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  pages?: number;
  products: T[];
}