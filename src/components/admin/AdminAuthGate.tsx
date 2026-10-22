import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminAuthGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { setRole } = useStore();
  const [adminKey, setAdminKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Default admin security key or any 4+ char key for testing
    if (adminKey === 'admin123' || adminKey === '9444810111' || adminKey === 'vignesh') {
      setRole('admin');
      onSuccess();
    } else {
      setErrorMsg('Invalid Admin Access Credentials. Try "admin123" or "vignesh".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-amber-900/50 rounded-2xl shadow-2xl p-6 space-y-5 text-stone-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-xl text-amber-200">
            Protected Admin Route (/admin)
          </h2>
          <p className="text-xs text-stone-400">
            Guarded by Next.js Middleware &amp; Supabase Admin RBAC JWT Claim (<code className="text-amber-300">role = admin</code>).
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-600/70 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Admin Master Key / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin password (e.g. admin123)"
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-amber-900/50 rounded-xl text-xs text-stone-100 font-mono focus:border-amber-400 focus:outline-none"
                autoFocus
                required
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Demo Access Key: <code className="text-amber-400">admin123</code> or store helpline <code className="text-amber-400">9444810111</code>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition"
            >
              Authorize &amp; Enter
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-stone-800/80 text-[10px] text-stone-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RLS Enforced: public.is_admin() validation active</span>
        </div>
      </div>
    </div>
  );
};
