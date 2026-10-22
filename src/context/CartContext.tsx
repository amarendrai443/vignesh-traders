import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, WeightUnit } from '../types';

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, weight: WeightUnit, quantity?: number) => void;
  removeItem: (productId: string, weight: WeightUnit) => void;
  updateQuantity: (productId: string, weight: WeightUnit, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalAmount: number;
  itemCount: number;
  totalCount: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CART_STORAGE_KEY = 'zaffran_cart_v2';
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 90;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart to localStorage', e);
    }
  }, [cart]);

  const addItem = (product: Product, weight: WeightUnit, quantity = 1) => {
    const weightOption = product.weight_options.find((opt) => opt.weight === weight);
    if (!weightOption) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.selectedWeight === weight
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(
          product.stock,
          updated[existingIndex].quantity + quantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        name: product.name || product.title,
        title: product.title || product.name,
        image: product.images[0] || '',
        selectedWeight: weight,
        unitPrice: weightOption.price,
        quantity: Math.min(product.stock, quantity),
        maxStock: product.stock,
      };

      return [...prevCart, newItem];
    });

    setIsCartOpen(true);
  };

  const removeItem = (productId: string, weight: WeightUnit) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.selectedWeight === weight)
      )
    );
  };

  const updateQuantity = (productId: string, weight: WeightUnit, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, weight);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.selectedWeight === weight) {
          return {
            ...item,
            quantity: Math.min(item.maxStock, quantity),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ROYAL15') {
      setCouponCode('ROYAL15');
      setCouponDiscountPercent(15);
      return { success: true, message: 'ROYAL15 applied: 15% discount granted!' };
    }
    if (clean === 'SHAHI20') {
      setCouponCode('SHAHI20');
      setCouponDiscountPercent(20);
      return { success: true, message: 'SHAHI20 applied: 20% festive discount granted!' };
    }
    return { success: false, message: 'Invalid coupon code. Try ROYAL15 or SHAHI20' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const discount = Math.round((subtotal * couponDiscountPercent) / 100);
  const netSubtotal = Math.max(0, subtotal - discount);
  const shippingFee =
    cart.length === 0 || netSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;
  const total = netSubtotal + shippingFee;

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        discount,
        shippingFee,
        total,
        totalAmount: total,
        itemCount,
        totalCount: itemCount,
        couponCode,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
