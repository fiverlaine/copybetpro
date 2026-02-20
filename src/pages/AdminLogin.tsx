import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: isValid, error: rpcError } = await supabase.rpc('verify_admin_access', { p_secret: form.password });
      if (rpcError) throw rpcError;
      if (isValid) {
        sessionStorage.setItem('admin_session', JSON.stringify({
          email: form.email, role: 'admin', password: form.password, loginTime: new Date().toISOString()
        }));
        navigate('/a1c909fe301e7082/dashboard');
      } else {
        setError('Credenciais de administrador inválidas.');
      }
    } catch {
      setError('Erro ao verificar credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.5 }}>
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
               style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', boxShadow: '0 8px 32px rgba(220, 38, 38, 0.25)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="heading-xl mb-2" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Painel Admin
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Acesso restrito — Apenas administradores</p>
        </div>

        {/* Form */}
        <div className="surface-card p-7 animate-slide-up" style={{ borderColor: 'rgba(220, 38, 38, 0.15)' }}>
          {error && (
            <div className="mb-5 p-3.5 rounded-lg text-sm flex items-start gap-3"
                 style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-modern">Email Admin</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input type="email" className="input-modern" placeholder="admin@exemplo.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  style={{ '--tw-ring-color': 'rgba(220, 38, 38, 0.3)' } as any} />
              </div>
            </div>

            <div>
              <label className="label-modern">Senha</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input type="password" className="input-modern" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-all duration-200"
              style={{
                fontFamily: "'Satoshi', 'DM Sans', system-ui, sans-serif",
                background: loading ? 'var(--color-text-faint)' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(220, 38, 38, 0.3)',
                opacity: loading ? 0.6 : 1,
              }}>
              <span>{loading ? 'Verificando...' : 'Acessar Painel'}</span>
              {!loading && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--color-text-faint)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>Painel com informações sensíveis. Todas as ações são monitoradas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
