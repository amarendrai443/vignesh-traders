import { Product, BannerOffer, Order, AuditLog } from '../types';
import { PRODUCTS } from './products';

export const INITIAL_PRODUCTS: Product[] = PRODUCTS;

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-000',
    name: 'Cashews',
    slug: 'cashews',
    image_url: 'https://images.unsplash.com/photo-1509912760295-88574a49c952?auto=format&fit=crop&w=400&q=80',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'cat-001',
    name: 'Almonds',
    slug: 'almonds',
    image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=400&q=80',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'cat-001b',
    name: 'Raisins',
    slug: 'raisins',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'cat-002',
    name: 'Walnuts',
    slug: 'walnuts',
    image_url: 'https://images.unsplash.com/photo-1568271679468-8850b88f3077?auto=format&fit=crop&w=400&q=80',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'cat-003',
    name: 'Pistachios',
    slug: 'pistachios',
    image_url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=400&q=80',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'cat-004',
    name: 'Dates & Figs',
    slug: 'dates-figs',
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=400&q=80',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'cat-005',
    name: 'Berries & Seeds',
    slug: 'berries-seeds',
    image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'cat-006',
    name: 'Gift Boxes',
    slug: 'gift-boxes',
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    display_order: 6,
    is_active: true,
  },
];

export const INITIAL_BANNERS: BannerOffer[] = [
  {
    id: 'ban-001',
    title: 'Royal Festive Harvest — Flat 15% Off on Select Kashmiri Walnuts',
    image_url: 'https://images.unsplash.com/photo-1568271679468-8850b88f3077?auto=format&fit=crop&w=1200&q=80',
    target_link: '/shop',
    discount_badge: 'ROYAL15',
    discount_tag: 'ROYAL15',
    is_active: true,
    active: true,
    display_order: 1,
  },
  {
    id: 'ban-002',
    title: 'Imperial Gift Hampers — Pre-Book for Corporate & Wedding Festivities',
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    target_link: '/combo-offers',
    discount_badge: 'SHAHI20',
    discount_tag: 'SHAHI20',
    is_active: true,
    active: true,
    display_order: 2,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-98214',
    customer_name: 'Rajesh Varma',
    mobile_number: '+919876543210',
    address: 'B-402, Royale Palm Heights, Golf Course Road, Gurugram, Haryana - 122002',
    items: [
      {
        productId: 'prod-001',
        title: 'Royal California Jumbo Almonds (Badam Giri)',
        weight: '500g',
        price: 650,
        quantity: 2,
      },
      {
        productId: 'prod-003',
        title: 'Afghani Royal Anjeer (Dried Golden Figs)',
        weight: '250g',
        price: 540,
        quantity: 1,
      },
    ],
    total_amount: 1840,
    payment_status: 'completed',
    order_status: 'shipped',
    payment_id: 'pay_rzp_mock_8127391',
    created_at: '2026-10-18T14:22:00Z',
  },
  {
    id: 'ORD-77149',
    customer_name: 'Ananya Deshmukh',
    mobile_number: '+919822334455',
    address: '14, Silver Oak Estate, Prabhat Road, Pune, Maharashtra - 411004',
    items: [
      {
        productId: 'prod-008',
        title: 'Imperial Shahi Wooden Gift Box (4-Jar Set)',
        weight: '1kg',
        price: 2950,
        quantity: 1,
      },
    ],
    total_amount: 2950,
    payment_status: 'completed',
    order_status: 'packed',
    payment_id: 'pay_rzp_mock_5539102',
    created_at: '2026-10-20T09:15:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    admin_id: 'usr-admin-01',
    action: 'UPDATE',
    target_table: 'products',
    target_id: 'prod-001',
    changes_summary: 'Updated stock from 90 to 85 units',
    timestamp: '2026-10-21T08:12:00Z',
  },
  {
    id: 'aud-002',
    admin_id: 'usr-admin-01',
    action: 'STATUS_CHANGE',
    target_table: 'orders',
    target_id: 'ORD-98214',
    changes_summary: 'Order status transitioned from "packed" to "shipped"',
    timestamp: '2026-10-21T09:30:00Z',
  },
];
