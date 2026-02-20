import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getSessionUser, setSessionUser } from '../lib/session';
import { StrategyHistoryModal } from '../components/StrategyHistoryModal';

interface Strategy {
  id: string;
  name: string;
  description: string;
  percentage: number | string;
  icon_type: string;
  color_gradient: string;
}

const TrendingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const FireIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const BarChartIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

function getStrategyIcon(iconType: string) {
  switch (iconType) {
    case 'trending': return TrendingIcon;
    case 'star': return StarIcon;
    case 'fire': return FireIcon;
    default: return TrendingIcon;
  }
}

// Map gradient to accent color
function getAccentColor(gradient: string): string {
  if (gradient.includes('green') || gradient.includes('emerald')) return 'var(--color-success)';
  if (gradient.includes('blue') || gradient.includes('cyan')) return 'var(--color-teal)';
  if (gradient.includes('purple') || gradient.includes('violet')) return '#8B5CF6';
  if (gradient.includes('red') || gradient.includes('rose')) return 'var(--color-error)';
  if (gradient.includes('orange') || gradient.includes('amber')) return 'var(--color-accent)';
  return 'var(--color-accent)';
}

export function Strategies() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => getSessionUser());
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [selectedStrategyName, setSelectedStrategyName] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copyingStrategyId, setCopyingStrategyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAccountRequiredModal, setShowAccountRequiredModal] = useState(false);

  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  useEffect(() => {
    const currentUser = getSessionUser();
    if (!currentUser) { navigate('/login'); return; }
    fetchStrategies();
  }, []);

  async function fetchStrategies() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('strategies').select('*').order('percentage', { ascending: false });
      if (error) { setNotification({ message: 'Erro ao carregar estratégias', type: 'error' }); return; }
      if (data) setStrategies(data);
    } catch { setNotification({ message: 'Erro ao carregar estratégias', type: 'error' }); }
    finally { setLoading(false); }
  }

  async function handleCopyStrategy(strategyId: string, strategyName: string) {
    if (!user?.id || !user?.password) return;
    if (!user.betfair_account || user.betfair_account.trim() === '') { setShowAccountRequiredModal(true); return; }
    setCopyingStrategyId(strategyId);
    try {
      const { data, error } = await supabase.rpc('update_user_strategy_secure', {
        p_user_id: user.id, p_password_hash: user.password, p_strategy_id: strategyId
      });
      if (error) { setNotification({ message: 'Erro ao ativar estratégia', type: 'error' }); return; }
      const updatedUser = Array.isArray(data) ? data[0] : data;
      if (updatedUser) {
        setSessionUser(updatedUser); setUser(updatedUser);
        setNotification({ message: `Estratégia "${strategyName}" ativada!`, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch { setNotification({ message: 'Erro ao ativar estratégia', type: 'error' }); }
    finally { setCopyingStrategyId(null); }
  }

  async function handleStopCopying() {
    if (!user?.id || !user?.password) return;
    try {
      const { data, error } = await supabase.rpc('update_user_strategy_secure', {
        p_user_id: user.id, p_password_hash: user.password, p_strategy_id: null
      });
      if (error) { setNotification({ message: 'Erro ao parar de copiar', type: 'error' }); return; }
      const updatedUser = Array.isArray(data) ? data[0] : data;
      if (updatedUser) {
        setSessionUser(updatedUser); setUser(updatedUser);
        setNotification({ message: 'Você parou de copiar a estratégia', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch { setNotification({ message: 'Erro ao parar de copiar', type: 'error' }); }
  }

  if (!user) return null;

  const activeStrategyId = user.selected_strategy;
  const activeStrategy = strategies.find(s => s.id === activeStrategyId);
  const hasAccountConfigured = user.betfair_account && user.betfair_account.trim() !== '';

  const topStrategies = strategies
    .filter(s => { const p = typeof s.percentage === 'string' ? parseFloat(s.percentage) : s.percentage; return p >= 80; })
    .sort((a, b) => {
      const pa = typeof a.percentage === 'string' ? parseFloat(a.percentage) : a.percentage;
      const pb = typeof b.percentage === 'string' ? parseFloat(b.percentage) : b.percentage;
      return pb - pa;
    }).slice(0, 3).map(s => s.id);

  function getRanking(strategyId: string): number | null {
    const idx = topStrategies.indexOf(strategyId);
    return idx !== -1 ? idx + 1 : null;
  }

  return (
    <>
      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl animate-slide-down text-sm font-medium"
             style={{
               background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
               border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
               color: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
             }}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckIcon /> : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-7 animate-fade-in">
        {/* Header */}
        <div className="surface-card p-6 md:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                   style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                <BarChartIcon />
              </div>
              <div>
                <h1 className="heading-xl">Estratégias</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {activeStrategy ? 'Copiando uma estratégia. Selecione outra ou pare.' : 'Selecione uma estratégia para copiar.'}
                </p>
              </div>
            </div>

            {activeStrategy && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg"
                   style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-border-accent)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                    <CheckIcon />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>Ativa</div>
                    <div className="text-base font-bold">{activeStrategy.name}</div>
                  </div>
                </div>
                <button onClick={handleStopCopying}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--color-error)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Parar de Copiar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Strategy Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy, index) => {
              const IconComponent = getStrategyIcon(strategy.icon_type);
              const isActive = activeStrategyId === strategy.id;
              const ranking = getRanking(strategy.id);
              const percentage = typeof strategy.percentage === 'string' ? parseFloat(strategy.percentage) : strategy.percentage;
              const accent = getAccentColor(strategy.color_gradient);

              return (
                <div key={strategy.id} className="surface-card-hover p-5 relative animate-fade-in"
                     style={{ animationDelay: `${index * 60}ms` }}>
                  {/* Ranking */}
                  {ranking && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 text-xs font-bold shadow-lg"
                         style={{ background: 'var(--color-accent)', color: '#0B1120', border: '2px solid var(--color-bg-deep)' }}>
                      #{ranking}
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center z-10"
                         style={{ background: 'var(--color-accent)', color: '#0B1120', border: '2px solid var(--color-bg-deep)' }}>
                      <CheckIcon />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ background: `${accent}20`, color: accent }}>
                      <IconComponent />
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold"
                         style={{ background: `${accent}15`, color: accent }}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1.5">{strategy.name}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{strategy.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-deep)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${Math.min(percentage, 100)}%`, background: accent }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleCopyStrategy(strategy.id, strategy.name)}
                      disabled={copyingStrategyId === strategy.id || isActive || !hasAccountConfigured}
                      className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : !hasAccountConfigured ? 'var(--color-bg-elevated)' : 'var(--color-accent-dim)',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : !hasAccountConfigured ? 'var(--color-border)' : 'var(--color-border-accent)'}`,
                        color: isActive ? 'var(--color-success)' : !hasAccountConfigured ? 'var(--color-text-faint)' : 'var(--color-accent)',
                      }}
                      title={!hasAccountConfigured ? 'Configure sua conta da Exchange primeiro' : ''}>
                      {copyingStrategyId === strategy.id ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>Ativando...</span></>
                      ) : isActive ? (
                        <><CheckIcon /><span>Ativa</span></>
                      ) : !hasAccountConfigured ? (
                        <span>Configure a Conta</span>
                      ) : (
                        <span>Copiar Estratégia</span>
                      )}
                    </button>
                    <button onClick={() => { setSelectedStrategyId(strategy.id); setSelectedStrategyName(strategy.name); setShowHistoryModal(true); }}
                      className="px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                      style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)'; }}>
                      <BarChartIcon /><span>Histórico Mensal</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="surface-card p-5 flex gap-4" style={{ borderLeft: '3px solid var(--color-teal)' }}>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--color-teal-dim)', color: 'var(--color-teal)' }}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Como Funciona</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Selecione uma estratégia para copiar automaticamente as apostas dos traders. Os percentuais indicam a taxa de sucesso histórica. Você pode alterar sua estratégia a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {selectedStrategyId && (
        <StrategyHistoryModal isOpen={showHistoryModal}
          onClose={() => { setShowHistoryModal(false); setSelectedStrategyId(null); setSelectedStrategyName(''); }}
          strategyId={selectedStrategyId} strategyName={selectedStrategyName} />
      )}

      {/* Account Required Modal */}
      {showAccountRequiredModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-card max-w-md w-full p-7 animate-scale-in" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-5"
                   style={{ background: 'var(--color-accent-dim)', border: '2px solid var(--color-accent)' }}>
                <svg className="w-8 h-8" fill="none" stroke="var(--color-accent)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="heading-lg mb-3">Exchange Necessária</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                Configure sua conta da Exchange primeiro para copiar estratégias.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link to="/settings" className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => setShowAccountRequiredModal(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ir para Configurações
                </Link>
                <button onClick={() => setShowAccountRequiredModal(false)} className="btn-outline w-full">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
