import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { PoliciesModal } from '../components/PoliciesModal';
import { setSessionUser } from '../lib/session';
import { extractBrazilPhoneDigits, formatBrazilPhoneDisplay, formatBrazilPhoneForStorage, sanitizeBrazilPhoneInput } from '../utils/phone';

const PhoneIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const KeyIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);
const ExchangeIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

export function Settings() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('session_user');
  const user = raw ? JSON.parse(raw) : null;
  const initialPhoneDigits = extractBrazilPhoneDigits(user?.phone);
  const [form, setForm] = useState({
    phone: initialPhoneDigits,
    exchange_type: user?.exchange_type || 'betfair',
    betfair_account: user?.betfair_account || '',
    betfair_password: user?.betfair_password || '',
    two_factor_code: user?.two_factor_code || '',
    banca: user?.banca ?? 0,
    stake: user?.stake ?? 0,
    stop_win: user?.stop_win ?? 0,
    stop_loss: user?.stop_loss ?? 0,
    system_enabled: Boolean(user?.system_enabled) || false,
    account_alert: Boolean(user?.account_alert) || false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Push notifications state
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
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

  // Sync PWA and Push status on mount/load
  useEffect(() => {
    if (user?.id) {
      const syncStatus = async () => {
        try {
          const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
          const isPush = typeof Notification !== 'undefined' && Notification.permission === 'granted';
          
          await supabase.from('users').update({
            pwa_installed: isPWA,
            push_notifications_enabled: isPush
          }).eq('id', user.id);
        } catch (err) {
          console.error('Error syncing status in settings:', err);
        }
      };
      
      // Delay slightly
      const timer = setTimeout(syncStatus, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);


  const handleTogglePush = async () => {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      const { subscribeToPush, unsubscribeFromPush } = await import('../utils/pwa');
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        setPushStatus(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
        if (user?.id) {
          await supabase.from('users').update({ push_notifications_enabled: false }).eq('id', user.id);
        }
      } else {
        await subscribeToPush(user?.id || null);
        setIsSubscribed(true);
        setPushStatus(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
        if (user?.id) {
          await supabase.from('users').update({ push_notifications_enabled: true }).eq('id', user.id);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao configurar notificações.');
    } finally {
      setPushLoading(false);
    }
  };

  const [bancaValue, setBancaValue] = useState(user?.banca?.toString() || '');
  const [stakeValue, setStakeValue] = useState(user?.stake?.toString() || '');
  const [stopWinValue, setStopWinValue] = useState(user?.stop_win?.toString() || '');
  const [stopLossValue, setStopLossValue] = useState(user?.stop_loss?.toString() || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  useEffect(() => {
    const checkPolicies = async () => {
      if (user?.id && user?.password) {
        try {
          const { data, error } = await supabase.rpc('get_my_profile_secure', { p_user_id: user.id, p_password_hash: user.password });
          const userData = Array.isArray(data) ? data[0] : data;
          if (!error && userData && !userData.policies_accepted) setShowPoliciesModal(true);
        } catch {
          if (!user?.policies_accepted) setShowPoliciesModal(true);
        }
      }
    };
    checkPolicies();
  }, [user?.id, user?.password, user?.policies_accepted]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Faça login para acessar as configurações.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">Fazer Login</Link>
        </div>
      </div>
    );
  }

  async function handleAcceptPolicies() {
    if (!user?.id || !user?.password) return;
    setPoliciesLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_policies_secure', { p_user_id: user.id, p_password_hash: user.password });
      if (error) { setPoliciesLoading(false); return; }
      const updatedData = Array.isArray(data) ? data[0] : data;
      if (updatedData) { setSessionUser(updatedData); setShowPoliciesModal(false); setPoliciesLoading(false); window.location.reload(); }
    } catch { setPoliciesLoading(false); }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (form.phone.length !== 11) { setMessage({ type: 'error', text: 'Informe um telefone válido com DDD e 9 dígitos.' }); return; }
    if (form.stake < 5) { setMessage({ type: 'error', text: 'O valor do stake deve ser de no mínimo R$ 5,00.' }); return; }
    setLoading(true);
    let newAccountAlert = form.account_alert;
    if (user?.account_alert && (form.betfair_account !== user.betfair_account || form.betfair_password !== user.betfair_password)) {
      newAccountAlert = false;
    }
    const { data, error } = await supabase.rpc('update_user_profile_secure', {
      p_user_id: user.id, p_password_hash: user.password,
      p_phone: form.phone ? formatBrazilPhoneForStorage(form.phone) : null,
      p_exchange_type: form.exchange_type, p_betfair_account: form.betfair_account,
      p_betfair_password: form.betfair_password, p_stake: form.stake,
      p_system_enabled: form.system_enabled, p_account_alert: newAccountAlert,
      p_two_factor_code: form.two_factor_code,
      p_banca: form.banca,
      p_stop_win: form.stop_win,
      p_stop_loss: form.stop_loss
    });
    setLoading(false);
    const updatedData = Array.isArray(data) ? data[0] : data;
    if (error) { setMessage({ type: 'error', text: error.message }); }
    else if (updatedData) {
      // Tenta limpar os alertas diretamente se a RLS permitir
      try {
        await supabase.from('users').update({
          betfair_warning_alert: false,
          banca_warning_alert: false
        }).eq('id', user.id);
      } catch (e) {
        // Ignora erro se RLS não permitir
      }

      sessionStorage.setItem('session_user', JSON.stringify(updatedData));
      setForm({
        phone: extractBrazilPhoneDigits(updatedData.phone), exchange_type: updatedData.exchange_type || 'betfair',
        betfair_account: updatedData.betfair_account || '', betfair_password: updatedData.betfair_password || '',
        two_factor_code: updatedData.two_factor_code || '', banca: updatedData.banca ?? 0, stake: updatedData.stake ?? 0,
        stop_win: updatedData.stop_win ?? 0, stop_loss: updatedData.stop_loss ?? 0,
        system_enabled: Boolean(updatedData.system_enabled) || false,
        account_alert: Boolean(updatedData.account_alert) || false,
      });
      setBancaValue(updatedData.banca?.toString() || '');
      setStakeValue(updatedData.stake?.toString() || '');
      setStopWinValue(updatedData.stop_win?.toString() || '');
      setStopLossValue(updatedData.stop_loss?.toString() || '');
      
      sessionStorage.setItem('dismissed_account_alert', 'true');
      sessionStorage.setItem('dismissed_betfair_alert', 'true');
      sessionStorage.setItem('dismissed_banca_alert', 'true');
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 5000);
    }
  }

  const exchangeName = form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : form.exchange_type === 'betbra' ? 'Betbra' : 'FullTbet';

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl mb-1">Configurações</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Gerencie suas informações e preferências</p>
        </div>
        <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden md:inline">Voltar</span>
        </Link>
      </div>

      {/* Feedback Message */}
      {message && (
        <div className="p-4 rounded-lg flex items-start gap-3 animate-slide-down text-sm" style={{
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={message.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* System Status */}
        {(() => {
          const hasCredentials = !!(form.betfair_account && form.betfair_password);
          return (
            <div className="surface-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                  background: form.system_enabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                  color: form.system_enabled ? 'var(--color-success)' : 'var(--color-text-muted)'
                }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-md text-base">Status do Sistema</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ative ou desative o sistema de automação</p>
                </div>
              </div>
              <label className={`flex items-center justify-between p-4 rounded-lg transition-all duration-150 ${!hasCredentials ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                     style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-light)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-6 rounded-full relative transition-all duration-300"
                       style={{ background: (form.system_enabled && hasCredentials) ? 'var(--color-success)' : 'var(--color-text-faint)' }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
                         style={{ left: (form.system_enabled && hasCredentials) ? '24px' : '4px' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: (form.system_enabled && hasCredentials) ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {form.system_enabled && hasCredentials ? 'Sistema Ativado' : 'Sistema Desativado'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                      {form.system_enabled && hasCredentials ? 'Operacional' : 'Pausado'}
                    </div>
                  </div>
                </div>
                <input type="checkbox" className="sr-only" 
                  checked={form.system_enabled && hasCredentials}
                  disabled={!hasCredentials}
                  onChange={(e) => setForm({ ...form, system_enabled: e.target.checked })} />
              </label>
              {!hasCredentials && (
                <p className="text-[10px] mt-3 font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-error)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Configure suas credenciais da Exchange abaixo para ativar o sistema.
                </p>
              )}
            </div>
          );
        })()}

        {/* Personal Info */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              <UserIcon />
            </div>
            <div>
              <h3 className="heading-md text-base">Informações Pessoais</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Atualize suas informações de contato</p>
            </div>
          </div>
          <div className="max-w-md">
            <label className="label-modern">Telefone</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}><PhoneIcon /></div>
              <input type="tel" inputMode="numeric" className="input-modern" placeholder="+55 (00) 00000-0000"
                value={formatBrazilPhoneDisplay(form.phone)}
                onChange={(e) => { const digits = sanitizeBrazilPhoneInput(e.target.value); setForm({ ...form, phone: digits }); }} />
            </div>
          </div>
        </div>

        {/* Push Notifications Settings */}
        {pushStatus !== 'unsupported' && (
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                background: isSubscribed ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                color: isSubscribed ? 'var(--color-accent)' : 'var(--color-text-muted)'
              }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="heading-md text-base">Notificações no Dispositivo</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gerencie os alertas enviados pelo administrador</p>
              </div>
            </div>
            <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer"
                   style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-light)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-6 rounded-full relative transition-all duration-300"
                     style={{ background: isSubscribed ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
                       style={{ left: isSubscribed ? '24px' : '4px' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: isSubscribed ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    {isSubscribed ? 'Alertas Ativados' : 'Alertas Desativados'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    {pushStatus === 'denied' ? 'Permissão bloqueada no navegador' : (isSubscribed ? 'Recebendo notificações push' : 'Toque para ativar')}
                  </div>
                </div>
              </div>
              <input type="checkbox" className="sr-only" 
                checked={isSubscribed}
                disabled={pushLoading || pushStatus === 'denied'}
                onChange={handleTogglePush} />
            </label>
          </div>
        )}

        {/* Exchange Type */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-info)' }}>
              <ExchangeIcon />
            </div>
            <div>
              <h3 className="heading-md text-base">Tipo de Exchange</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Selecione a plataforma que você utiliza</p>
            </div>
          </div>
          <div className="max-w-md">
            <label className="label-modern">Exchange</label>
            <select className="input-modern" value={form.exchange_type} onChange={(e) => setForm({ ...form, exchange_type: e.target.value })}>
              <option value="betfair">Betfair</option>
              <option value="bolsa">Bolsa</option>
              <option value="fulltbet">FullTbet</option>
              <option value="betbra">Betbra</option>
            </select>
          </div>
        </div>

        {/* Exchange Credentials */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              <KeyIcon />
            </div>
            <div>
              <h3 className="heading-md text-base">Credenciais da Exchange</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Acesso à {exchangeName}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-modern">Conta {exchangeName}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}><UserIcon /></div>
                <input type="text" className="input-modern" placeholder={`Seu usuário ${exchangeName}`}
                  value={form.betfair_account} onChange={(e) => setForm({ ...form, betfair_account: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-modern">Senha {exchangeName}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}><KeyIcon /></div>
                <input type={showPassword ? "text" : "password"} className="input-modern pr-12" placeholder={`Senha da ${exchangeName}`}
                  value={form.betfair_password} onChange={(e) => setForm({ ...form, betfair_password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-text-faint)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-faint)'; }}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label-modern">2FA (se houver)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}><KeyIcon /></div>
                <input type="text" className="input-modern" placeholder="Código de 2 fatores"
                  value={form.two_factor_code} onChange={(e) => setForm({ ...form, two_factor_code: e.target.value })} />
              </div>
              <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-accent)' }}>
                Fique atento — às vezes a IA precisa dos 2 fatores para conectar na conta.
              </p>
            </div>
          </div>
        </div>

        {/* Banca */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-info)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="heading-md text-base">Banca</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Valor total da sua banca de investimento</p>
            </div>
          </div>
          <div className="max-w-md">
            <label className="label-modern">Banca (R$)</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--color-text-faint)' }}>R$</div>
              <input type="number" step="0.01" min="0" className="input-modern" placeholder="0.00"
                value={bancaValue}
                onChange={(e) => { setBancaValue(e.target.value); setForm({ ...form, banca: Number(e.target.value) || 0 }); }}
                onFocus={(e) => { if (e.target.value === '0') setBancaValue(''); }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Informe o valor total que você tem disponível para apostar
            </p>
          </div>
        </div>

        {/* Stake */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-teal-dim)', color: 'var(--color-teal)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="heading-md text-base">Stake</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Valor padrão das suas apostas</p>
            </div>
          </div>
          <div className="max-w-md">
            <label className="label-modern">Stake (R$) <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--color-text-faint)' }}>R$</div>
              <input type="number" step="0.01" min="5.00" className="input-modern" placeholder="0.00"
                value={stakeValue}
                onChange={(e) => { setStakeValue(e.target.value); setForm({ ...form, stake: Number(e.target.value) || 0 }); }}
                onFocus={(e) => { if (e.target.value === '0') setStakeValue(''); }}
                required />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: 'var(--color-error)' }}>* Obrigatório</span> — Mínimo R$ 5,00
            </p>
          </div>
        </div>

        {/* Stop Win / Stop Loss */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="heading-md text-base">Gerenciamento de Risco</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Defina limites de ganho e perda diários</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-modern">Stop Win (R$)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-success)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <input type="number" step="0.01" min="0" className="input-modern" placeholder="0.00"
                  value={stopWinValue}
                  onChange={(e) => { setStopWinValue(e.target.value); setForm({ ...form, stop_win: Number(e.target.value) || 0 }); }}
                  onFocus={(e) => { if (e.target.value === '0') setStopWinValue(''); }} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Sistema pausa ao atingir esse lucro no dia
              </p>
            </div>
            <div>
              <label className="label-modern">Stop Loss (R$)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-accent)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <input type="number" step="0.01" min="0" className="input-modern" placeholder="0.00"
                  value={stopLossValue}
                  onChange={(e) => { setStopLossValue(e.target.value); setForm({ ...form, stop_loss: Number(e.target.value) || 0 }); }}
                  onFocus={(e) => { if (e.target.value === '0') setStopLossValue(''); }} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Sistema pausa ao atingir esse prejuízo no dia
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2.5" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'var(--color-success)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Deixe <strong style={{ color: 'var(--color-text-primary)' }}>0</strong> para desativar o limite. Quando atingido, o sistema pausa automaticamente até o próximo dia.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 mb-10">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
          <Link to="/dashboard" className="btn-outline">Cancelar</Link>
        </div>
        
        {/* Logout */}
        <div className="border-t pt-8" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('session_user');
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair da Conta</span>
          </button>
        </div>
      </form>

      <PoliciesModal isOpen={showPoliciesModal} onAccept={handleAcceptPolicies} onClose={undefined} canClose={false} loading={policiesLoading} />
    </div>
  );
}
