import { INITIAL_PRODUCTS } from '../data/mockData';
import { Order, OrderItem, WeightUnit } from '../types';

export const STORE_OWNER_WHATSAPP = '919444810111';

export interface CheckoutPayload {
  customer_name: string;
  mobile_number: string;
  address: string;
  items: Array<{
    productId: string;
    weight: WeightUnit;
    quantity: number;
    clientReportedPrice?: number;
  }>;
  coupon_code?: string;
  payment_method: 'razorpay_upi' | 'card' | 'cash_on_delivery';
}

/**
 * Calculates authoritative order total based on catalog pricing.
 */
export function calculateAuthoritativeTotal(
  items: CheckoutPayload['items'],
  couponCode?: string
): {
  verifiedItems: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  priceDiscrepancyDetected: boolean;
} {
  let subtotal = 0;
  let priceDiscrepancyDetected = false;

  const verifiedItems: OrderItem[] = items.map((item) => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found in catalog`);
    }

    const weightOption = product.weight_options.find((w) => w.weight === item.weight);
    if (!weightOption) {
      throw new Error(`Weight ${item.weight} invalid for product ${product.title}`);
    }

    const authoritativeUnitPrice = weightOption.price;
    if (item.clientReportedPrice !== undefined && item.clientReportedPrice !== authoritativeUnitPrice) {
      priceDiscrepancyDetected = true;
    }

    const lineTotal = authoritativeUnitPrice * item.quantity;
    subtotal += lineTotal;

    return {
      productId: product.id,
      title: product.title || product.name,
      weight: item.weight,
      price: authoritativeUnitPrice,
      quantity: item.quantity,
    };
  });

  let discountPercent = 0;
  if (couponCode?.trim().toUpperCase() === 'ROYAL15') discountPercent = 15;
  if (couponCode?.trim().toUpperCase() === 'SHAHI20') discountPercent = 20;

  const discount = Math.round((subtotal * discountPercent) / 100);
  const netSubtotal = Math.max(0, subtotal - discount);
  const shipping = netSubtotal >= 999 || netSubtotal === 0 ? 0 : 90;
  const total = netSubtotal + shipping;

  return {
    verifiedItems,
    subtotal,
    discount,
    shipping,
    total,
    priceDiscrepancyDetected,
  };
}

export function generateCustomerWhatsAppUrl(order: Order): string {
  const cleanPhone = order.mobile_number.replace(/\D/g, '');
  const itemsText = order.items
    .map((i) => `• ${i.title} (${i.weight}) x ${i.quantity} = ₹${i.price * i.quantity}`)
    .join('\n');

  const text = `*Order Confirmed - Vignesh Traders* 📦\n\nDear ${order.customer_name},\nThank you for choosing Vignesh Traders! Your dry fruit order has been received.\n\n*Order ID:* ${order.id}\n*Total Amount:* ₹${order.total_amount}\n*Payment Status:* ${order.payment_status.toUpperCase()}\n\n*Items Ordered:*\n${itemsText}\n\n*Delivery Address:*\n${order.address}\n\nWe will notify you with the dispatch tracking number soon!\nHelpline: +91 94448 10111`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateStoreOwnerWhatsAppUrl(order: Order): string {
  const itemsText = order.items
    .map((i) => `• ${i.title} (${i.weight}) x ${i.quantity} = ₹${i.price * i.quantity}`)
    .join('\n');

  const text = `🚨 *NEW DRY FRUIT ORDER RECEIVED* 🚨\n\n*Order ID:* ${order.id}\n*Customer:* ${order.customer_name}\n*Phone:* ${order.mobile_number}\n*Total Value:* ₹${order.total_amount}\n*Payment Status:* ${order.payment_status.toUpperCase()}\n\n*Package Items:*\n${itemsText}\n\n*Dispatch Address:*\n${order.address}`;

  return `https://wa.me/${STORE_OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
