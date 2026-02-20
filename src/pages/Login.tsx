import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setSessionUser, getSessionUser } from '../lib/session';
import { useNavigate, Link } from 'react-router-dom';
import { PoliciesModal } from '../components/PoliciesModal';

const MailIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (user && !user.policies_accepted) {
      setUserData(user);
      setShowPoliciesModal(true);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.rpc('login_user_secure', {
      p_email: form.email,
      p_password: form.password
    });
    setLoading(false);

    if (error) { setError(error.message); return; }

    const user = Array.isArray(data) ? data[0] : data;
    if (!user) { setError('Credenciais inválidas.'); return; }

    setSessionUser(user);
    setUserData(user);

    if (!user.policies_accepted) {
      setShowPoliciesModal(true);
    } else {
      navigate('/dashboard');
    }
  }

  async function handleAcceptPolicies() {
    if (!userData) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          policies_accepted: true,
          policies_accepted_at: new Date().toISOString(),
        })
        .eq('id', userData.id)
        .select('*')
        .single();

      if (error) { setError('Erro ao salvar aceitação dos termos.'); setLoading(false); return; }
      if (data) {
        setSessionUser(data);
        setShowPoliciesModal(false);
        navigate('/dashboard');
      }
    } catch {
      setError('Erro ao salvar aceitação dos termos.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
               style={{ background: 'var(--color-accent)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="heading-xl mb-2">Bem-vindo de volta</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Entre com suas credenciais para acessar o painel
          </p>
        </div>

        {/* Form Card */}
        <div className="surface-card p-7 animate-slide-up">
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
              <label className="label-modern">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <MailIcon />
                </div>
                <input
                  type="email"
                  className="input-modern"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-modern">Senha</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <LockIcon />
                </div>
                <input
                  type="password"
                  className="input-modern"
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
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              {!loading && <ArrowIcon />}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent-light)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        <PoliciesModal
          isOpen={showPoliciesModal}
          onAccept={handleAcceptPolicies}
          onClose={undefined}
          canClose={false}
          loading={loading}
        />

        <div className="mt-5 text-center">
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            Ao fazer login, você concorda com nossos Termos de Serviço
          </p>
        </div>
      </div>
    </div>
  );
}
