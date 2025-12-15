import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getSessionUser, setSessionUser } from '../lib/session';
import { StrategyHistoryModal } from '../components/StrategyHistoryModal';

interface Strategy {
  id: string;
  name: string;
  description: string;
  percentage: number | string; // Pode vir como string do Supabase
  icon_type: string;
  color_gradient: string;
}

const BarChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function getStrategyIcon(iconType: string) {
  switch (iconType) {
    case 'trending':
      return TrendingIcon;
    case 'star':
      return StarIcon;
    case 'fire':
      return FireIcon;
    default:
      return TrendingIcon;
  }
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

  // Atualiza o usuário quando a sessão muda
  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  // Verifica autenticação e carrega estratégias
  useEffect(() => {
    const currentUser = getSessionUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Carrega estratégias apenas uma vez quando há usuário válido
    fetchStrategies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar

  async function fetchStrategies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('percentage', { ascending: false });

      if (error) {
        console.error('Erro ao buscar estratégias:', error);
        setNotification({ message: 'Erro ao carregar estratégias', type: 'error' });
        return;
      }

      if (data) {
        setStrategies(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estratégias:', err);
      setNotification({ message: 'Erro ao carregar estratégias', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

    async function handleCopyStrategy(strategyId: string, strategyName: string) {
    if (!user?.id || !user?.password) return;

    // Validação: verifica se a conta da exchange está configurada
    if (!user.betfair_account || user.betfair_account.trim() === '') {
      setShowAccountRequiredModal(true);
      return;
    }

    setCopyingStrategyId(strategyId);
    try {
      // Atualiza a estratégia selecionada via RPC seguro
      const { data, error } = await supabase.rpc('update_user_strategy_secure', {
        p_user_id: user.id,
        p_password_hash: user.password,
        p_strategy_id: strategyId
      });

      if (error) {
        console.error('Erro ao copiar estratégia:', error);
        setNotification({ message: 'Erro ao ativar estratégia', type: 'error' });
        return;
      }

      const updatedUser = Array.isArray(data) ? data[0] : data;

      if (updatedUser) {
        // Atualiza o usuário na sessão
        setSessionUser(updatedUser);
        // Atualiza o estado local do usuário
        setUser(updatedUser);
        setNotification({ 
          message: `Estratégia "${strategyName}" ativada com sucesso!`, 
          type: 'success' 
        });
        
        // Remove notificação após 3 segundos
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Erro ao copiar estratégia:', err);
      setNotification({ message: 'Erro ao ativar estratégia', type: 'error' });
    } finally {
      setCopyingStrategyId(null);
    }
  }

  async function handleStopCopying() {
    if (!user?.id || !user?.password) return;

    try {
      // Atualiza via RPC passado NULL
      const { data, error } = await supabase.rpc('update_user_strategy_secure', {
        p_user_id: user.id,
        p_password_hash: user.password,
        p_strategy_id: null
      });

      if (error) {
        console.error('Erro ao parar de copiar:', error);
        setNotification({ message: 'Erro ao parar de copiar', type: 'error' });
        return;
      }

      const updatedUser = Array.isArray(data) ? data[0] : data;

      if (updatedUser) {
        setSessionUser(updatedUser);
        // Atualiza o estado local do usuário
        setUser(updatedUser);
        setNotification({ 
          message: 'Você parou de copiar a estratégia', 
          type: 'success' 
        });
        
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Erro ao parar de copiar:', err);
      setNotification({ message: 'Erro ao parar de copiar', type: 'error' });
    }
  }

  function openHistoryModal(strategyId: string, strategyName: string) {
    setSelectedStrategyId(strategyId);
    setSelectedStrategyName(strategyName);
    setShowHistoryModal(true);
  }

  function closeHistoryModal() {
    setShowHistoryModal(false);
    setSelectedStrategyId(null);
    setSelectedStrategyName('');
  }

  if (!user) return null;

  const activeStrategyId = user.selected_strategy;
  const activeStrategy = strategies.find(s => s.id === activeStrategyId);
  const hasAccountConfigured = user.betfair_account && user.betfair_account.trim() !== '';

  // Filtra estratégias com 80% ou mais e pega as top 3
  const topStrategies = strategies
    .filter(s => {
      const percentage = typeof s.percentage === 'string' ? parseFloat(s.percentage) : s.percentage;
      return percentage >= 80;
    })
    .sort((a, b) => {
      const percentageA = typeof a.percentage === 'string' ? parseFloat(a.percentage) : a.percentage;
      const percentageB = typeof b.percentage === 'string' ? parseFloat(b.percentage) : b.percentage;
      return percentageB - percentageA;
    })
    .slice(0, 3)
    .map(s => s.id);

  // Função para obter o ranking de uma estratégia (se estiver no top 3)
  function getRanking(strategyId: string): number | null {
    const index = topStrategies.indexOf(strategyId);
    return index !== -1 ? index + 1 : null;
  }

  return (
    <>
      {/* Notificação */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckIcon />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <BarChartIcon />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Estratégias Disponíveis</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {activeStrategy 
                    ? `Você está copiando uma estratégia. Selecione outra ou pare de copiar.`
                    : `Selecione uma estratégia para começar a copiar apostas de traders profissionais.`
                  }
                </p>
              </div>
            </div>

            {/* Indicador de Estratégia Ativa */}
            {activeStrategy && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Estratégia Ativa</div>
                    <div className="text-lg font-semibold text-white">{activeStrategy.name}</div>
                  </div>
                </div>
                <button
                  onClick={handleStopCopying}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Parar de Copiar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Estratégias */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy, index) => {
              const IconComponent = getStrategyIcon(strategy.icon_type);
              const isActive = activeStrategyId === strategy.id;
              const ranking = getRanking(strategy.id);
              const percentage = typeof strategy.percentage === 'string' ? parseFloat(strategy.percentage) : strategy.percentage;

              return (
                <div
                  key={strategy.id}
                  className="glass-card-hover p-6 relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge de Ranking (Top 3 com ≥80%) */}
                  {ranking && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 border-2 border-gray-900 flex items-center justify-center z-10 shadow-lg">
                      <span className="text-gray-900 font-bold text-sm">#{ranking}</span>
                    </div>
                  )}

                  {/* Indicador de Ativa */}
                  {isActive && (
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary border-2 border-gray-900 flex items-center justify-center z-10">
                      <CheckIcon />
                    </div>
                  )}

                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${strategy.color_gradient} flex items-center justify-center text-white`}>
                      <IconComponent />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-400`}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>

                  {/* Nome e Descrição */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{strategy.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{strategy.description}</p>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-6">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${strategy.color_gradient} transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCopyStrategy(strategy.id, strategy.name)}
                      disabled={copyingStrategyId === strategy.id || isActive || !hasAccountConfigured}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isActive
                          ? 'bg-green-500/20 border border-green-500/50 text-green-400 cursor-not-allowed'
                          : !hasAccountConfigured
                          ? 'bg-gray-700/50 border border-gray-600/50 text-gray-500 cursor-not-allowed'
                          : 'bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary hover:scale-105'
                      }`}
                      title={!hasAccountConfigured ? 'Configure sua conta da Exchange primeiro nas Configurações' : ''}
                    >
                      {copyingStrategyId === strategy.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                          <span>Ativando...</span>
                        </>
                      ) : isActive ? (
                        <>
                          <CheckIcon />
                          <span>Estratégia Ativa</span>
                        </>
                      ) : !hasAccountConfigured ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Configure a Conta</span>
                        </>
                      ) : (
                        <span>Copiar Estratégia</span>
                      )}
                    </button>
                    <button
                      onClick={() => openHistoryModal(strategy.id, strategy.name)}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChartIcon />
                      <span>Ver Histórico Mensal</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Seção Informativa */}
        <div className="glass-card p-6 border-l-4 border-primary">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <InfoIcon />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Como Funciona</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Selecione a estratégia que deseja copiar. O sistema irá replicar automaticamente as apostas dos traders profissionais que utilizam essa estratégia. Os percentuais indicam a taxa de sucesso histórica de cada estratégia. Você pode alterar sua estratégia a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Histórico */}
      {selectedStrategyId && (
        <StrategyHistoryModal
          isOpen={showHistoryModal}
          onClose={closeHistoryModal}
          strategyId={selectedStrategyId}
          strategyName={selectedStrategyName}
        />
      )}

      {/* Modal de Conta Obrigatória */}
      {showAccountRequiredModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-8 border-2 border-yellow-500/50 animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 mb-6">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Conta da Exchange Necessária
              </h2>
              
              <p className="text-gray-300 mb-6">
                Para copiar uma estratégia, é necessário configurar sua conta da Exchange primeiro.
              </p>
              
              <p className="text-gray-400 text-sm mb-8">
                Acesse as Configurações para adicionar suas credenciais da Exchange e depois volte para copiar a estratégia desejada.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  to="/settings"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => setShowAccountRequiredModal(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ir para Configurações</span>
                </Link>
                <button
                  onClick={() => setShowAccountRequiredModal(false)}
                  className="btn-outline w-full"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

