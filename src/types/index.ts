export type WeightUnit = '250g' | '500g' | '1kg';

export interface WeightOption {
  weight: WeightUnit;
  price: number;
  compare_at_price?: number;
  sku: string;
}

export interface Category {
  id: string;
  name: string;
  teluguName?: string;
  slug?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  teluguName?: string;
  category: string;
  pricePerWeight: Record<string, number>;
  images: string[];
  discount: number;
  inStock: boolean;

  // Extended storefront & administrative schema fields
  title: string;
  slug: string;
  description: string;
  category_id?: string;
  weight_options: WeightOption[];
  stock: number;
  is_featured: boolean;
  discount_percentage: number;
  created_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  title: string;
  image: string;
  selectedWeight: WeightUnit;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface OrderForm {
  customerName: string;
  mobileNumber: string;
  deliveryAddress: string;
  city?: string;
  pincode?: string;
  paymentMethod: 'online' | 'cod' | 'whatsapp';
  notes?: string;
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  weight: WeightUnit;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  items: OrderItem[];
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_id: string;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_link?: string;
  discount_badge?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export type BannerOffer = Banner & {
  discount_tag?: string;
  active?: boolean;
};

export interface AuditLog {
  id: string;
  admin_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  target_table: 'products' | 'orders' | 'banners' | 'categories' | 'banners_offers';
  target_id: string;
  changes_summary?: string;
  timestamp: string;
}

export type UserRole = 'customer' | 'admin';
