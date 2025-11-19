import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeNotification } from '../components/RealtimeNotification';
import { PoliciesModal } from '../components/PoliciesModal';
import { setSessionUser } from '../lib/session';

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PowerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export function Dashboard() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('session_user');
  const user = raw ? JSON.parse(raw) : null;
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  // Verifica se o usuário aceitou as políticas e se tem alerta de conta incorreta
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.id) {
        try {
          // Busca dados atualizados do usuário no banco
          const { data: userData, error } = await supabase
            .from('users')
            .select('account_alert, system_enabled, policies_accepted')
            .eq('id', user.id)
            .single();

          if (!error && userData) {
            // Atualiza o usuário na sessão com dados mais recentes
            const updatedUser = { ...user, ...userData };
            setSessionUser(updatedUser);
            
            // Verifica se precisa aceitar políticas (prioridade máxima)
            if (!userData.policies_accepted) {
              setShowPoliciesModal(true);
              setShowAlertModal(false);
              return;
            }
            
            // Mostra modal se há alerta
            if (userData.account_alert) {
              setShowAlertModal(true);
            } else {
              setShowAlertModal(false);
            }
          }
        } catch (err) {
          console.error('Erro ao verificar status do usuário:', err);
          // Fallback: verifica dados da sessão
          if (!user?.policies_accepted) {
            setShowPoliciesModal(true);
          } else if (user?.account_alert) {
            setShowAlertModal(true);
          }
        }
      }
    };

    checkUserStatus();

    // Configura subscription em tempo real para mudanças do usuário específico
    const subscription = supabase
      .channel(`user_${user?.id}_changes`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user?.id}`
        }, 
        (payload) => {
          console.log('Mudança detectada no usuário:', payload);
          
          // Atualiza dados do usuário na sessão
          const updatedUser = { ...user, ...payload.new };
          sessionStorage.setItem('session_user', JSON.stringify(updatedUser));
          
          // Atualiza estado do modal baseado no account_alert
          if (payload.new.account_alert) {
            setShowAlertModal(true);
            setRealtimeNotification({
              message: 'Alerta de credenciais ativado pelo administrador',
              type: 'warning'
            });
          } else {
            setShowAlertModal(false);
            setRealtimeNotification({
              message: 'Alerta de credenciais removido',
              type: 'success'
            });
          }
        }
      )
      .subscribe();

    // Cleanup da subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Handler para aceitar políticas
  async function handleAcceptPolicies() {
    if (!user?.id) return;

    setPoliciesLoading(true);
    try {
      // Atualiza o usuário no banco de dados
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
        // Atualiza a sessão com os dados atualizados
        setSessionUser(data);
        setShowPoliciesModal(false);
        setPoliciesLoading(false);
        // Recarrega a página para garantir que todos os componentes tenham os dados atualizados
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao salvar aceitação dos termos:', err);
      setPoliciesLoading(false);
    }
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const cards = [
    {
      title: 'Conta Exchange',
      value: user.betfair_account || 'Não configurado',
      icon: UserIcon,
      gradient: 'from-primary/20 to-primary-dark/20',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      title: 'Stake',
      value: `R$ ${user.stake ?? 0}`,
      icon: CurrencyIcon,
      gradient: 'from-accent-cyan/20 to-primary/20',
      iconBg: 'bg-accent-cyan/20',
      iconColor: 'text-accent-cyan',
    },
    {
      title: 'Status do Sistema',
      value: user.system_enabled ? 'Ativado' : 'Desativado',
      icon: PowerIcon,
      gradient: user.system_enabled ? 'from-green-500/20 to-green-400/10' : 'from-gray-600/20 to-gray-600/10',
      iconBg: user.system_enabled ? 'bg-green-500/20' : 'bg-gray-600/20',
      iconColor: user.system_enabled ? 'text-green-400' : 'text-gray-400',
      statusColor: user.system_enabled ? 'text-green-400' : 'text-gray-400',
    },
  ];

  return (
    <>
      {/* Notificação em tempo real */}
      {realtimeNotification && (
        <RealtimeNotification 
          message={realtimeNotification.message}
          type={realtimeNotification.type}
        />
      )}

      {/* Modal de Políticas - Obrigatório */}
      <PoliciesModal
        isOpen={showPoliciesModal}
        onAccept={handleAcceptPolicies}
        onClose={undefined}
        canClose={false}
        loading={policiesLoading}
      />
      
      {/* Modal de Alerta */}
      {showAlertModal && !showPoliciesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-8 border-2 border-yellow-500/50 animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 mb-6">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Credenciais Incorretas
              </h2>
              
              <p className="text-gray-300 mb-6">
                Suas credenciais da {user.exchange_type === 'betfair' ? 'Betfair' : user.exchange_type === 'bolsa' ? 'Bolsa' : user.exchange_type === 'fulltbet' ? 'FullTbet' : 'exchange'} estão incorretas ou expiraram. 
                O sistema foi desativado automaticamente.
              </p>
              
              <p className="text-gray-400 text-sm mb-8">
                Por favor, atualize suas credenciais nas configurações para continuar usando o sistema.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link
                  to="/settings"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => setShowAlertModal(false)}
                >
                  <SettingsIcon />
                  <span>Ir para Configurações</span>
                </Link>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="btn-outline w-full"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center shadow-glow flex-shrink-0">
              <UserIcon />
            </div>
            <div className="flex-1">
              <h1 className="h2 mb-2">Olá, {user.full_name || 'Usuário'}!</h1>
              <p className="text-text-muted">Bem-vindo ao seu painel de controle</p>
            </div>
          </div>
          <Link 
            to="/settings" 
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <SettingsIcon />
            <span>Configurações</span>
          </Link>
        </div>
      </div>

      {/* Cards de informações */}
      <div>
        <h3 className="h3 mb-6">Visão Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards */}
          {cards.map((card, index) => (
            <div 
              key={index}
              className="glass-card-hover p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                  <card.icon />
                </div>
                {/* Indicador de status para o sistema */}
                {card.title === 'Status do Sistema' && (
                  <div className={`w-3 h-3 rounded-full ${user.system_enabled ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
                )}
              </div>
              <div className="text-gray-400 text-sm mb-2">{card.title}</div>
              <div className={`text-xl font-bold truncate ${card.statusColor || 'text-white'}`}>
                {card.title === 'Status do Sistema' ? (
                  <div className="flex items-center gap-2">
                    <span>{card.value}</span>
                    {user.system_enabled && (
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    )}
                  </div>
                ) : (
                  card.value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Dica de segurança */}
      <div className="glass-card p-6 border-l-4 border-warning">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2">Importante: Segurança da Conta</h4>
            <p className="text-text-muted text-sm">
              Certifique-se de manter essas informações seguras e não compartilhá-las com terceiros.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
