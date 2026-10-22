import React, { createContext, useContext, useState } from 'react';
import { Product, Order, Banner, BannerOffer, Category, AuditLog, UserRole, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS, INITIAL_ORDERS, INITIAL_AUDIT_LOGS } from '../data/mockData';

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  categories: Category[];
  products: Product[];
  orders: Order[];
  banners: BannerOffer[];
  auditLogs: AuditLog[];
  createOrder: (orderData: Omit<Order, 'id' | 'created_at'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  updateProductStock: (productId: string, newStock: number) => boolean;
  updateProductDiscount: (productId: string, discount: number) => boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => boolean;
  updateProduct: (productId: string, product: Partial<Product>) => boolean;
  deleteProduct: (productId: string) => boolean;
  // Category CRUD
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => boolean;
  updateCategory: (id: string, category: Partial<Category>) => boolean;
  deleteCategory: (id: string) => boolean;
  // Banner CRUD
  addBanner: (banner: Omit<Banner, 'id' | 'created_at'>) => boolean;
  updateBanner: (id: string, banner: Partial<Banner>) => boolean;
  deleteBanner: (id: string) => boolean;
  toggleBannerStatus: (bannerId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [banners, setBanners] = useState<BannerOffer[]>(INITIAL_BANNERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const appendAuditLog = (
    action: AuditLog['action'],
    targetTable: AuditLog['target_table'],
    targetId: string,
    summary: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      admin_id: 'usr-admin-01 (JWT claim)',
      action,
      target_table: targetTable,
      target_id: targetId,
      changes_summary: summary,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'created_at'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const matchingItem = orderData.items.find((i) => i.productId === prod.id);
        if (matchingItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - matchingItem.quantity),
          };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
    if (role !== 'admin') return false;

    let previousStatus = '';
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          previousStatus = ord.order_status;
          return { ...ord, order_status: status };
        }
        return ord;
      })
    );

    appendAuditLog('STATUS_CHANGE', 'orders', orderId, `Status transitioned to '${status}'`);
    return true;
  };

  const updateProductStock = (productId: string, newStock: number): boolean => {
    if (role !== 'admin') return false;

    let prodTitle = '';
    let oldStock = 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          prodTitle = p.title;
          oldStock = p.stock;
          return { ...p, stock: Math.max(0, newStock) };
        }
        return p;
      })
    );

    appendAuditLog('UPDATE', 'products', productId, `Stock for '${prodTitle}' adjusted from ${oldStock} to ${newStock}`);
    return true;
  };

  const updateProductDiscount = (productId: string, discount: number): boolean => {
    if (role !== 'admin') return false;
    let prodTitle = '';
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          prodTitle = p.title;
          return { ...p, discount_percentage: discount };
        }
        return p;
      })
    );
    appendAuditLog('UPDATE', 'products', productId, `Discount updated to ${discount}%`);
    return true;
  };

  const addProduct = (newProdData: Omit<Product, 'id' | 'created_at'>): boolean => {
    if (role !== 'admin') return false;
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    appendAuditLog('CREATE', 'products', newProduct.id, `Created product '${newProduct.title}'`);
    return true;
  };

  const updateProduct = (productId: string, updatedData: Partial<Product>): boolean => {
    if (role !== 'admin') return false;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedData } : p))
    );
    appendAuditLog('UPDATE', 'products', productId, `Updated product fields`);
    return true;
  };

  const deleteProduct = (productId: string): boolean => {
    if (role !== 'admin') return false;
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    appendAuditLog('DELETE', 'products', productId, `Deleted product '${prod?.title || productId}'`);
    return true;
  };

  // CATEGORY CRUD
  const addCategory = (categoryData: Omit<Category, 'id' | 'created_at'>): boolean => {
    if (role !== 'admin') return false;
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.display_order - b.display_order));
    appendAuditLog('CREATE', 'categories', newCategory.id, `Added category '${newCategory.name}'`);
    return true;
  };

  const updateCategory = (id: string, updatedData: Partial<Category>): boolean => {
    if (role !== 'admin') return false;
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...updatedData } : c))
        .sort((a, b) => a.display_order - b.display_order)
    );
    appendAuditLog('UPDATE', 'categories', id, `Updated category details`);
    return true;
  };

  const deleteCategory = (id: string): boolean => {
    if (role !== 'admin') return false;
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    appendAuditLog('DELETE', 'categories', id, `Deleted category '${cat?.name || id}'`);
    return true;
  };

  // BANNER CRUD
  const addBanner = (bannerData: Omit<Banner, 'id' | 'created_at'>): boolean => {
    if (role !== 'admin') return false;
    const newBanner: BannerOffer = {
      ...bannerData,
      id: `ban-${Date.now()}`,
      created_at: new Date().toISOString(),
      discount_tag: bannerData.discount_badge,
      active: bannerData.is_active,
    };
    setBanners((prev) => [...prev, newBanner].sort((a, b) => a.display_order - b.display_order));
    appendAuditLog('CREATE', 'banners', newBanner.id, `Added banner '${newBanner.title}'`);
    return true;
  };

  const updateBanner = (id: string, updatedData: Partial<Banner>): boolean => {
    if (role !== 'admin') return false;
    setBanners((prev) =>
      prev
        .map((b) => {
          if (b.id === id) {
            const updated = { ...b, ...updatedData };
            if (updatedData.discount_badge !== undefined) {
              updated.discount_tag = updatedData.discount_badge;
            }
            if (updatedData.is_active !== undefined) {
              updated.active = updatedData.is_active;
            }
            return updated;
          }
          return b;
        })
        .sort((a, b) => a.display_order - b.display_order)
    );
    appendAuditLog('UPDATE', 'banners', id, `Updated banner details`);
    return true;
  };

  const deleteBanner = (id: string): boolean => {
    if (role !== 'admin') return false;
    const banner = banners.find((b) => b.id === id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    appendAuditLog('DELETE', 'banners', id, `Deleted banner '${banner?.title || id}'`);
    return true;
  };

  const toggleBannerStatus = (bannerId: string): boolean => {
    if (role !== 'admin') return false;
    let title = '';
    let newState = false;
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === bannerId) {
          title = b.title;
          newState = !(b.is_active ?? b.active);
          return { ...b, is_active: newState, active: newState };
        }
        return b;
      })
    );
    appendAuditLog('UPDATE', 'banners', bannerId, `Toggled banner '${title}' to ${newState ? 'active' : 'inactive'}`);
    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        role,
        setRole,
        categories,
        products,
        orders,
        banners,
        auditLogs,
        createOrder,
        updateOrderStatus,
        updateProductStock,
        updateProductDiscount,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
