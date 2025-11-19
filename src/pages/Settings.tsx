import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { PoliciesModal } from '../components/PoliciesModal';
import { setSessionUser } from '../lib/session';
import { extractBrazilPhoneDigits, formatBrazilPhoneDisplay, formatBrazilPhoneForStorage, sanitizeBrazilPhoneInput } from '../utils/phone';

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ExchangeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
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

  // Verifica se o usuário aceitou as políticas
  useEffect(() => {
    const checkPolicies = async () => {
      if (user?.id) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('policies_accepted')
            .eq('id', user.id)
            .single();

          if (!error && userData && !userData.policies_accepted) {
            setShowPoliciesModal(true);
          }
        } catch (err) {
          console.error('Erro ao verificar políticas:', err);
          // Fallback: verifica dados da sessão
          if (!user?.policies_accepted) {
            setShowPoliciesModal(true);
          }
        }
      }
    };

    checkPolicies();
  }, [user?.id, user?.policies_accepted]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Faça login para acessar as configurações.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  // Handler para aceitar políticas
  async function handleAcceptPolicies() {
    if (!user?.id) return;

    setPoliciesLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          policies_accepted: true,
          policies_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao salvar aceitação dos termos:', error);
        setPoliciesLoading(false);
        return;
      }

      if (data) {
        setSessionUser(data);
        setShowPoliciesModal(false);
        setPoliciesLoading(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao salvar aceitação dos termos:', err);
      setPoliciesLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (form.phone.length !== 11) {
      setMessage({ type: 'error', text: 'Informe um telefone válido com DDD e 9 dígitos.' });
      return;
    }

    // Validação do stake
    if (form.stake <= 0) {
      setMessage({ type: 'error', text: 'O valor do stake deve ser maior que zero.' });
      return;
    }

    setLoading(true);
    
    // Se o usuário mudou a conta ou senha e tinha alerta, remove o alerta e pode reativar
    const updateData: any = {
      ...form,
      phone: form.phone ? formatBrazilPhoneForStorage(form.phone) : null,
    };
    if (user?.account_alert && (form.betfair_account !== user.betfair_account || form.betfair_password !== user.betfair_password)) {
      updateData.account_alert = false;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data) {
      sessionStorage.setItem('session_user', JSON.stringify(data));
      setForm({
        phone: extractBrazilPhoneDigits(data.phone),
        exchange_type: data.exchange_type || 'betfair',
        betfair_account: data.betfair_account || '',
        betfair_password: data.betfair_password || '',
        stake: data.stake ?? 0,
        system_enabled: Boolean(data.system_enabled) || false,
        account_alert: Boolean(data.account_alert) || false,
      });
      setStakeValue(data.stake?.toString() || '');
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 5000);
      
      // O sistema em tempo real do Supabase já vai notificar automaticamente
      // Não precisamos mais de eventos customizados
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2 mb-2">Configurações</h1>
          <p className="text-text-muted">Gerencie suas informações e preferências</p>
        </div>
        <Link 
          to="/dashboard" 
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon />
          <span className="hidden md:inline">Voltar</span>
        </Link>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-success/10 border-success/30 text-success' 
            : 'bg-error/10 border-error/30 text-error'
        }`}>
          {message.type === 'success' ? <CheckCircleIcon /> : <ExclamationIcon />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Informações Pessoais</h3>
              <p className="text-sm text-gray-400">Atualize suas informações de contato</p>
            </div>
          </div>

          <div className="max-w-md">
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
              />
            </div>
          </div>
        </div>

        {/* Seleção de Exchange */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ExchangeIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Tipo de Exchange</h3>
              <p className="text-sm text-gray-400">Selecione a plataforma que você utiliza</p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="label-modern">Exchange</label>
            <div className="relative">
              <select
                className="input-modern"
                value={form.exchange_type}
                onChange={(e) => setForm({ ...form, exchange_type: e.target.value })}
              >
                <option value="betfair">Betfair</option>
                <option value="bolsa">Bolsa</option>
                <option value="fulltbet">FullTbet</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Selecione a plataforma de apostas que você utiliza
            </p>
          </div>
        </div>

        {/* Credenciais da Exchange */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <KeyIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Credenciais da Exchange</h3>
              <p className="text-sm text-gray-400">Configure suas informações de acesso à {form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : 'FullTbet'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-modern">Conta {form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : 'FullTbet'}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon />
                </div>
                <input 
                  type="text"
                  className="input-modern"
                  placeholder={`Seu usuário ${form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : 'FullTbet'}`}
                  value={form.betfair_account}
                  onChange={(e) => setForm({ ...form, betfair_account: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label-modern">Senha da conta {form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : 'FullTbet'}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <KeyIcon />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="input-modern pr-12"
                  placeholder={`Senha da ${form.exchange_type === 'betfair' ? 'Betfair' : form.exchange_type === 'bolsa' ? 'Bolsa' : 'FullTbet'}`}
                  value={form.betfair_password}
                  onChange={(e) => setForm({ ...form, betfair_password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Stake */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
              <CurrencyIcon />
            </div>
            <div>
              <h3 className="font-semibold text-white">Configurações de Stake</h3>
              <p className="text-sm text-gray-400">Defina o valor padrão das suas apostas</p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="label-modern">
              Stake (R$) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                R$
              </div>
              <input 
                type="number"
                step="0.01"
                min="0.01"
                className="input-modern"
                placeholder="Valor mínimo: R$ 0,01"
                value={stakeValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setStakeValue(value);
                  setForm({ ...form, stake: Number(value) || 0 });
                }}
                onFocus={(e) => {
                  // Remove o 0 quando o campo receber foco e estiver vazio
                  if (e.target.value === '0') {
                    setStakeValue('');
                  }
                }}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-red-400">* Obrigatório</span> - Valor que será usado como padrão para suas apostas (mínimo R$ 0,01)
            </p>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              form.system_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Status do Sistema</h3>
              <p className="text-sm text-gray-400">Ative ou desative o sistema de apostas</p>
            </div>
          </div>

          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                form.system_enabled ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${
                  form.system_enabled ? 'left-7' : 'left-1'
                }`} />
              </div>
              <div>
                <div className={`font-medium transition-colors ${
                  form.system_enabled ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {form.system_enabled ? 'Sistema Ativado' : 'Sistema Desativado'}
                </div>
                <div className="text-xs text-gray-400">
                  {form.system_enabled ? 'O sistema está operacional' : 'O sistema está pausado'}
                </div>
              </div>
            </div>
            <input 
              type="checkbox" 
              className="sr-only"
              checked={form.system_enabled} 
              onChange={(e) => setForm({ ...form, system_enabled: e.target.checked })} 
            />
          </label>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-4">
          <button 
            type="submit"
            disabled={loading} 
            className="btn-primary flex items-center gap-2"
          >
            <SaveIcon />
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
          <Link 
            to="/dashboard" 
            className="btn-outline"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Modal de Políticas - Obrigatório */}
      <PoliciesModal
        isOpen={showPoliciesModal}
        onAccept={handleAcceptPolicies}
        onClose={undefined}
        canClose={false}
        loading={policiesLoading}
      />
    </div>
  );
}
