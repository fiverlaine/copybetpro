import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setSessionUser } from '../lib/session';
import { useNavigate, Link } from 'react-router-dom';
import sigatraderLogo from '../assets/sigatrader-logo.svg';
import { PoliciesModal } from '../components/PoliciesModal';
import { formatBrazilPhoneDisplay, formatBrazilPhoneForStorage, sanitizeBrazilPhoneInput } from '../utils/phone';

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
      setError('Por favor, preencha todos os campos.');
      return false;
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return false;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (form.phone.length !== 11) {
      setError('Informe um telefone válido com DDD e 9 dígitos.');
      return false;
    }
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setShowPoliciesModal(true);
  }

  async function handleAcceptPolicies() {
    setLoading(true);
    setError(null);
    
    try {
      // Cria a conta com políticas aceitas
      const { data, error } = await supabase.from('users').insert({
        full_name: form.full_name,
        email: form.email,
        phone: formatBrazilPhoneForStorage(form.phone),
        password: form.password,
        policies_accepted: true,
        policies_accepted_at: new Date().toISOString(),
      }).select('*').maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        // Login automático após registro
        setSessionUser(data);
        setShowPoliciesModal(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 border-2 border-success mb-6">
            <CheckIcon />
          </div>
          <h2 className="h2 mb-3 text-success">Conta criada com sucesso!</h2>
          <p className="text-text-muted mb-6">Redirecionando para o login...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8 animate-fade-in">
          <img src={sigatraderLogo} alt="COPYBETPRO" className="h-10 mx-auto mb-4" />
          <h1 className="h2 mb-3">Criar sua conta</h1>
          <p className="text-text-muted">Preencha os dados abaixo para começar</p>
        </div>

        {/* Formulário */}
        <div className="glass-card p-8 animate-slide-up">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-modern">Nome completo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon />
                </div>
                <input 
                  type="text"
                  className="input-modern"
                  placeholder="Seu nome completo"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="label-modern">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
              <label className="label-modern">Telefone</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <PhoneIcon />
                </div>
                <input 
                  type="tel" 
                  inputMode="numeric"
                  className="input-modern"
                  placeholder="+55 (00) 00000-0000"
                  value={formatBrazilPhoneDisplay(form.phone)}
                  onChange={(e) => {
                    const digits = sanitizeBrazilPhoneInput(e.target.value);
                    setForm({ ...form, phone: digits });
                  }}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-modern">Senha</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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

              <div>
                <label className="label-modern">Confirmar senha</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon />
                  </div>
                  <input 
                    type="password" 
                    className="input-modern"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>Criar conta</span>
            </button>
          </form>

          {/* Modal de Políticas */}
          <PoliciesModal
            isOpen={showPoliciesModal}
            onAccept={handleAcceptPolicies}
            onClose={() => {
              setShowPoliciesModal(false);
            }}
            canClose={true}
            loading={loading}
          />

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <p className="text-text-muted text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CheckIcon />
            </div>
            <span>Acesso completo ao painel de controle</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CheckIcon />
            </div>
            <span>Gerenciamento de configurações da Betfair</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CheckIcon />
            </div>
            <span>Suporte técnico disponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}
