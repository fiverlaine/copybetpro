import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

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
      // Verifica credenciais via RPC
      const { data: isValid, error: rpcError } = await supabase.rpc('verify_admin_access', {
        p_secret: form.password
      });

      if (rpcError) throw rpcError;

      if (isValid) {
        // Salva a sessão do admin
        sessionStorage.setItem('admin_session', JSON.stringify({ 
          email: form.email, 
          role: 'admin',
          password: form.password, // Salva senha para usar nas requisições seguras
          loginTime: new Date().toISOString()
        }));
        navigate('/a1c909fe301e7082/dashboard');
      } else {
        setError('Credenciais de administrador inválidas.');
      }
    } catch (err) {
      setError('Erro ao verificar credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 opacity-50 pointer-events-none" 
           style={{
             background: 'radial-gradient(at 40% 20%, rgba(239, 68, 68, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(220, 38, 38, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(185, 28, 28, 0.15) 0px, transparent 50%)'
           }} />

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 shadow-2xl mb-6">
            <ShieldIcon />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Painel de Administrador
          </h1>
          <p className="text-gray-400">Acesso restrito - Apenas administradores autorizados</p>
        </div>

        {/* Formulário */}
        <div className="glass-card p-8 animate-slide-up border-red-900/30">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-modern">Email de Administrador</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MailIcon />
                </div>
                <input 
                  type="email" 
                  className="input-modern focus:border-red-500 focus:ring-red-500"
                  placeholder="admin@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="label-modern">Senha</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon />
                </div>
                <input 
                  type="password" 
                  className="input-modern focus:border-red-500 focus:ring-red-500"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg"
              style={{ 
                background: loading ? '#6b7280' : 'linear-gradient(to right, #dc2626, #b91c1c)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(220, 38, 38, 0.4)'
              }}
            >
              <span>{loading ? 'Verificando...' : 'Acessar Painel Admin'}</span>
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          {/* Aviso de segurança */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-start gap-3 text-xs text-gray-500">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>
                Este painel contém informações sensíveis. Todas as ações são registradas e monitoradas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

