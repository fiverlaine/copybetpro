import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setSessionUser, getSessionUser } from '../lib/session';
import { useNavigate, Link } from 'react-router-dom';
import sigatraderLogo from '../assets/sigatrader-logo.svg';
import { PoliciesModal } from '../components/PoliciesModal';

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

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Verifica se usuário já logado precisa aceitar políticas
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

    if (error) {
      setError(error.message);
      return;
    }

    // RPC retorna um array, pegamos o primeiro item
    const user = Array.isArray(data) ? data[0] : data;

    if (!user) {
      setError('Credenciais inválidas.');
      return;
    }

    setSessionUser(user);
    setUserData(user);

    // Se o usuário não aceitou as políticas, mostra o modal
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
      // Atualiza o usuário no banco de dados
      const { data, error } = await supabase
        .from('users')
        .update({
          policies_accepted: true,
          policies_accepted_at: new Date().toISOString(),
        })
        .eq('id', userData.id)
        .select('*')
        .single();

      if (error) {
        setError('Erro ao salvar aceitação dos termos. Tente novamente.');
        setLoading(false);
        return;
      }

      if (data) {
        // Atualiza a sessão com os dados atualizados
        setSessionUser(data);
        setShowPoliciesModal(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao salvar aceitação dos termos. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8 animate-fade-in">
          <img src={sigatraderLogo} alt="COPYBETPRO" className="h-10 mx-auto mb-4" />
          <h1 className="h2 mb-3">Bem-vindo de volta</h1>
          <p className="text-text-muted">Entre com suas credenciais para acessar o painel</p>
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

            <button 
              type="submit"
              disabled={loading} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <p className="text-text-muted text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Modal de Políticas - Obrigatório */}
        <PoliciesModal
          isOpen={showPoliciesModal}
          onAccept={handleAcceptPolicies}
          onClose={undefined}
          canClose={false}
          loading={loading}
        />

        {/* Informação adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-dark">
            Ao fazer login, você concorda com nossos Termos de Serviço
          </p>
        </div>
      </div>
    </div>
  );
}
