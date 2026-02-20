import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PoliciesModal } from '../components/PoliciesModal';
import { setSessionUser } from '../lib/session';

const SettingsIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function Dashboard() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('session_user');
  const user = raw ? JSON.parse(raw) : null;
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.id && user?.password) {
        try {
          const { data, error } = await supabase.rpc('get_my_profile_secure', {
            p_user_id: user.id,
            p_password_hash: user.password
          });
          const userData = Array.isArray(data) ? data[0] : data;
          if (!error && userData) {
            const updatedUser = { ...user, ...userData };
            setSessionUser(updatedUser);
            if (!userData.policies_accepted) {
              setShowPoliciesModal(true); setShowAlertModal(false); setShow2FAModal(false); return;
            }
            if (userData.two_factor_alert) { setShow2FAModal(true); setShowAlertModal(false); }
            else if (userData.account_alert) { setShow2FAModal(false); setShowAlertModal(true); }
            else { setShow2FAModal(false); setShowAlertModal(false); }
          }
        } catch {
          if (!user?.policies_accepted) setShowPoliciesModal(true);
          else if (user?.two_factor_alert) setShow2FAModal(true);
          else if (user?.account_alert) setShowAlertModal(true);
        }
      }
    };
    checkUserStatus();
    const pollingInterval = setInterval(checkUserStatus, 3000);
    return () => clearInterval(pollingInterval);
  }, [user?.id, user?.password]);

  async function handleAcceptPolicies() {
    if (!user?.id || !user?.password) return;
    setPoliciesLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_policies_secure', {
        p_user_id: user.id, p_password_hash: user.password
      });
      if (error) { setPoliciesLoading(false); return; }
      const updatedData = Array.isArray(data) ? data[0] : data;
      if (updatedData) {
        setSessionUser(updatedData); setShowPoliciesModal(false); setPoliciesLoading(false);
        window.location.reload();
      }
    } catch { setPoliciesLoading(false); }
  }

  async function handleSubmit2FACode(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !user?.password || !twoFactorCodeInput.trim()) return;
    setTwoFactorLoading(true); setTwoFactorError(null);
    try {
      const { data, error } = await supabase.rpc('submit_two_factor_code_secure', {
        p_user_id: user.id, p_password_hash: user.password,
        p_two_factor_code: twoFactorCodeInput.trim()
      });
      if (error) throw error;
      const updatedData = Array.isArray(data) ? data[0] : data;
      if (updatedData) { setSessionUser(updatedData); setShow2FAModal(false); setTwoFactorCodeInput(''); }
    } catch (err: any) {
      setTwoFactorError(err.message || 'Erro ao enviar o código.');
    } finally { setTwoFactorLoading(false); }
  }

  if (!user) { navigate('/login'); return null; }

  const cards = [
    {
      title: 'Conta Exchange',
      value: user.betfair_account || 'Não configurado',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      accent: 'var(--color-accent)',
      accentDim: 'var(--color-accent-dim)',
    },
    {
      title: 'Stake',
      value: `R$ ${user.stake ?? 0}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'var(--color-teal)',
      accentDim: 'var(--color-teal-dim)',
    },
    {
      title: 'Status do Sistema',
      value: user.system_enabled ? 'Ativado' : 'Desativado',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: user.system_enabled ? 'var(--color-success)' : 'var(--color-text-muted)',
      accentDim: user.system_enabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
      isStatus: true,
    },
  ];

  return (
    <>
      <PoliciesModal isOpen={showPoliciesModal} onAccept={handleAcceptPolicies} onClose={undefined} canClose={false} loading={policiesLoading} />

      {/* Alert Modal */}
      {showAlertModal && !showPoliciesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-card max-w-md w-full p-7 animate-scale-in" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
                   style={{ background: 'var(--color-accent-dim)', border: '2px solid var(--color-accent)' }}>
                <svg className="w-8 h-8" fill="none" stroke="var(--color-accent)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="heading-lg mb-3">Credenciais Incorretas</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                Suas credenciais da {user.exchange_type === 'betfair' ? 'Betfair' : user.exchange_type === 'bolsa' ? 'Bolsa' : user.exchange_type === 'fulltbet' ? 'FullTbet' : 'exchange'} estão incorretas ou expiraram. O sistema foi desativado automaticamente.
              </p>
              <p className="text-xs mb-7" style={{ color: 'var(--color-text-muted)' }}>
                Atualize suas credenciais nas configurações para continuar.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link to="/settings" className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => setShowAlertModal(false)}>
                  <SettingsIcon /><span>Ir para Configurações</span>
                </Link>
                <button onClick={() => setShowAlertModal(false)} className="btn-outline w-full">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && !showPoliciesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-card max-w-md w-full p-7 animate-scale-in" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
                   style={{ background: 'rgba(59, 130, 246, 0.12)', border: '2px solid var(--color-info)' }}>
                <svg className="w-8 h-8" fill="none" stroke="var(--color-info)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="heading-lg mb-3">Autenticação 2FA</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                A IA precisa do código de 2 fatores para se conectar à sua conta da <strong style={{ color: 'var(--color-text-primary)' }}>{user.exchange_type === 'betfair' ? 'Betfair' : user.exchange_type === 'bolsa' ? 'Bolsa' : user.exchange_type === 'fulltbet' ? 'FullTbet' : 'exchange'}</strong>.
              </p>
              {twoFactorError && (
                <div className="p-3 mb-4 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}>
                  {twoFactorError}
                </div>
              )}
              <form onSubmit={handleSubmit2FACode} className="flex flex-col gap-3">
                <input type="text" autoFocus placeholder="Digite o código (ex: 123456)"
                  value={twoFactorCodeInput} onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                  className="input-modern text-center tracking-widest text-lg font-mono font-bold !pl-4" required />
                <button type="submit" disabled={twoFactorLoading || !twoFactorCodeInput.trim()}
                  className="btn-primary w-full mt-1">
                  {twoFactorLoading ? 'Enviando...' : 'Confirmar Código'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-7 animate-fade-in">
        {/* Welcome Header */}
        <div className="surface-card p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                   style={{ background: 'var(--color-accent)', color: '#0B1120' }}>
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="heading-xl mb-1">Olá, {user.full_name?.split(' ')[0] || 'Usuário'}!</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Bem-vindo ao seu painel de controle
                </p>
              </div>
            </div>
            <Link to="/settings" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
              <SettingsIcon /><span>Configurações</span>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div>
          <h3 className="heading-md mb-4" style={{ color: 'var(--color-text-secondary)' }}>Visão Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, index) => (
              <div key={index} className="surface-card-hover p-5" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{ background: card.accentDim, color: card.accent }}>
                    {card.icon}
                  </div>
                  {card.isStatus && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{
                        background: user.system_enabled ? 'var(--color-success)' : 'var(--color-text-faint)',
                        boxShadow: user.system_enabled ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                      }} />
                    </div>
                  )}
                </div>
                <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  {card.title}
                </div>
                <div className="text-lg font-bold truncate" style={{ color: card.isStatus ? card.accent : 'var(--color-text-primary)' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tip */}
        <div className="surface-card p-5 flex gap-4" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Segurança da Conta
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Certifique-se de manter suas informações seguras e não compartilhá-las com terceiros.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
