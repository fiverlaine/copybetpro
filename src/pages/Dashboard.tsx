import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PoliciesModal } from '../components/PoliciesModal';
import { setSessionUser } from '../lib/session';
import { PWAPrompt } from '../components/PWAPrompt';

interface PlatformStats {
  total_profit: number;
  last_24h: number;
  total_bets: number;
  active_traders: number;
  total_volume: number;
  avg_roi: number;
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNum(v: number) {
  return v.toLocaleString('pt-BR');
}

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
  const [showBetfairWarning, setShowBetfairWarning] = useState(false);
  const [showBancaWarning, setShowBancaWarning] = useState(false);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  // Push notifications state
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }
    
    setPushStatus(Notification.permission);
    
    // Check if subscription exists
    import('../utils/pwa').then(({ getSubscription }) => {
      getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    }).catch(err => console.error('Error loading PWA utils:', err));
  }, []);

  const handleTogglePush = async () => {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      const { subscribeToPush, unsubscribeFromPush } = await import('../utils/pwa');
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        setPushStatus(Notification.permission);
      } else {
        await subscribeToPush(user?.id || null);
        setIsSubscribed(true);
        setPushStatus(Notification.permission);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao configurar notificações.');
    } finally {
      setPushLoading(false);
    }
  };


  // Fetch stats from backend RPC (server calculates — identical for all users)
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (!error && data) setStats(data as PlatformStats);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 60000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  // Polling user status (alerts, policies, 2FA)
  const checkUserStatus = useCallback(async () => {
    if (!user?.id || !user?.password) return;
    try {
      const { data, error } = await supabase.rpc('get_my_profile_secure', {
        p_user_id: user.id, p_password_hash: user.password,
      });
      const d = Array.isArray(data) ? data[0] : data;
      if (!error && d) {
        setSessionUser({ ...user, ...d });
        if (!d.policies_accepted) { 
          setShowPoliciesModal(true); setShowAlertModal(false); setShow2FAModal(false); setShowBetfairWarning(false); setShowBancaWarning(false); 
          return; 
        }
        
        if (!d.account_alert) sessionStorage.removeItem('dismissed_account_alert');
        if (!d.betfair_warning_alert) sessionStorage.removeItem('dismissed_betfair_alert');
        if (!d.banca_warning_alert) sessionStorage.removeItem('dismissed_banca_alert');

        const isAccountDismissed = sessionStorage.getItem('dismissed_account_alert') === 'true';
        const isBetfairDismissed = sessionStorage.getItem('dismissed_betfair_alert') === 'true';
        const isBancaDismissed = sessionStorage.getItem('dismissed_banca_alert') === 'true';

        setShow2FAModal(!!d.two_factor_alert);
        setShowAlertModal(!!d.account_alert && !d.two_factor_alert && !isAccountDismissed);
        setShowBetfairWarning(!!d.betfair_warning_alert && !d.account_alert && !d.two_factor_alert && !isBetfairDismissed);
        setShowBancaWarning(!!d.banca_warning_alert && !d.betfair_warning_alert && !d.account_alert && !d.two_factor_alert && !isBancaDismissed);
      }
    } catch {
      const isAccountDismissed = sessionStorage.getItem('dismissed_account_alert') === 'true';
      const isBetfairDismissed = sessionStorage.getItem('dismissed_betfair_alert') === 'true';
      const isBancaDismissed = sessionStorage.getItem('dismissed_banca_alert') === 'true';

      if (!user?.policies_accepted) setShowPoliciesModal(true);
      else if (user?.two_factor_alert) setShow2FAModal(true);
      else if (user?.account_alert && !isAccountDismissed) setShowAlertModal(true);
      else if (user?.betfair_warning_alert && !isBetfairDismissed) setShowBetfairWarning(true);
      else if (user?.banca_warning_alert && !isBancaDismissed) setShowBancaWarning(true);
    }
  }, [user?.id, user?.password]);

  useEffect(() => {
    checkUserStatus();
    const iv = setInterval(checkUserStatus, 3000);
    return () => clearInterval(iv);
  }, [checkUserStatus]);

  async function handleAcceptPolicies() {
    if (!user?.id || !user?.password) return;
    setPoliciesLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_policies_secure', { p_user_id: user.id, p_password_hash: user.password });
      if (error) { setPoliciesLoading(false); return; }
      const d = Array.isArray(data) ? data[0] : data;
      if (d) { setSessionUser(d); setShowPoliciesModal(false); setPoliciesLoading(false); window.location.reload(); }
    } catch { setPoliciesLoading(false); }
  }

  async function handleSubmit2FACode(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !user?.password || !twoFactorCodeInput.trim()) return;
    setTwoFactorLoading(true); setTwoFactorError(null);
    try {
      const { data, error } = await supabase.rpc('submit_two_factor_code_secure', {
        p_user_id: user.id, p_password_hash: user.password, p_two_factor_code: twoFactorCodeInput.trim(),
      });
      if (error) throw error;
      const d = Array.isArray(data) ? data[0] : data;
      if (d) { setSessionUser(d); setShow2FAModal(false); setTwoFactorCodeInput(''); }
    } catch (err: any) { setTwoFactorError(err.message || 'Erro ao enviar o código.'); }
    finally { setTwoFactorLoading(false); }
  }

  if (!user) { navigate('/login'); return null; }

  const exchangeLabel = user.exchange_type === 'betfair' ? 'Betfair' : user.exchange_type === 'bolsa' ? 'Bolsa' : user.exchange_type === 'fulltbet' ? 'FullTbet' : 'exchange';

  return (
    <>
      <PoliciesModal isOpen={showPoliciesModal} onAccept={handleAcceptPolicies} onClose={undefined} canClose={false} loading={policiesLoading} />
      <PWAPrompt userId={user?.id || null} onSubscribed={() => { setIsSubscribed(true); setPushStatus('granted'); }} />

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
                Suas credenciais da {exchangeLabel} estão incorretas ou expiraram. O sistema foi desativado automaticamente.
              </p>
              <p className="text-xs mb-7" style={{ color: 'var(--color-text-muted)' }}>Atualize suas credenciais nas configurações para continuar.</p>
              <div className="flex flex-col gap-2.5">
                <Link to="/settings" className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => {
                  sessionStorage.setItem('dismissed_account_alert', 'true');
                  setShowAlertModal(false);
                }}>
                  <SettingsIcon /><span>Ir para Configurações</span>
                </Link>
                <button onClick={() => {
                  sessionStorage.setItem('dismissed_account_alert', 'true');
                  setShowAlertModal(false);
                }} className="btn-outline w-full">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Betfair Warning Modal */}
      {showBetfairWarning && !showPoliciesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-card max-w-md w-full p-7 animate-scale-in" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
                   style={{ background: 'rgba(239, 68, 68, 0.12)', border: '2px solid var(--color-error)' }}>
                <svg className="w-8 h-8" fill="none" stroke="var(--color-error)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="heading-lg mb-3">Conta não configurada</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                Você ainda não configurou a sua conta da <strong style={{ color: 'var(--color-text-primary)' }}>{exchangeLabel}</strong>. O sistema precisa da sua conta conectada para funcionar.
              </p>
              <p className="text-xs mb-7 font-bold" style={{ color: 'var(--color-error)' }}>
                Aviso: A sua conta será excluída do sistema em 2 dias caso não configure, pois o sistema é limitado e precisa de usuários ativos.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link to="/settings" className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => {
                  sessionStorage.setItem('dismissed_betfair_alert', 'true');
                  setShowBetfairWarning(false);
                }}>
                  <SettingsIcon /><span>Configurar Agora</span>
                </Link>
                <button onClick={() => {
                  sessionStorage.setItem('dismissed_betfair_alert', 'true');
                  setShowBetfairWarning(false);
                }} className="btn-outline w-full">Entendi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banca Warning Modal */}
      {showBancaWarning && !showPoliciesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-card max-w-md w-full p-7 animate-scale-in" style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
                   style={{ background: 'rgba(249, 115, 22, 0.12)', border: '2px solid rgba(249, 115, 22, 1)' }}>
                <svg className="w-8 h-8" fill="none" stroke="rgba(249, 115, 22, 1)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="heading-lg mb-3">Banca Insuficiente</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                Verificamos que o saldo (banca) na sua conta da <strong style={{ color: 'var(--color-text-primary)' }}>{exchangeLabel}</strong> está abaixo do recomendado.
              </p>
              <p className="text-xs mb-7 font-bold" style={{ color: 'rgba(249, 115, 22, 1)' }}>
                O sistema precisa de pelo menos R$500 de banca para funcionar corretamente e operar com segurança.
              </p>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => {
                  sessionStorage.setItem('dismissed_banca_alert', 'true');
                  setShowBancaWarning(false);
                }} className="btn-primary w-full" style={{ background: 'rgba(249, 115, 22, 1)', color: 'white' }}>
                  Entendi
                </button>
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
                A IA precisa do código de 2 fatores para se conectar à sua conta da <strong style={{ color: 'var(--color-text-primary)' }}>{exchangeLabel}</strong>.
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
                <button type="submit" disabled={twoFactorLoading || !twoFactorCodeInput.trim()} className="btn-primary w-full mt-1">
                  {twoFactorLoading ? 'Enviando...' : 'Confirmar Código'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard Content ── */}
      <div className="space-y-7 animate-fade-in">
        {/* Welcome Header */}
        <div className="surface-card p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-14 h-14 rounded-xl flex-shrink-0 object-cover" 
                     style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-accent)' }} />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                     style={{ background: 'var(--color-accent)', color: '#0B1120' }}>
                  {(user.full_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h1 className="heading-xl mb-1">Olá, {user.full_name?.split(' ')[0] || 'Usuário'}!</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Bem-vindo ao seu painel de controle</p>
              </div>
            </div>
            <Link to="/settings" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
              <SettingsIcon /><span>Configurações</span>
            </Link>
          </div>
        </div>

        {/* PWA Push Notification Activation Card */}
        {pushStatus !== 'unsupported' && pushStatus !== 'denied' && !isSubscribed && localStorage.getItem('pwa_push_dismissed') === 'true' && (
          <div className="surface-card p-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="heading-md text-base text-amber-400 font-bold">Ativar Notificações Push</h3>
                <p className="text-sm text-gray-400 max-w-xl">
                  Fique por dentro! Receba alertas instantâneos de novas estratégias, mudanças de banca e avisos de credenciais diretamente na tela do seu dispositivo.
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePush}
              disabled={pushLoading}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap !py-2.5 !px-5 shadow-lg shadow-amber-500/10 cursor-pointer"
              style={{ background: 'var(--color-accent)', color: '#0B1120' }}
            >
              <span>{pushLoading ? 'Processando...' : 'Ativar Alertas'}</span>
            </button>
          </div>
        )}

        {/* ── LIVE IMPACT PANEL ── */}
        <div className="surface-card overflow-hidden" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3"
               style={{ background: 'rgba(16, 185, 129, 0.06)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Impacto dos Traders
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                 style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#EF4444' }}>Ao Vivo</span>
            </div>
          </div>

          {!stats ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                   style={{ borderColor: 'var(--color-success)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* Hero profit number */}
              <div className="px-6 pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                     style={{ background: 'var(--color-accent)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)' }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#0B1120" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  Os traders do CopyBetPro geraram
                </p>
                <div className="text-4xl md:text-5xl font-black tracking-tight mb-3 transition-all duration-500"
                     style={{ color: '#10B981', textShadow: '0 0 40px rgba(16, 185, 129, 0.3)', fontFamily: "'Satoshi', 'DM Sans', system-ui, monospace" }}>
                  {formatBRL(stats.total_profit)}
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  em lucro no sistema desde <strong style={{ color: 'var(--color-text-primary)' }}>Janeiro de 2026</strong>
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                     style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: '#10B981' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                    +{formatBRL(stats.last_24h)} nas últimas 24h
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-t" style={{ borderColor: 'rgba(16, 185, 129, 0.1)' }}>
                {[
                  { label: 'Apostas Executadas', value: formatNum(stats.total_bets), sub: 'Operações com lucro gerado', color: 'var(--color-accent)' },
                  { label: 'Traders Ativos', value: stats.active_traders.toString(), sub: 'Usuários operando agora', color: 'var(--color-info)' },
                  { label: 'Volume Movimentado', value: formatBRL(stats.total_volume), sub: 'Total apostado em operações', color: 'var(--color-teal)' },
                  { label: 'ROI Médio', value: `${stats.avg_roi.toFixed(2)}%`, sub: 'Retorno sobre o investimento', color: '#10B981' },
                ].map((card, i) => (
                  <div key={i} className="p-5 md:p-6 transition-colors"
                       style={{ borderRight: i < 3 ? '1px solid rgba(16, 185, 129, 0.08)' : undefined }}>
                    <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--color-text-faint)' }}>
                      {card.label}
                    </p>
                    <p className="text-xl md:text-2xl font-black mb-1 tracking-tight" style={{ color: card.color }}>
                      {card.value}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>{card.sub}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live indicator footer */}
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--color-text-faint)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Dados atualizados em tempo real • Atualização a cada 60 segundos</span>
        </div>
      </div>
    </>
  );
}
