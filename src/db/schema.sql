-- ====================================================================
-- SUPABASE POSTGRESQL ARCHITECTURAL SCHEMA & STRICT RLS POLICIES
-- Project: Vignesh Traders - Categories, Products, Banners & Orders
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom ENUM Types for state machines
CREATE TYPE order_status_enum AS ENUM ('pending', 'packed', 'shipped', 'delivered');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 3. Security Definer Helper: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$;

-- 4. Audit Log Table (Immutable ledger of administrative actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
    target_table VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    changes_summary JSONB,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Products Table (Linked with category_id Foreign Key)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    weight_options JSONB NOT NULL DEFAULT '[]'::jsonb, 
    -- Schema: [{"weight": "250g", "price": 450, "sku": "ALM-250"}, ...]
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    order_status order_status_enum NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. Banners Table (Seasonal Offers & Promotions)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    target_link VARCHAR(255) NOT NULL DEFAULT '/shop',
    discount_badge VARCHAR(100) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_weight_options_gin ON public.products USING GIN (weight_options);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON public.banners(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_orders_mobile_number ON public.orders(mobile_number);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Public can read active categories, Admins manage all
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCTS: Public can read, Admins manage all
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admin manage products" ON public.products FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BANNERS: Public reads active banners, Admins manage all
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage banners" ON public.banners FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDERS: Customers can insert pending orders and view only their own orders
CREATE POLICY "Customer place order" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (char_length(customer_name) >= 2 AND char_length(mobile_number) >= 10 AND total_amount > 0 AND order_status = 'pending');

CREATE POLICY "Customer view own order or Admin view all" ON public.orders FOR SELECT TO anon, authenticated
USING (public.is_admin() OR (auth.jwt() ->> 'phone' = mobile_number));

CREATE POLICY "Admin update order status" ON public.orders FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Prevent order deletion" ON public.orders FOR DELETE TO authenticated
USING (FALSE);

-- AUDIT LOGS: Only Admin can read
CREATE POLICY "Admin read audit logs" ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

-- ====================================================================
-- AUTOMATED AUDIT TRIGGER IMPLEMENTATION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        target_table,
        target_id,
        changes_summary,
        timestamp
    )
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)),
        NOW()
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_categories ON public.categories;
CREATE TRIGGER trg_audit_categories
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS trg_audit_banners ON public.banners;
CREATE TRIGGER trg_audit_banners
AFTER INSERT OR UPDATE OR DELETE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();
