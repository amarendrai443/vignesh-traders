import { z } from 'zod';

// Weight variant validation schema
export const weightOptionSchema = z.object({
  weight: z.enum(['250g', '500g', '1kg'] as const),
  price: z.number().positive({ message: 'Price must be greater than 0' }),
  compare_at_price: z.number().positive().optional(),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }),
});

// Product validation schema for admin CRUD operations
export const productSchema = z.object({
  title: z.string().min(3, 'Product title must be at least 3 characters').max(200),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'Almonds',
    'Walnuts',
    'Pistachios',
    'Dates & Figs',
    'Berries & Seeds',
    'Gift Boxes',
  ] as const),
  weight_options: z
    .array(weightOptionSchema)
    .min(1, 'Product must offer at least one weight option (250g, 500g, or 1kg)'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least 1 product image required'),
  is_featured: z.boolean().default(false),
  discount_percentage: z.number().min(0).max(100, 'Discount must be between 0% and 100%').default(0),
});

// Cart item inside an order
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  title: z.string().min(1, 'Product title is required'),
  weight: z.enum(['250g', '500g', '1kg'] as const),
  price: z.number().positive('Unit price must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// Mobile number regex (Indian & International E.164 10-15 digits)
const mobilePhoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{9,15}$/;

// Customer Checkout Order validation schema
export const checkoutOrderSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  mobile_number: z
    .string()
    .trim()
    .regex(mobilePhoneRegex, 'Please enter a valid 10-digit mobile number'),
  address: z
    .string()
    .trim()
    .min(10, 'Complete shipping address must be at least 10 characters (include street & pin code)')
    .max(500, 'Address is too long'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one product item'),
  total_amount: z.number().positive('Order total must be greater than zero'),
  payment_method: z.enum(['razorpay_upi', 'cash_on_delivery', 'card'] as const),
});

// Rate-limited Order Lookup query validation
export const orderLookupSchema = z.object({
  order_id: z.string().trim().min(4, 'Valid Order ID or Order Reference is required'),
  mobile_number: z
    .string()
    .trim()
    .regex(mobilePhoneRegex, 'Valid registered mobile number is required for verification'),
});

// Banner offer schema
export const bannerOfferSchema = z.object({
  title: z.string().min(3, 'Banner title must be at least 3 characters'),
  image_url: z.string().url('Image URL must be valid'),
  discount_tag: z.string().min(2, 'Discount tag is required (e.g. FESTIVE20)'),
  active: z.boolean().default(true),
});

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type BannerOfferInput = z.infer<typeof bannerOfferSchema>;
