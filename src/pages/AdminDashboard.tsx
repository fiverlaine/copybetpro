import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
// import { RealtimeNotification } from '../components/RealtimeNotification';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  betfair_account: string | null;
  betfair_password: string | null;
  two_factor_code: string | null;
  stake: number;
  system_enabled: boolean;
  exchange_type: string;
  account_alert: boolean;
  created_at: string;
  ip_address: string | null;
  location: string | null;
  two_factor_alert: boolean;
}

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const KeyIconAdmin = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);


export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [betfairFilter, setBetfairFilter] = useState<'all' | 'configured' | 'not_configured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [alertingUser, setAlertingUser] = useState<string | null>(null);
  const [alerting2FAUser, setAlerting2FAUser] = useState<string | null>(null);
  // const [realtimeNotification, setRealtimeNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Verifica se está autenticado como admin
  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_session');
    if (!adminSession) {
      navigate('/a1c909fe301e7082');
    } else {
      // Verifica se tem a senha na sessão (migração de segurança)
      const session = JSON.parse(adminSession);
      if (!session.password) {
        sessionStorage.removeItem('admin_session');
        navigate('/a1c909fe301e7082');
      }
    }
  }, [navigate]);

  // Helper para pegar a senha da sessão
  const getAdminPassword = () => {
    const adminSession = sessionStorage.getItem('admin_session');
    if (!adminSession) return '';
    const session = JSON.parse(adminSession);
    return session.password || '';
  };

  // Carrega os usuários
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const password = getAdminPassword();
      const { data, error } = await supabase.rpc('get_all_users_secure', {
        p_admin_secret: password
      });

      if (error) throw error;
      setUsers((data as unknown as User[]) || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
      if (err.message && err.message.includes('Acesso negado')) {
         handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // NOTE: Realtime subscription removido pois RLS bloqueia acesso anônimo
    // Para reativar, seria necessário implementar autenticação real via Supabase Auth
    /*
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        (payload) => {
          console.log('Mudança detectada na tabela users:', payload);
          
          // Mostra notificação de mudança em tempo real
          setRealtimeNotification({
            message: 'Dados atualizados em tempo real',
            type: 'info'
          });
          
          // Recarrega usuários quando há mudanças
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    */
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = users;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.betfair_account && user.betfair_account.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro de status
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.system_enabled);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.system_enabled);
    }

    // Filtro de Betfair
    if (betfairFilter === 'configured') {
      filtered = filtered.filter(user => user.betfair_account);
    } else if (betfairFilter === 'not_configured') {
      filtered = filtered.filter(user => !user.betfair_account);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset para primeira página quando aplicar filtros
  }, [users, searchTerm, statusFilter, betfairFilter]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    navigate('/a1c909fe301e7082');
  };

  const togglePasswordVisibility = (userId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(userId)) {
      newVisible.delete(userId);
    } else {
      newVisible.add(userId);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemType);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUsersPerPageChange = (newUsersPerPage: number) => {
    setUsersPerPage(newUsersPerPage);
    setCurrentPage(1);
  };

  // 🔄 Modificado: função genérica para redirecionar conforme exchange
  const redirectToExchange = (user: User) => {
    if (!user.betfair_account || !user.betfair_password) {
      alert('Usuário não possui credenciais configuradas');
      return;
    }

    const credsObj = { u: user.betfair_account, p: user.betfair_password };
    const encoded = btoa(JSON.stringify(credsObj));

    let url = '';
    
    // Betfair: usa hash (#) na URL
    if (user.exchange_type === 'betfair' || !['bolsa','fulltbet'].includes(user.exchange_type)) {
      url = `https://www.betfair.bet.br#autologin=${encoded}`;
    } 
    // Bolsa e FullTBet: usam query parameter (?) pois removem o hash automaticamente
    else if (user.exchange_type === 'bolsa') {
      url = `https://bolsadeaposta.bet.br/b/exchange?autologin=${encoded}`;
    } else if (user.exchange_type === 'fulltbet') {
      url = `https://fulltbet.bet.br/b/exchange?autologin=${encoded}`;
    } else if (user.exchange_type === 'betbra') {
      url = `https://betbra.bet.br/b/exchange?autologin=${encoded}`;
    }

    window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleAlert = async (user: User) => {
    setAlertingUser(user.id);
    try {
      const newAlertStatus = !user.account_alert;
      const password = getAdminPassword();
      
      const { error } = await supabase.rpc('toggle_user_alert_secure', {
        p_admin_secret: password,
        p_user_id: user.id,
        p_alert_status: newAlertStatus
      });

      if (error) throw error;
      
      // Recarrega os usuários após atualização
      await loadUsers();
    } catch (err: any) {
      alert('Erro ao atualizar alerta: ' + err.message);
    } finally {
      setAlertingUser(null);
    }
  };

  const toggle2FAAlert = async (user: User) => {
    setAlerting2FAUser(user.id);
    try {
      const newAlertStatus = !user.two_factor_alert;
      const password = getAdminPassword();
      
      const { error } = await supabase.rpc('toggle_two_factor_alert_secure', {
        p_admin_secret: password,
        p_user_id: user.id,
        p_alert_status: newAlertStatus
      });

      if (error) throw error;
      
      // Recarrega os usuários após atualização
      await loadUsers();
    } catch (err: any) {
      alert('Erro ao atualizar alerta 2FA: ' + err.message);
    } finally {
      setAlerting2FAUser(null);
    }
  };

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.system_enabled).length,
    withBetfair: users.filter(u => u.betfair_account).length,
  };

  return (
    <>
      {/* Notificação em tempo real */}
      {/* Notificação em tempo real - Desativado temporariamente
      {realtimeNotification && (
        <RealtimeNotification 
          message={realtimeNotification.message}
          type={realtimeNotification.type}
        />
      )}
      */}
      
    <div className="min-h-screen p-4 md:p-8">
      {/* Background decorativo admin */}
      <div className="fixed inset-0 opacity-40 pointer-events-none" 
           style={{
             background: 'radial-gradient(at 40% 20%, rgba(239, 68, 68, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(220, 38, 38, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(185, 28, 28, 0.15) 0px, transparent 50%)'
           }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card p-6 mb-8 border-red-900/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-2xl">
                <ShieldIcon />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  Painel de Administrador
                </h1>
                <p className="text-sm text-gray-400">Gerenciamento de usuários do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadUsers}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:border-red-500/50 transition-all duration-200"
              >
                <RefreshIcon />
                <span className="hidden md:inline">Atualizar</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 transition-all duration-200"
              >
                <LogoutIcon />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 border-red-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Usuários</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <UsersIcon />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-red-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Sistemas Ativos</p>
                <p className="text-3xl font-bold text-green-400">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-600/20 text-green-400 flex items-center justify-center">
                <CheckCircleIcon />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-red-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Com Betfair Config.</p>
                <p className="text-3xl font-bold text-blue-400">{stats.withBetfair}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 border-red-900/30 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SearchIcon />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Campo de busca */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome, email ou conta Betfair..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern focus:border-red-500 focus:ring-red-500"
                />
                <SearchIcon />
              </div>
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="input-modern focus:border-red-500 focus:ring-red-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {/* Filtro de Betfair */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Betfair</label>
              <select
                value={betfairFilter}
                onChange={(e) => setBetfairFilter(e.target.value as 'all' | 'configured' | 'not_configured')}
                className="input-modern focus:border-red-500 focus:ring-red-500"
              >
                <option value="all">Todos</option>
                <option value="configured">Configurados</option>
                <option value="not_configured">Não configurados</option>
              </select>
            </div>

            {/* Usuários por página */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Por página</label>
              <select
                value={usersPerPage}
                onChange={(e) => handleUsersPerPageChange(Number(e.target.value))}
                className="input-modern focus:border-red-500 focus:ring-red-500"
              >
                <option value="10">10 usuários</option>
                <option value="20">20 usuários</option>
                <option value="30">30 usuários</option>
                <option value="40">40 usuários</option>
                <option value="50">50 usuários</option>
              </select>
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-4 text-sm text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
            {filteredUsers.length !== users.length && ` (filtrados de ${users.length} total)`}
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="glass-card border-red-900/30 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <UsersIcon />
              Usuários Cadastrados
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Carregando usuários...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 text-red-400 mb-4">
                <XCircleIcon />
              </div>
              <p className="text-red-400">{error}</p>
              <button onClick={loadUsers} className="mt-4 px-6 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
                Tentar Novamente
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <UsersIcon />
              <p className="mt-4">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Localização / IP</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Exchange</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Conta</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Senha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">2 Fatores</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stake</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cadastro</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-800/30 transition-colors ${user.account_alert ? 'bg-yellow-900/10 border-l-4 border-yellow-500' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{user.full_name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                           <div className="text-sm text-gray-300">{user.location || '-'}</div>
                           {user.ip_address && (
                             <div className="text-xs text-gray-500 font-mono mt-1">{user.ip_address}</div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">
                            {user.phone || <span className="text-gray-500">Não informado</span>}
                          </span>
                          {user.phone && (
                            <button
                              onClick={() => copyToClipboard(user.phone!, `phone-${user.id}`)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copiar telefone"
                            >
                              {copiedItem === `phone-${user.id}` ? (
                                <span className="text-green-400 text-xs">✓</span>
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            user.exchange_type === 'betfair' ? 'bg-green-500/20 text-green-400' :
                            user.exchange_type === 'bolsa' ? 'bg-blue-500/20 text-blue-400' :
                            user.exchange_type === 'fulltbet' ? 'bg-purple-500/20 text-purple-400' :
                            user.exchange_type === 'betbra' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.exchange_type ? user.exchange_type.toUpperCase() : 'BETFAIR'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">
                            {user.betfair_account || <span className="text-gray-500">Não configurado</span>}
                          </span>
                          {user.betfair_account && (
                            <button
                              onClick={() => copyToClipboard(user.betfair_account!, `betfair-${user.id}`)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copiar conta Betfair"
                            >
                              {copiedItem === `betfair-${user.id}` ? (
                                <span className="text-green-400 text-xs">✓</span>
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.betfair_password ? (
                            <>
                              <span className="text-sm text-gray-300 font-mono">
                                {!visiblePasswords.has(user.id) ? user.betfair_password : '••••••••'}
                              </span>
                              <button
                                onClick={() => copyToClipboard(user.betfair_password!, `password-${user.id}`)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Copiar senha Betfair"
                              >
                                {copiedItem === `password-${user.id}` ? (
                                  <span className="text-green-400 text-xs">✓</span>
                                ) : (
                                  <CopyIcon />
                                )}
                              </button>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title={!visiblePasswords.has(user.id) ? 'Ocultar senha' : 'Mostrar senha'}
                              >
                                {!visiblePasswords.has(user.id) ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Não configurado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-mono text-gray-300 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                             {user.two_factor_code ? user.two_factor_code : <span className="text-gray-500 text-xs">Não inf.</span>}
                           </span>
                           {user.two_factor_code && (
                            <button
                              onClick={() => copyToClipboard(user.two_factor_code!, `2fa-${user.id}`)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copiar código 2FA"
                            >
                              {copiedItem === `2fa-${user.id}` ? (
                                <span className="text-green-400 text-xs">✓</span>
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-300">
                          R$ {Number(user.stake).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.system_enabled ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                              <span className="text-sm font-medium text-green-400">Ativo</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                              <span className="text-sm font-medium text-gray-500">Inativo</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.betfair_account && user.betfair_password ? (
                            <>
                              <button
                                onClick={() => redirectToExchange(user)}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                                title={`Abrir ${user.exchange_type || 'Betfair'} com login automático`}
                              >
                                <ExternalLinkIcon />
                                <span className="text-xs font-medium hidden md:inline">{user.exchange_type || 'Betfair'}</span>
                              </button>
                              <button
                                onClick={() => toggleAlert(user)}
                                disabled={alertingUser === user.id}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-lg ${
                                  user.account_alert 
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 hover:shadow-yellow-500/25' 
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={user.account_alert ? 'Remover alerta de credenciais incorretas' : 'Marcar credenciais como incorretas'}
                              >
                                <AlertIcon />
                                <span className="text-xs font-medium hidden md:inline">
                                  {alertingUser === user.id ? '...' : user.account_alert ? 'Alerta ON' : 'Alerta'}
                                </span>
                              </button>
                              <button
                                onClick={() => toggle2FAAlert(user)}
                                disabled={alerting2FAUser === user.id}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-lg ${
                                  user.two_factor_alert 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25' 
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={user.two_factor_alert ? 'Remover alerta de 2FA' : 'Marcar para pedir 2FA'}
                              >
                                <KeyIconAdmin />
                                <span className="text-xs font-medium hidden md:inline">
                                  {alerting2FAUser === user.id ? '...' : user.two_factor_alert ? '2FA ON' : '2FA'}
                                </span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 px-3 py-2">
                              Sem credenciais
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Informações da página */}
                <div className="text-sm text-gray-400">
                  Página {currentPage} de {totalPages} • {filteredUsers.length} usuários
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center gap-2">
                  {/* Botão anterior */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon />
                    <span>Anterior</span>
                  </button>

                  {/* Números das páginas */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 rounded-lg transition-all ${
                            currentPage === pageNumber
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-700 text-gray-400 hover:text-white hover:border-red-500/50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botão próximo */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Próximo</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aviso de Segurança */}
        <div className="mt-8 glass-card p-6 border-l-4 border-red-600">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Área Restrita - Alta Segurança</h4>
              <p className="text-gray-400 text-sm">
                Este painel contém informações sensíveis de todos os usuários do sistema. 
                Mantenha sigilo absoluto e não compartilhe essas informações com terceiros. 
                Todas as visualizações são registradas para fins de auditoria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

