import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
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
  const raw = sessionStorage.getItem('session_user');
  const user = raw ? JSON.parse(raw) : null;
  const initialPhoneDigits = extractBrazilPhoneDigits(user?.phone);
  const [form, setForm] = useState({
    phone: initialPhoneDigits,
    exchange_type: user?.exchange_type || 'betfair',
    betfair_account: user?.betfair_account || '',
    betfair_password: user?.betfair_password || '',
    two_factor_code: user?.two_factor_code || '',
    stake: user?.stake ?? 0,
    system_enabled: Boolean(user?.system_enabled) || false,
    account_alert: Boolean(user?.account_alert) || false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stakeValue, setStakeValue] = useState(user?.stake?.toString() || '');
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
    if (form.stake <= 0) { setMessage({ type: 'error', text: 'O valor do stake deve ser maior que zero.' }); return; }
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
      p_two_factor_code: form.two_factor_code
    });
    setLoading(false);
    const updatedData = Array.isArray(data) ? data[0] : data;
    if (error) { setMessage({ type: 'error', text: error.message }); }
    else if (updatedData) {
      sessionStorage.setItem('session_user', JSON.stringify(updatedData));
      setForm({
        phone: extractBrazilPhoneDigits(updatedData.phone), exchange_type: updatedData.exchange_type || 'betfair',
        betfair_account: updatedData.betfair_account || '', betfair_password: updatedData.betfair_password || '',
        two_factor_code: updatedData.two_factor_code || '', stake: updatedData.stake ?? 0,
        system_enabled: Boolean(updatedData.system_enabled) || false,
        account_alert: Boolean(updatedData.account_alert) || false,
      });
      setStakeValue(updatedData.stake?.toString() || '');
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
              <input type="number" step="0.01" min="0.01" className="input-modern" placeholder="0.00"
                value={stakeValue}
                onChange={(e) => { setStakeValue(e.target.value); setForm({ ...form, stake: Number(e.target.value) || 0 }); }}
                onFocus={(e) => { if (e.target.value === '0') setStakeValue(''); }}
                required />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ color: 'var(--color-error)' }}>* Obrigatório</span> — Mínimo R$ 0,01
            </p>
          </div>
        </div>

        {/* System Status */}
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
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ative ou desative o sistema</p>
            </div>
          </div>
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-150"
                 style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-light)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-6 rounded-full relative transition-all duration-300"
                   style={{ background: form.system_enabled ? 'var(--color-success)' : 'var(--color-text-faint)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
                     style={{ left: form.system_enabled ? '24px' : '4px' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: form.system_enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {form.system_enabled ? 'Sistema Ativado' : 'Sistema Desativado'}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                  {form.system_enabled ? 'Operacional' : 'Pausado'}
                </div>
              </div>
            </div>
            <input type="checkbox" className="sr-only" checked={form.system_enabled}
              onChange={(e) => setForm({ ...form, system_enabled: e.target.checked })} />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
          <Link to="/dashboard" className="btn-outline">Cancelar</Link>
        </div>
      </form>

      <PoliciesModal isOpen={showPoliciesModal} onAccept={handleAcceptPolicies} onClose={undefined} canClose={false} loading={policiesLoading} />
    </div>
  );
}
