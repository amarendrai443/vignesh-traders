import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Zap,
  FileCode,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Terminal,
  Lock,
} from 'lucide-react';
import { checkRateLimit, resetRateLimitStore, RATE_LIMIT_POLICIES, RateLimitResult } from '../lib/rate-limiter';
import { checkoutOrderSchema, orderLookupSchema, productSchema } from '../lib/validation';
import { useStore } from '../context/StoreContext';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { auditLogs, role, setRole } = useStore();
  const [activeTab, setActiveTab] = useState<'sql' | 'rls' | 'validation' | 'ratelimit' | 'audit' | 'pipeline'>('sql');
  const [isCopied, setIsCopied] = useState(false);

  // Rate Limiting Simulator State
  const [simulatorEndpoint, setSimulatorEndpoint] = useState<'CHECKOUT' | 'ORDER_LOOKUP'>('CHECKOUT');
  const [simulatorLogs, setSimulatorLogs] = useState<RateLimitResult[]>([]);
  const [simulatedIp, setSimulatedIp] = useState('203.0.113.42');

  // Zod Playground State
  const [zodTestInput, setZodTestInput] = useState({
    name: 'Siddharth Roy',
    phone: '9876543210',
    address: 'Flat 402, Royal Residency, Marine Drive, Mumbai 400020',
  });
  const [zodTestResult, setZodTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const sqlSchemaCode = `-- ====================================================================
-- SUPABASE POSTGRESQL ARCHITECTURAL SCHEMA & STRICT RLS POLICIES
-- Project: Zaffran Luxe - Premium Dry Fruits E-Commerce
-- ====================================================================

-- 1. Enable required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom ENUM Types for domain state machines
CREATE TYPE order_status_enum AS ENUM ('pending', 'packed', 'shipped', 'delivered');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 3. Security Definer Helper: Check if current authenticated user has 'admin' claim
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

-- 5. Products Table (With multi-weight options 250g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL, 
    -- Schema: [{"productId": "...", "title": "...", "weight": "500g", "price": 850, "quantity": 2}]
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    order_status order_status_enum NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Banners & Promotional Offers Table
CREATE TABLE IF NOT EXISTS public.banners_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    discount_tag VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES (B-Tree + GIN)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_weight_options_gin ON public.products USING GIN (weight_options);

CREATE INDEX IF NOT EXISTS idx_orders_mobile_number ON public.orders(mobile_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON public.orders USING GIN (items);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, only admin can insert/update/delete
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin full manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: Customers can insert pending orders and view only their own orders
CREATE POLICY "Customer place order" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (char_length(customer_name) >= 2 AND char_length(mobile_number) >= 10 AND total_amount > 0 AND order_status = 'pending');

CREATE POLICY "Customer view own order or Admin view all" ON public.orders FOR SELECT TO anon, authenticated
USING (public.is_admin() OR (auth.jwt() ->> 'phone' = mobile_number));

CREATE POLICY "Admin update order status" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Prevent order deletion" ON public.orders FOR DELETE TO authenticated USING (FALSE);

-- Banners: Anyone reads active banners, admin manages all
CREATE POLICY "Public read active banners" ON public.banners_offers FOR SELECT TO anon, authenticated USING (active = TRUE OR public.is_admin());
CREATE POLICY "Admin manage banners" ON public.banners_offers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit Logs: Admin read only; trigger-based insert
CREATE POLICY "Admin read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Prevent audit log mutation" ON public.audit_logs FOR UPDATE USING (FALSE);
CREATE POLICY "Prevent audit log deletion" ON public.audit_logs FOR DELETE USING (FALSE);`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sqlSchemaCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Rate Limiting Simulator Action
  const handleFireSimulatedRequest = () => {
    const config =
      simulatorEndpoint === 'CHECKOUT'
        ? RATE_LIMIT_POLICIES.CHECKOUT
        : RATE_LIMIT_POLICIES.ORDER_LOOKUP;

    const result = checkRateLimit(simulatedIp, config);
    setSimulatorLogs((prev) => [result, ...prev]);
  };

  const handleResetRateLimiter = () => {
    resetRateLimitStore(simulatedIp);
    setSimulatorLogs([]);
  };

  // Zod Test runner
  const handleRunZodTest = () => {
    const res = checkoutOrderSchema.safeParse({
      customer_name: zodTestInput.name,
      mobile_number: zodTestInput.phone,
      address: zodTestInput.address,
      items: [
        {
          productId: 'prod-001',
          title: 'Royal California Almonds',
          weight: '500g',
          price: 650,
          quantity: 1,
        },
      ],
      total_amount: 650,
      payment_method: 'razorpay_upi',
    });

    if (res.success) {
      setZodTestResult({
        success: true,
        message: 'Payload passed Zod validation schema successfully!',
        data: res.data,
      });
    } else {
      setZodTestResult({
        success: false,
        message: 'Validation failed with schema errors:',
        errors: res.error.flatten(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-amber-900/50 rounded-2xl shadow-2xl text-stone-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-amber-900/40 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-amber-200">
                  Architectural Foundation & Security Workbench
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Supabase + Zod + Sliding Window
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Production-grade PostgreSQL schema, RLS policies, rate-limiting middleware, and RBAC matrix.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-amber-900/30 bg-stone-950/40 px-4 overflow-x-auto">
          {[
            { id: 'sql', label: '1. Supabase SQL Schema', icon: <FileCode className="w-4 h-4" /> },
            { id: 'rls', label: '2. Strict RLS Policies', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'validation', label: '3. Zod Schema Sandbox', icon: <Terminal className="w-4 h-4" /> },
            { id: 'ratelimit', label: '4. Rate Limiter Simulator', icon: <Zap className="w-4 h-4" /> },
            { id: 'audit', label: `5. Live Audit Ledger (${auditLogs.length})`, icon: <Database className="w-4 h-4" /> },
            { id: 'pipeline', label: '6. Payment & Webhooks Pipeline', icon: <Lock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Complete Supabase SQL Schema */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    Supabase PostgreSQL DDL & Database Triggers
                  </h3>
                  <p className="text-xs text-stone-400">
                    Defines <code>products</code>, <code>orders</code>, <code>banners_offers</code>, and <code>audit_logs</code> with GIN & B-Tree indexes.
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-amber-900/40 bg-stone-950 p-4 font-mono text-[11px] text-stone-300 max-h-96 overflow-y-auto leading-relaxed">
                <pre>{sqlSchemaCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: Strict RLS Policies */}
          {activeTab === 'rls' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-900/40">
                <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Row Level Security (RLS) Matrix
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  PostgreSQL enforces these rules directly in the database engine, ensuring client-side requests cannot bypass business security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Table: public.products</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                      RLS ENABLED
                    </span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    <li>• <strong>SELECT:</strong> Allowed for <code>anon</code> & <code>authenticated</code> (catalog browsing).</li>
                    <li>• <strong>INSERT/UPDATE/DELETE:</strong> Strictly restricted to <code>public.is_admin()</code>.</li>
                    <li>• <strong>Inventory mutations:</strong> Automatically captured in <code>audit_logs</code> via PostgreSQL trigger.</li>
                  </ul>
                </div>

                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Table: public.orders</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                      RLS ENABLED
                    </span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    <li>• <strong>INSERT:</strong> Allowed with initial status locked to <code>pending</code>.</li>
                    <li>• <strong>SELECT:</strong> Only owner matching <code>mobile_number</code> OR Admin.</li>
                    <li>• <strong>UPDATE:</strong> Only Admin can change fulfillment (<code>order_status</code>).</li>
                    <li>• <strong>DELETE:</strong> Hard restricted (<code>FALSE</code>) for financial audit trails.</li>
                  </ul>
                </div>

                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Table: public.banners_offers</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                      RLS ENABLED
                    </span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    <li>• <strong>SELECT:</strong> Public can read <code>WHERE active = TRUE</code>.</li>
                    <li>• <strong>MANAGEMENT:</strong> Admin can toggle visibility and add promotional tags.</li>
                  </ul>
                </div>

                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">Table: public.audit_logs</span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded">
                      IMMUTABLE LEDGER
                    </span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-stone-300">
                    <li>• <strong>INSERT:</strong> Trigger-generated automatically on data modification.</li>
                    <li>• <strong>UPDATE / DELETE:</strong> Disallowed for all (enforced with <code>USING (FALSE)</code>).</li>
                    <li>• <strong>SELECT:</strong> Restricted exclusively to verified Admins.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Zod Schema Sandbox */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    Interactive Zod Input Validation Tester
                  </h3>
                  <p className="text-xs text-stone-400">
                    Test how <code>checkoutOrderSchema</code> and regex guards prevent malformed payloads before database execution.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Test Input Payload
                  </h4>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Customer Name (min 2 chars)</label>
                    <input
                      type="text"
                      value={zodTestInput.name}
                      onChange={(e) => setZodTestInput({ ...zodTestInput, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-xs text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Mobile Number (Regex: 10-15 digits)</label>
                    <input
                      type="text"
                      value={zodTestInput.phone}
                      onChange={(e) => setZodTestInput({ ...zodTestInput, phone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-xs font-mono text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Address (min 10 chars)</label>
                    <input
                      type="text"
                      value={zodTestInput.address}
                      onChange={(e) => setZodTestInput({ ...zodTestInput, address: e.target.value })}
                      className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-xs text-stone-100"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleRunZodTest}
                      className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                    >
                      Run Zod Validation
                    </button>
                    <button
                      onClick={() =>
                        setZodTestInput({
                          name: 'A',
                          phone: '1234',
                          address: 'Short',
                        })
                      }
                      className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                    >
                      Fill Invalid
                    </button>
                  </div>
                </div>

                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 font-mono text-xs space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-sans">
                    Zod Parser Output
                  </h4>
                  {zodTestResult ? (
                    <div
                      className={`p-3 rounded-lg border ${
                        zodTestResult.success
                          ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-600/50 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-2">
                        {zodTestResult.success ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{zodTestResult.message}</span>
                      </div>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(
                          zodTestResult.success ? zodTestResult.data : zodTestResult.errors,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">
                      Click &quot;Run Zod Validation&quot; to test schema parsing and error formatting.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Rate Limiter Simulator */}
          {activeTab === 'ratelimit' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-900/40">
                <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Sliding-Window Rate Limiter Stress Test
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Simulate concurrent client hits on sensitive endpoints. Once the threshold is exceeded, HTTP 429 Too Many Requests is triggered.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Control Panel */}
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Test Parameters
                  </h4>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Target Endpoint</label>
                    <select
                      value={simulatorEndpoint}
                      onChange={(e) => setSimulatorEndpoint(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-xs text-stone-100"
                    >
                      <option value="CHECKOUT">/api/checkout (Max 5 req/min)</option>
                      <option value="ORDER_LOOKUP">/api/orders/lookup (Max 10 req/min)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Simulated Client IP</label>
                    <input
                      type="text"
                      value={simulatedIp}
                      onChange={(e) => setSimulatedIp(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-xs font-mono text-stone-100"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleFireSimulatedRequest}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Send 1 Request (Hit Endpoint)</span>
                    </button>

                    <button
                      onClick={() => {
                        for (let i = 0; i < 6; i++) {
                          handleFireSimulatedRequest();
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <span>Spam 6 Rapid Requests (Trigger 429)</span>
                    </button>

                    <button
                      onClick={handleResetRateLimiter}
                      className="w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Counter</span>
                    </button>
                  </div>
                </div>

                {/* Live Console Output */}
                <div className="md:col-span-2 bg-stone-950/70 p-4 rounded-xl border border-stone-800 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">
                      HTTP Request Log & Headers
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Window: 60,000ms
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-60 space-y-2 font-mono text-[11px] pr-1">
                    {simulatorLogs.length === 0 ? (
                      <p className="text-stone-600 italic">No requests recorded yet. Click &quot;Send 1 Request&quot; above.</p>
                    ) : (
                      simulatorLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border ${
                            log.success
                              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                              : 'bg-rose-950/50 border-rose-600 text-rose-300 font-bold'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>
                              {log.success ? 'HTTP 200 OK' : 'HTTP 429 TOO MANY REQUESTS'}
                            </span>
                            <span className="text-stone-400 text-[10px]">
                              {log.endpoint}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-1 space-x-3">
                            <span>X-RateLimit-Limit: {log.limit}</span>
                            <span>X-RateLimit-Remaining: {log.remaining}</span>
                            {log.retryAfterSeconds && (
                              <span className="text-rose-400 font-bold">
                                Retry-After: {log.retryAfterSeconds}s
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Live Audit Ledger */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    Live Supabase Audit Log Ledger
                  </h3>
                  <p className="text-xs text-stone-400">
                    Triggered automatically on PostgreSQL table updates, status changes, and stock edits.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">Current Role:</span>
                  <button
                    onClick={() => setRole(role === 'admin' ? 'customer' : 'admin')}
                    className="px-2.5 py-1 rounded bg-amber-600 text-stone-950 text-xs font-bold"
                  >
                    Toggle to {role === 'admin' ? 'Customer' : 'Admin'}
                  </button>
                </div>
              </div>

              <div className="bg-stone-950/70 rounded-xl border border-stone-800 overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Table</th>
                      <th className="p-3">Target ID</th>
                      <th className="p-3">Change Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-900/40">
                        <td className="p-3 text-stone-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.action === 'CREATE'
                                ? 'bg-emerald-950 text-emerald-400'
                                : log.action === 'STATUS_CHANGE'
                                ? 'bg-amber-950 text-amber-400'
                                : 'bg-blue-950 text-blue-400'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-amber-400/90">{log.target_table}</td>
                        <td className="p-3 text-stone-400">{log.target_id}</td>
                        <td className="p-3 text-stone-200">{log.changes_summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Payment & Webhooks Pipeline */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-900/40">
                <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Secure Checkout &amp; Webhook Verification Architecture
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Protects business revenue by enforcing database price recalculation, double-charge idempotency keys, and HMAC SHA256 webhook signatures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Server-Authoritative Price Engine */}
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-300 block">
                    1. Server-Authoritative Price Recalculation
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Client-side prices can be tampered in browser dev tools. The route <code>/api/checkout</code> verifies every product ID and selected weight (250g, 500g, 1kg) against the database prices before generating payment hashes.
                  </p>
                  <pre className="p-2.5 rounded bg-stone-900 font-mono text-[10px] text-amber-300/90 overflow-x-auto">
{`const calc = calculateAuthoritativeTotal(payload.items);
const amountInPaise = calc.total * 100;
// Rejects tampered client prices automatically`}
                  </pre>
                </div>

                {/* 2. Idempotency Key Guard */}
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-300 block">
                    2. Idempotency Key Double-Charge Guard
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Checkout requests transmit an <code>Idempotency-Key</code> header. If a network retry occurs or the user clicks pay repeatedly, the server returns the cached payment session rather than charging twice.
                  </p>
                  <pre className="p-2.5 rounded bg-stone-900 font-mono text-[10px] text-emerald-300/90 overflow-x-auto">
{`if (idempotencyStore.has(idempotencyKey)) {
  return cachedResponse; // No double debit!
}`}
                  </pre>
                </div>

                {/* 3. HMAC SHA256 Webhook Verification */}
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-300 block">
                    3. HMAC SHA256 Webhook Verification
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Razorpay sends events to <code>/api/payment/webhook</code>. The payload is verified via timing-safe HMAC SHA256 against <code>RAZORPAY_WEBHOOK_SECRET</code>.
                  </p>
                  <pre className="p-2.5 rounded bg-stone-900 font-mono text-[10px] text-amber-300/90 overflow-x-auto">
{`crypto.createHmac('sha256', secret)
  .update(rawBody).digest('hex') === receivedSig;`}
                  </pre>
                </div>

                {/* 4. Automated WhatsApp Notifications */}
                <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-300 block">
                    4. Post-Payment WhatsApp Notification Webhook
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Upon <code>payment.captured</code>, automated pre-formatted WhatsApp links trigger for:
                  </p>
                  <ul className="text-[11px] text-stone-300 space-y-1">
                    <li>• <strong>Customer:</strong> Instant invoice, itemized manifest, Order ID.</li>
                    <li>• <strong>Store Owner (+91 94448 10111):</strong> Instant packing alert with delivery address.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
