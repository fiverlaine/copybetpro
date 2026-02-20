import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setSessionUser } from '../lib/session';
import { useNavigate, Link } from 'react-router-dom';
import { PoliciesModal } from '../components/PoliciesModal';
import { formatBrazilPhoneDisplay, formatBrazilPhoneForStorage, sanitizeBrazilPhoneInput } from '../utils/phone';

const UserIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

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

const PhoneIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  async function validateForm() {
    if (!form.full_name || !form.email || !form.phone || !form.password || !form.confirm) {
      setError('Por favor, preencha todos os campos.'); return false;
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.'); return false;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.'); return false;
    }
    if (form.phone.length !== 11) {
      setError('Informe um telefone válido com DDD e 9 dígitos.'); return false;
    }
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const isValid = await validateForm();
    if (!isValid) return;
    setShowPoliciesModal(true);
  }

  async function handleAcceptPolicies() {
    setLoading(true);
    setError(null);
    try {
      let ipAddress = null;
      let location = null;
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const ipData = await response.json();
          ipAddress = ipData.ip;
          if (ipData.city) {
            location = `${ipData.city}, ${ipData.region_code || ''} - ${ipData.country_code || ''}`;
          }
        }
      } catch (err) { console.warn('Erro ao obter localização:', err); }

      const { data, error } = await supabase.rpc('create_user_secure', {
        p_full_name: form.full_name,
        p_email: form.email,
        p_phone: formatBrazilPhoneForStorage(form.phone),
        p_password: form.password,
        p_policies_accepted: true,
        p_policies_accepted_at: new Date().toISOString(),
        p_ip_address: ipAddress,
        p_location: location
      });

      if (error) { setError(error.message); setLoading(false); return; }

      const user = data;
      if (user) {
        setSessionUser(user);
        setShowPoliciesModal(false);
        navigate('/dashboard');
      } else {
        setError('Erro inesperado ao criar conta.');
        setLoading(false);
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
               style={{ background: 'rgba(16, 185, 129, 0.15)', border: '2px solid var(--color-success)' }}>
            <CheckIcon />
          </div>
          <h2 className="heading-lg mb-2" style={{ color: 'var(--color-success)' }}>Conta criada!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-7 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
               style={{ background: 'var(--color-teal-dim)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="var(--color-teal)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="heading-xl mb-2">Criar sua conta</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Preencha os dados abaixo para começar
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

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label-modern">Nome completo</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <UserIcon />
                </div>
                <input type="text" className="input-modern" placeholder="Seu nome completo"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="label-modern">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <MailIcon />
                </div>
                <input type="email" className="input-modern" placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="label-modern">Telefone</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  <PhoneIcon />
                </div>
                <input type="tel" inputMode="numeric" className="input-modern"
                  placeholder="+55 (00) 00000-0000"
                  value={formatBrazilPhoneDisplay(form.phone)}
                  onChange={(e) => {
                    const digits = sanitizeBrazilPhoneInput(e.target.value);
                    setForm({ ...form, phone: digits });
                  }}
                  required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-modern">Senha</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                    <LockIcon />
                  </div>
                  <input type="password" className="input-modern" placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required />
                </div>
              </div>

              <div>
                <label className="label-modern">Confirmar senha</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                    <LockIcon />
                  </div>
                  <input type="password" className="input-modern" placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !mt-6">
              <span>Criar conta</span>
            </button>
          </form>

          <PoliciesModal
            isOpen={showPoliciesModal}
            onAccept={handleAcceptPolicies}
            onClose={() => setShowPoliciesModal(false)}
            canClose={true}
            loading={loading}
          />

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent-light)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-2.5">
          {['Acesso completo ao painel de controle', 'Gerenciamento de configurações da Exchange', 'Suporte técnico disponível'].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: 'var(--color-teal-dim)' }}>
                <CheckIcon />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
