import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getSessionUser, setSessionUser } from '../lib/session';

const MARKETS = [
  { id: 'futebol', label: 'Futebol', emoji: '⚽', desc: 'Ligas mundiais e campeonatos nacionais' },
  { id: 'basquete', label: 'Basquete', emoji: '🏀', desc: 'NBA, NBB, EuroLeague e mais' },
  { id: 'tenis', label: 'Tênis', emoji: '🎾', desc: 'ATP, WTA, Grand Slams' },
  { id: 'volei', label: 'Vôlei', emoji: '🏐', desc: 'Superliga, Liga das Nações' },
  { id: 'mma', label: 'MMA / UFC', emoji: '🥊', desc: 'UFC, Bellator, PFL' },
  { id: 'esports', label: 'E-Sports', emoji: '🎮', desc: 'CS2, LoL, Valorant, Dota 2' },
  { id: 'futebol_americano', label: 'Futebol Americano', emoji: '🏈', desc: 'NFL, NCAA' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾', desc: 'MLB, NPB' },
  { id: 'hockey', label: 'Hóquei', emoji: '🏒', desc: 'NHL, KHL' },
  { id: 'handball', label: 'Handebol', emoji: '🤾', desc: 'EHF, Liga Nacional' },
  { id: 'rugby', label: 'Rugby', emoji: '🏉', desc: 'Six Nations, Super Rugby' },
  { id: 'ciclismo', label: 'Ciclismo', emoji: '🚴', desc: 'Tour de France, Giro' },
];

export function Surebet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => getSessionUser());
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(user?.selected_markets || []);
  const [surebetEnabled, setSurebetEnabled] = useState<boolean>(Boolean(user?.surebet_enabled));
  const [togglingSystem, setTogglingSystem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handler = () => {
      const u = getSessionUser();
      setUser(u);
      if (u) {
        setSelectedMarkets(u.selected_markets || []);
        setSurebetEnabled(Boolean(u.surebet_enabled));
      }
    };
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  useEffect(() => {
    if (!getSessionUser()) navigate('/login');
  }, []);

  function toggleMarket(id: string) {
    setSelectedMarkets(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  }

  async function handleToggleSurebetSystem(enabled: boolean) {
    if (!user?.id) return;
    setSurebetEnabled(enabled);
    setTogglingSystem(true);
    try {
      const { data, error } = await supabase.rpc('update_user_preferences_secure', {
        p_user_id: user.id,
        p_password_hash: user.password,
        p_surebet_enabled: enabled
      });
      if (!error && data) {
        const updatedUser = Array.isArray(data) ? data[0] : data;
        if (updatedUser) {
          setSessionUser(updatedUser);
          setUser(updatedUser);
        }
      }
    } catch { /* silent */ }
    finally { setTogglingSystem(false); }
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_user_preferences_secure', {
        p_user_id: user.id,
        p_password_hash: user.password,
        p_surebet_enabled: surebetEnabled,
        p_selected_markets: selectedMarkets
      });
      
      if (error) {
        setNotification({ message: 'Erro ao salvar configurações', type: 'error' });
      } else {
        const updatedUser = Array.isArray(data) ? data[0] : data;
        if (updatedUser) {
          setSessionUser(updatedUser);
          setUser(updatedUser);
          setNotification({ message: 'Configurações salvas com sucesso!', type: 'success' });
        }
      }
    } catch {
      setNotification({ message: 'Erro ao salvar', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  }

  if (!user) return null;

  return (
    <>
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl animate-slide-down text-sm font-medium"
             style={{
               background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
               border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
               color: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
             }}>
          {notification.message}
        </div>
      )}

      <div className="space-y-7 animate-fade-in">
        {/* Header */}
        <div className="surface-card p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="heading-xl">Surebet</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Selecione os mercados e ative o scanner de arbitragem.
              </p>
            </div>
          </div>
        </div>

        {/* System Toggle */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
              background: surebetEnabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
              color: surebetEnabled ? 'var(--color-success)' : 'var(--color-text-muted)'
            }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="heading-md text-base">Sistema de Surebet</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ative ou desative o scanner de arbitragem</p>
            </div>
          </div>
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-150"
                 style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border-light)', opacity: togglingSystem ? 0.6 : 1 }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-6 rounded-full relative transition-all duration-300"
                   style={{ background: surebetEnabled ? 'var(--color-success)' : 'var(--color-text-faint)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
                     style={{ left: surebetEnabled ? '24px' : '4px' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: surebetEnabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {surebetEnabled ? 'Scanner Ativado' : 'Scanner Desativado'}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                  {surebetEnabled ? 'Buscando arbitragens nos mercados selecionados' : 'Pausado'}
                </div>
              </div>
            </div>
            <input type="checkbox" className="sr-only" checked={surebetEnabled}
              onChange={(e) => handleToggleSurebetSystem(e.target.checked)} />
          </label>
        </div>

        {/* Markets Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-md">Mercados Disponíveis</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
              {selectedMarkets.length} selecionado{selectedMarkets.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {MARKETS.map((market, index) => {
              const isSelected = selectedMarkets.includes(market.id);
              return (
                <button key={market.id} onClick={() => toggleMarket(market.id)}
                  className="surface-card-hover p-3.5 text-left transition-all duration-200 animate-fade-in relative"
                  style={{
                    animationDelay: `${index * 40}ms`,
                    borderColor: isSelected ? 'rgba(16, 185, 129, 0.4)' : undefined,
                    background: isSelected ? 'rgba(16, 185, 129, 0.04)' : undefined,
                  }}>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                         style={{ background: 'var(--color-success)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-xl mb-1.5">{market.emoji}</div>
                  <div className="text-xs font-bold mb-0.5">{market.label}</div>
                  <div className="text-[10px] leading-tight" style={{ color: 'var(--color-text-faint)' }}>{market.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="surface-card p-5 flex gap-4" style={{ borderLeft: '3px solid var(--color-success)' }}>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Como funciona?</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Selecione os mercados onde deseja buscar oportunidades de arbitragem. A IA monitora as odds
              em tempo real e executa apostas seguras automaticamente quando encontra discrepâncias lucrativas.
            </p>
          </div>
        </div>


        {/* Save Button */}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
