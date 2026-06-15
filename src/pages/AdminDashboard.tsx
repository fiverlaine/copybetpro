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
  banca: number;
  system_enabled: boolean;
  exchange_type: string;
  account_alert: boolean;
  created_at: string;
  ip_address: string | null;
  location: string | null;
  two_factor_alert: boolean;
  betfair_warning_alert: boolean;
  banca_warning_alert: boolean;
  tag_color: string | null;
  pwa_installed?: boolean;
  push_notifications_enabled?: boolean;
}

interface CredentialHistory {
  id: string;
  betfair_account: string;
  betfair_password: string;
  changed_at: string;
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

interface PushHistory {
  id: string;
  title: string;
  body: string;
  url: string;
  target: string;
  success_count: number;
  failure_count: number;
  created_at: string;
}

const NOTIFICATION_TEMPLATES = {
  credenciais: {
    title: '⚠️ Credenciais Incorretas Betfair',
    body: 'Suas credenciais da Betfair parecem estar incorretas. Por favor, atualize-as nas configurações para que o robô possa operar.',
    url: '/settings',
    label: 'Credenciais Betfair Incorretas'
  },
  two_factor: {
    title: '🔑 Código 2FA Necessário',
    body: 'O robô precisa do seu código 2FA da Betfair para fazer o login e continuar as operações. Insira o código no seu painel.',
    url: '/dashboard',
    label: 'Código 2FA Necessário'
  },
  betfair_warning: {
    title: '⚙️ Configuração Pendente Betfair',
    body: 'Você ainda não configurou sua conta da Betfair. Conecte sua conta para começar a copiar as estratégias automaticamente.',
    url: '/settings',
    label: 'Configuração Betfair Pendente'
  },
  banca_warning: {
    title: '💰 Saldo de Banca Insuficiente',
    body: 'Identificamos que seu saldo de banca na Betfair está abaixo de R$ 500. Aumente seu saldo para que o robô possa realizar as operações.',
    url: '/dashboard',
    label: 'Banca Insuficiente (< R$ 500)'
  }
};

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
  const [alertingBetfairUser, setAlertingBetfairUser] = useState<string | null>(null);
  const [alertingBancaUser, setAlertingBancaUser] = useState<string | null>(null);
  const [taggingUser, setTaggingUser] = useState<string | null>(null);

  const [tagNames, setTagNames] = useState({ red: '🔴 VIP / Perigo', green: '🟢 Ativo / Seguro', blue: '🔵 Suporte', purple: '🟣 Premium' });
  const [showTagConfigModal, setShowTagConfigModal] = useState(false);
  const [editingTagNames, setEditingTagNames] = useState({ ...tagNames });
  const [savingTags, setSavingTags] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [credentialHistory, setCredentialHistory] = useState<CredentialHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // const [realtimeNotification, setRealtimeNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Push Notification History states
  const [pushHistory, setPushHistory] = useState<PushHistory[]>([]);
  const [loadingHistoryData, setLoadingHistoryData] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Abas do Painel
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'push'>('overview');

  // Push Notification form states
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/dashboard');
  const [pushTarget, setPushTarget] = useState<'all' | 'tag' | 'user'>('all');
  const [pushTargetTag, setPushTargetTag] = useState('');
  const [pushTargetUser, setPushTargetUser] = useState('');
  const [sendingPush, setSendingPush] = useState(false);
  const [pushResultMsg, setPushResultMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      setPushResultMsg({ type: 'error', text: 'Por favor, preencha o título e a mensagem.' });
      return;
    }

    setSendingPush(true);
    setPushResultMsg(null);

    try {
      const adminPassword = getAdminPassword();
      const payload = {
        title: pushTitle.trim(),
        body: pushBody.trim(),
        url: pushUrl.trim(),
        targetUserId: pushTarget === 'user' ? pushTargetUser : undefined,
        targetTagColor: pushTarget === 'tag' ? pushTargetTag : undefined,
        adminSecret: adminPassword,
      };

      const { data, error } = await supabase.functions.invoke('send-push', {
        body: payload,
      });

      if (error) throw error;

      setPushResultMsg({
        type: 'success',
        text: data?.message || 'Notificação enviada com sucesso!'
      });
      
      // Clear form on success
      setPushTitle('');
      setPushBody('');
      setPushUrl('/dashboard');
      setSelectedTemplate('');
      
      // Reload history on success
      await loadPushHistory();
      
    } catch (err: any) {
      console.error('Erro ao enviar push:', err);
      setPushResultMsg({
        type: 'error',
        text: err.message || 'Erro ao processar o disparo da notificação.'
      });
    } finally {
      setSendingPush(false);
    }
  };


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

      // Load tags config
      try {
        const { data: tagData } = await supabase.rpc('get_tags_config_secure', {
          p_admin_secret: password
        });
        if (tagData) {
          setTagNames(tagData as typeof tagNames);
          setEditingTagNames(tagData as typeof tagNames);
        }
      } catch (err) {
        console.error('Erro ao carregar tags:', err);
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
      if (err.message && err.message.includes('Acesso negado')) {
         handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPushHistory = async () => {
    setLoadingHistoryData(true);
    try {
      const password = getAdminPassword();
      const { data, error } = await supabase.rpc('get_notification_history_secure', {
        p_admin_secret: password
      });

      if (error) throw error;
      setPushHistory((data as unknown as PushHistory[]) || []);
    } catch (err: any) {
      console.error('Erro ao carregar histórico de disparos:', err);
    } finally {
      setLoadingHistoryData(false);
    }
  };

  const triggerTemplateForUser = (user: User, templateKey: keyof typeof NOTIFICATION_TEMPLATES) => {
    setActiveTab('push');
    setPushTarget('user');
    setPushTargetUser(user.id);
    setSelectedTemplate(templateKey);
    
    const t = NOTIFICATION_TEMPLATES[templateKey];
    setPushTitle(t.title);
    setPushBody(t.body);
    setPushUrl(t.url);
    
    setTimeout(() => {
      const formEl = document.getElementById('push-notification-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  useEffect(() => {
    loadUsers();
    loadPushHistory();

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
  }, [users, searchTerm, statusFilter, betfairFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset para primeira página apenas quando alterar os filtros, não quando recarregar usuários
  }, [searchTerm, statusFilter, betfairFilter]);

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

  const toggleBetfairAlert = async (user: User) => {
    setAlertingBetfairUser(user.id);
    try {
      const newAlertStatus = !user.betfair_warning_alert;
      const password = getAdminPassword();
      
      const { error } = await supabase.rpc('toggle_betfair_warning_alert_secure', {
        p_admin_secret: password,
        p_user_id: user.id,
        p_alert_status: newAlertStatus
      });

      if (error) throw error;
      await loadUsers();
    } catch (err: any) {
      alert('Erro ao atualizar alerta Betfair: ' + err.message);
    } finally {
      setAlertingBetfairUser(null);
    }
  };

  const toggleBancaAlert = async (user: User) => {
    setAlertingBancaUser(user.id);
    try {
      const newAlertStatus = !user.banca_warning_alert;
      const password = getAdminPassword();
      
      const { error } = await supabase.rpc('toggle_banca_warning_alert_secure', {
        p_admin_secret: password,
        p_user_id: user.id,
        p_alert_status: newAlertStatus
      });

      if (error) throw error;
      await loadUsers();
    } catch (err: any) {
      alert('Erro ao atualizar alerta de Banca: ' + err.message);
    } finally {
      setAlertingBancaUser(null);
    }
  };

  const setUserTag = async (user: User, tagColor: string | null) => {
    setTaggingUser(user.id);
    try {
      const password = getAdminPassword();
      const { error } = await supabase.rpc('set_user_tag_color_secure', {
        p_admin_secret: password,
        p_user_id: user.id,
        p_tag_color: tagColor
      });

      if (error) throw error;
      await loadUsers();
    } catch (err: any) {
      alert('Erro ao atualizar tag: ' + err.message);
    } finally {
      setTaggingUser(null);
    }
  };

  const saveTagConfig = async () => {
    setSavingTags(true);
    try {
      const password = getAdminPassword();
      const { error } = await supabase.rpc('update_tags_config_secure', {
        p_admin_secret: password,
        p_tag_config: editingTagNames
      });
      if (error) throw error;
      setTagNames(editingTagNames);
      setShowTagConfigModal(false);
    } catch (err: any) {
      alert('Erro ao salvar tags: ' + err.message);
    } finally {
      setSavingTags(false);
    }
  };

  const loadCredentialHistory = async (userId: string) => {
    setShowHistoryModal(userId);
    setLoadingHistory(true);
    setCredentialHistory([]);
    try {
      const password = getAdminPassword();
      const { data, error } = await supabase.rpc('get_user_credentials_history_secure', {
        p_admin_secret: password,
        p_user_id: userId
      });
      if (error) throw error;
      setCredentialHistory((data as unknown as CredentialHistory[]) || []);
    } catch (err: any) {
      alert('Erro ao carregar histórico: ' + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.system_enabled).length,
    withBetfair: users.filter(u => u.betfair_account).length,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080C16] text-white font-sans antialiased selection:bg-amber-500/30 selection:text-amber-250">
      
      {/* Sidebar de Navegação */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#0B1120]/80 backdrop-blur-md border-b md:border-r border-gray-800/40 p-5 flex flex-col justify-between z-20 relative">
        <div className="space-y-6">
          {/* Logo do Copybetpro */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-gray-950 font-black text-xl">
              C
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-wide leading-none">COPYBETPRO</h2>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">PORTAL ADMIN</span>
            </div>
          </div>

          {/* Perfil Rápido do Administrador */}
          <div className="bg-[#111827]/40 border border-gray-800/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-405 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">Administrador</h4>
              <span className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">Acesso Total</span>
            </div>
          </div>

          {/* Menu de Abas */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-850/40'
              }`}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-850/40'
              }`}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Clientes</span>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black transition-colors ${
                activeTab === 'users' ? 'bg-gray-950 text-amber-500' : 'bg-gray-800 text-gray-400'
              }`}>{stats.total}</span>
            </button>

            <button
              onClick={() => setActiveTab('push')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'push'
                  ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-850/40'
              }`}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Disparos Push</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-800/60 mt-6 space-y-2">
          <button
            onClick={() => { setEditingTagNames(tagNames); setShowTagConfigModal(true); }}
            className="w-full flex items-center justify-between text-left text-xs font-bold tracking-wide uppercase text-gray-400 hover:text-white transition-all duration-200 py-2 px-2.5 hover:bg-gray-850/40 rounded-xl cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Configurar Tags
            </span>
            <span className="text-[10px] text-gray-600">→</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all duration-200 cursor-pointer"
          >
            <LogoutIcon />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Painel Central */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 md:p-8 relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 opacity-20 pointer-events-none" 
             style={{
               background: 'radial-gradient(at 10% 10%, rgba(245, 158, 11, 0.08) 0px, transparent 40%), radial-gradient(at 90% 90%, rgba(245, 158, 11, 0.04) 0px, transparent 40%)'
             }} />

        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto relative z-10 space-y-6">
          
          {/* HEADER DE CONTEÚDO (Compartilhado/Ajustável) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/40">
            <div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Painel Administrativo</span>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-0.5">
                {activeTab === 'overview' && 'Visão Geral'}
                {activeTab === 'users' && 'Gestão de Clientes'}
                {activeTab === 'push' && 'Disparos & Push'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadUsers}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-amber-500/50 transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <RefreshIcon />
                <span>Sincronizar Dados</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/35 text-red-400 text-xs font-semibold animate-fade-in flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Erro: {error}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
             1. ABA: VISÃO GERAL
             ═══════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Card de Boas-Vindas */}
              <div className="glass-card p-6 border-gray-800/60 bg-gradient-to-br from-[#0F172A]/85 to-[#0B1329]/95 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-xl">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider mb-3">
                    Copybetpro Enterprise
                  </span>
                  <h2 className="text-xl font-bold text-white mb-2">Seja bem-vindo de volta, Administrador!</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Aqui você pode monitorar as estatísticas gerais do sistema, controlar a conexão dos clientes com as corretoras suportadas, visualizar o status do aplicativo e realizar disparos de notificações globais ou direcionadas.
                  </p>
                </div>
              </div>

              {/* Grid de Estatísticas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-5 border-gray-800/60 bg-[#111625]/60 hover:border-amber-500/30 transition-all duration-300 shadow-xl shadow-black/25">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total de Clientes</p>
                      <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
                      <span className="text-[10px] text-gray-550 mt-1 block">Usuários registrados no banco</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner">
                      <UsersIcon />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 border-gray-800/60 bg-[#111625]/60 hover:border-green-500/30 transition-all duration-300 shadow-xl shadow-black/25">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sistemas Ativos</p>
                      <p className="text-3xl font-black text-green-400 tracking-tight">{stats.active}</p>
                      <span className="text-[10px] text-green-550/70 mt-1 block">Operando em tempo real</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-inner">
                      <CheckCircleIcon />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 border-gray-800/60 bg-[#111625]/60 hover:border-blue-500/30 transition-all duration-300 shadow-xl shadow-black/25">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Com Betfair Config.</p>
                      <p className="text-3xl font-black text-blue-400 tracking-tight">{stats.withBetfair}</p>
                      <span className="text-[10px] text-blue-550/70 mt-1 block">Integração Betfair ativa</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7V4m0 0L8 8m4-4l4 4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Secundária: Informações de Tags e Segurança */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualização de Tags */}
                <div className="glass-card p-6 border-gray-800/60 bg-[#111625]/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      Configuração de Tags Ativa
                    </h3>
                    <p className="text-xs text-gray-400 mb-5">Estas são as tags atualmente configuradas no painel administrativo para marcar os clientes:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50 flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Tag Vermelha</span>
                        <span className="text-xs font-bold text-white">{tagNames.red}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50 flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Tag Verde</span>
                        <span className="text-xs font-bold text-white">{tagNames.green}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50 flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Tag Azul</span>
                        <span className="text-xs font-bold text-white">{tagNames.blue}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50 flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Tag Roxa</span>
                        <span className="text-xs font-bold text-white">{tagNames.purple}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setEditingTagNames(tagNames); setShowTagConfigModal(true); }}
                    className="w-full mt-6 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all duration-200 cursor-pointer"
                  >
                    Renomear Tags do Sistema
                  </button>
                </div>

                {/* Aviso de Segurança e Auditoria */}
                <div className="glass-card p-6 border-gray-800/60 bg-[#111625]/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="text-red-500 w-5 h-5 flex items-center justify-center">
                        <ShieldIcon />
                      </div>
                      Segurança & Termos de Uso
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Todas as ações neste painel de administração são estritamente auditadas. A cópia de senhas de Betfair dos usuários, a visualização de tokens 2FA e o envio de mensagens de aviso ativam o sistema de logging seguro para garantir a integridade dos dados dos clientes.
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Lembre-se de nunca divulgar ou repassar as credenciais de terceiros. A infraestrutura de segurança do Copybetpro protege a transição de dados entre o servidor e as corretoras conectadas.
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-[10px] font-semibold mt-4">
                    ⚠️ Atenção: Evite manter sessões de administrador ativas em computadores ou dispositivos públicos.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
             2. ABA: LISTA DE CLIENTES (USERS)
             ═══════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              {/* Filtros e Busca */}
              <div className="glass-card p-4 border-gray-800/60 bg-[#111625]/60 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Buscar Cliente</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Nome, email ou conta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-modern pl-10 focus:border-amber-500 focus:ring-amber-500/10 text-xs"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                        <SearchIcon />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtro por Atividade</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Sistemas Ativos</option>
                      <option value="inactive">Sistemas Inativos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtro por Betfair</label>
                    <select
                      value={betfairFilter}
                      onChange={(e) => setBetfairFilter(e.target.value as any)}
                      className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10"
                    >
                      <option value="all">Todas as Contas</option>
                      <option value="configured">Betfair Configurada</option>
                      <option value="not_configured">Sem Betfair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Clientes por Página</label>
                    <select
                      value={usersPerPage}
                      onChange={(e) => handleUsersPerPageChange(Number(e.target.value))}
                      className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10 cursor-pointer"
                    >
                      <option value={10}>10 por página</option>
                      <option value={20}>20 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={100}>100 por página</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabela de Usuários */}
              <div className="glass-card border-gray-800/60 bg-[#111625]/40 overflow-hidden shadow-2xl">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Buscando banco de dados...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 text-sm">
                    Nenhum usuário encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800/60 bg-gray-900/20 text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                          <th className="px-5 py-4">Nome / Usuário</th>
                          <th className="px-4 py-4">IP / Geolocalização</th>
                          <th className="px-4 py-4">Telefone</th>
                          <th className="px-4 py-4">Exchange</th>
                          <th className="px-4 py-4">Conta</th>
                          <th className="px-4 py-4">Senha</th>
                          <th className="px-4 py-4">2FA</th>
                          <th className="px-4 py-4">Banca / Stake</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-5 py-4 text-center">Configurações & Alertas Rápidos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40 text-xs">
                        {currentUsers.map((user) => {
                          const rowBgClass = user.tag_color === 'red' ? 'bg-red-500/[0.03] border-l-4 border-red-500' :
                                             user.tag_color === 'blue' ? 'bg-blue-500/[0.03] border-l-4 border-blue-500' :
                                             user.tag_color === 'green' ? 'bg-green-500/[0.03] border-l-4 border-green-500' :
                                             user.tag_color === 'purple' ? 'bg-purple-500/[0.03] border-l-4 border-purple-500' :
                                             user.account_alert ? 'bg-yellow-500/[0.02] border-l-4 border-yellow-500' : '';
                          return (
                            <tr key={user.id} className={`hover:bg-gray-800/25 transition-all duration-150 ${rowBgClass}`}>
                              <td className="px-5 py-4">
                                <div>
                                  <div className="font-bold text-white tracking-wide text-xs">{user.full_name}</div>
                                  <div className="text-[11px] text-gray-400 mt-0.5">{user.email}</div>
                                  <div className="text-[9px] text-gray-500 mt-1.5">{formatDate(user.created_at)}</div>
                                  <div className="flex gap-1.5 mt-2">
                                    <span className={`inline-flex items-center gap-0.5 text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider transition-colors ${
                                      user.pwa_installed 
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                        : 'bg-gray-850 text-gray-500 border border-gray-800/30'
                                    }`} title={user.pwa_installed ? 'Instalado como aplicativo PWA' : 'Acessando via navegador padrão'}>
                                      {user.pwa_installed ? '📱 PWA' : '🌐 Browser'}
                                    </span>
                                    <span className={`inline-flex items-center gap-0.5 text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider transition-colors ${
                                      user.push_notifications_enabled 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                        : 'bg-gray-850 text-gray-500 border border-gray-800/30'
                                    }`} title={user.push_notifications_enabled ? 'Notificações Ativas no Dispositivo' : 'Notificações Não Habilitadas'}>
                                      {user.push_notifications_enabled ? '🔔 Push ON' : '🔕 Push OFF'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4">
                                <div>
                                  <div className="text-[11px] font-semibold text-gray-300">{user.location || '-'}</div>
                                  {user.ip_address && (
                                    <div className="text-[9px] text-gray-500 font-mono mt-1">{user.ip_address}</div>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-gray-300 font-medium">
                                    {user.phone || <span className="text-gray-650 italic">Sem fone</span>}
                                  </span>
                                  {user.phone && (
                                    <button
                                      onClick={() => copyToClipboard(user.phone!, `phone-${user.id}`)}
                                      className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {copiedItem === `phone-${user.id}` ? <span className="text-green-400 text-[10px]">✓</span> : <CopyIcon />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                  user.exchange_type === 'betfair' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                  user.exchange_type === 'bolsa' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  user.exchange_type === 'fulltbet' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                  user.exchange_type === 'betbra' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                  'bg-gray-800 text-gray-400 border border-gray-700/35'
                                }`}>
                                  {user.exchange_type ? user.exchange_type.toUpperCase() : 'BETFAIR'}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-300 font-medium max-w-[90px] truncate block" title={user.betfair_account || ''}>
                                    {user.betfair_account || <span className="text-gray-650 italic">Vazio</span>}
                                  </span>
                                  {user.betfair_account && (
                                    <button
                                      onClick={() => copyToClipboard(user.betfair_account!, `betfair-${user.id}`)}
                                      className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {copiedItem === `betfair-${user.id}` ? <span className="text-green-400 text-[10px]">✓</span> : <CopyIcon />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {user.betfair_password ? (
                                    <>
                                      <span className="text-xs text-gray-300 font-mono tracking-wider">
                                        {!visiblePasswords.has(user.id) ? user.betfair_password : '••••••••'}
                                      </span>
                                      <button
                                        onClick={() => copyToClipboard(user.betfair_password!, `password-${user.id}`)}
                                        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                                      >
                                        {copiedItem === `password-${user.id}` ? <span className="text-green-400 text-[10px]">✓</span> : <CopyIcon />}
                                      </button>
                                      <button
                                        onClick={() => togglePasswordVisibility(user.id)}
                                        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                                      >
                                        {!visiblePasswords.has(user.id) ? <EyeOffIcon /> : <EyeIcon />}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-650 italic">Vazio</span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-amber-400 bg-gray-950/80 px-2 py-0.5 rounded border border-gray-800/80">
                                    {user.two_factor_code ? user.two_factor_code : <span className="text-gray-650 font-medium">N/A</span>}
                                  </span>
                                  {user.two_factor_code && (
                                    <button
                                      onClick={() => copyToClipboard(user.two_factor_code!, `2fa-${user.id}`)}
                                      className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {copiedItem === `2fa-${user.id}` ? <span className="text-green-400 text-[10px]">✓</span> : <CopyIcon />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-0.5 text-[11px]">
                                  <div><span className="text-[9px] text-gray-500 font-bold uppercase">Banca:</span> <span className="font-semibold text-white">{user.banca ? `R$ ${Number(user.banca).toFixed(2)}` : '-'}</span></div>
                                  <div><span className="text-[9px] text-gray-500 font-bold uppercase">Stake:</span> <span className="font-semibold text-gray-400">R$ {Number(user.stake).toFixed(2)}</span></div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${user.system_enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></span>
                                  <span className={`text-[11px] font-bold ${user.system_enabled ? 'text-green-400' : 'text-gray-500'}`}>
                                    {user.system_enabled ? 'ATIVO' : 'INATIVO'}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-2 items-center justify-center">
                                  <div className="flex items-center gap-2">
                                    {/* Seletor de Tags */}
                                    <select
                                      value={user.tag_color || ''}
                                      onChange={(e) => setUserTag(user, e.target.value || null)}
                                      disabled={taggingUser === user.id}
                                      className="text-[11px] bg-gray-900 border border-gray-800 text-gray-300 rounded px-2 py-0.5 outline-none focus:border-amber-500 cursor-pointer"
                                    >
                                      <option value="">Sem Tag</option>
                                      <option value="red">{tagNames.red}</option>
                                      <option value="green">{tagNames.green}</option>
                                      <option value="blue">{tagNames.blue}</option>
                                      <option value="purple">{tagNames.purple}</option>
                                    </select>

                                    <button
                                      onClick={() => loadCredentialHistory(user.id)}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-850 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                                      title="Ver Histórico de Contas Betfair"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      <span className="text-[9px] font-bold uppercase">Histórico</span>
                                    </button>

                                    {user.betfair_account && user.betfair_password && (
                                      <button
                                        onClick={() => redirectToExchange(user)}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/25 hover:bg-green-500/20 transition-colors cursor-pointer"
                                        title={`Abrir ${user.exchange_type || 'Betfair'} com login automático`}
                                      >
                                        <ExternalLinkIcon />
                                        <span className="text-[9px] font-bold uppercase">{user.exchange_type || 'Betfair'}</span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Controles de Alertas & Disparos */}
                                  <div className="flex flex-wrap items-center justify-center gap-1">
                                    {/* Alerta de Credenciais */}
                                    <div className="flex items-center gap-0.5 bg-gray-950/60 p-0.5 rounded border border-gray-800/80">
                                      <button
                                        onClick={() => toggleAlert(user)}
                                        disabled={alertingUser === user.id}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-black transition-colors cursor-pointer ${
                                          user.account_alert 
                                            ? 'bg-yellow-500/20 text-yellow-550' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        title="Alerta de Credenciais Incorretas"
                                      >
                                        {alertingUser === user.id ? '...' : user.account_alert ? 'Alert ON' : 'Alert'}
                                      </button>
                                      <button
                                        onClick={() => triggerTemplateForUser(user, 'credenciais')}
                                        className="p-1 text-gray-505 hover:text-yellow-450 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                                        title="Disparar Notificação de Credenciais Incorretas"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Alerta de 2FA */}
                                    <div className="flex items-center gap-0.5 bg-gray-950/60 p-0.5 rounded border border-gray-800/80">
                                      <button
                                        onClick={() => toggle2FAAlert(user)}
                                        disabled={alerting2FAUser === user.id}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-black transition-colors cursor-pointer ${
                                          user.two_factor_alert 
                                            ? 'bg-blue-500/20 text-blue-500' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        title="Alerta de 2FA"
                                      >
                                        {alerting2FAUser === user.id ? '...' : user.two_factor_alert ? '2FA ON' : '2FA'}
                                      </button>
                                      <button
                                        onClick={() => triggerTemplateForUser(user, 'two_factor')}
                                        className="p-1 text-gray-555 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                                        title="Disparar Notificação de 2FA"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Alerta de Sem Conta */}
                                    <div className="flex items-center gap-0.5 bg-gray-950/60 p-0.5 rounded border border-gray-800/80">
                                      <button
                                        onClick={() => toggleBetfairAlert(user)}
                                        disabled={alertingBetfairUser === user.id}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-black transition-colors cursor-pointer ${
                                          user.betfair_warning_alert 
                                            ? 'bg-red-500/20 text-red-550' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        title="Aviso para Configurar Betfair"
                                      >
                                        {alertingBetfairUser === user.id ? '...' : user.betfair_warning_alert ? 'Sem Conta ON' : 'Sem Conta'}
                                      </button>
                                      <button
                                        onClick={() => triggerTemplateForUser(user, 'betfair_warning')}
                                        className="p-1 text-gray-550 hover:text-red-400 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                                        title="Disparar Notificação de Configuração Pendente Betfair"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Alerta de Banca */}
                                    <div className="flex items-center gap-0.5 bg-gray-950/60 p-0.5 rounded border border-gray-800/80">
                                      <button
                                        onClick={() => toggleBancaAlert(user)}
                                        disabled={alertingBancaUser === user.id}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-black transition-colors cursor-pointer ${
                                          user.banca_warning_alert 
                                            ? 'bg-orange-500/20 text-orange-550' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                        title="Aviso de Banca Insuficiente"
                                      >
                                        {alertingBancaUser === user.id ? '...' : user.banca_warning_alert ? 'Banca < 500 ON' : 'Banca < 500'}
                                      </button>
                                      <button
                                        onClick={() => triggerTemplateForUser(user, 'banca_warning')}
                                        className="p-1 text-gray-550 hover:text-orange-400 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                                        title="Disparar Notificação de Banca Insuficiente"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-800/60 bg-gray-900/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-[11px] text-gray-400 font-medium">
                        Página {currentPage} de {totalPages} • {filteredUsers.length} usuários
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-750 text-[11px] font-bold text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ChevronLeftIcon />
                          <span>Anterior</span>
                        </button>

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
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  currentPage === pageNumber
                                    ? 'bg-amber-500 text-gray-950'
                                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-750'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-750 text-[11px] font-bold text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <span>Próximo</span>
                          <ChevronRightIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bloco Informativo */}
              <div className="glass-card p-6 border-l-4 border-amber-600 bg-[#111625]/60 shadow-lg">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-500 text-sm mb-1">Área de Operações Restrita</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Este painel apresenta dados em tempo real sobre credenciais e banca. Todas as alterações em banca e stake feitas no banco de dados e as visualizações de senha são logadas automaticamente para auditoria interna de segurança. Mantenha sigilo estrito destas informações.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
             3. ABA: DISPAROS PUSH
             ═══════════════════════════════════════════════════════ */}
          {activeTab === 'push' && (
            <div className="space-y-6 animate-fade-in">
              {/* Formulário de Envio */}
              <div id="push-notification-form" className="glass-card p-6 border-gray-800/60 bg-[#111625]/60 shadow-2xl relative">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Criar Novo Disparo
                </h3>

                {pushResultMsg && (
                  <div className={`p-4 mb-5 rounded-lg text-xs border flex items-start gap-3 ${
                    pushResultMsg.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {pushResultMsg.type === 'success' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <span>{pushResultMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSendPush} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Template Rápido</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedTemplate(val);
                          if (val && val in NOTIFICATION_TEMPLATES) {
                            const t = NOTIFICATION_TEMPLATES[val as keyof typeof NOTIFICATION_TEMPLATES];
                            setPushTitle(t.title);
                            setPushBody(t.body);
                            setPushUrl(t.url);
                          } else {
                            setPushTitle('');
                            setPushBody('');
                            setPushUrl('/dashboard');
                          }
                        }}
                        className="input-modern text-amber-400 font-semibold focus:border-amber-500 cursor-pointer text-xs"
                      >
                        <option value="">-- Personalizado (Nenhum) --</option>
                        {Object.entries(NOTIFICATION_TEMPLATES).map(([key, t]) => (
                          <option key={key} value={key}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Título da Notificação</label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        placeholder="Ex: Credenciais Betfair Incorretas"
                        className="input-modern focus:border-amber-500 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL de Redirecionamento</label>
                      <input
                        type="text"
                        value={pushUrl}
                        onChange={(e) => setPushUrl(e.target.value)}
                        placeholder="Ex: /settings"
                        className="input-modern focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mensagem (Corpo)</label>
                    <textarea
                      value={pushBody}
                      onChange={(e) => setPushBody(e.target.value)}
                      placeholder="Digite a mensagem detalhada que o cliente receberá..."
                      className="input-modern h-20 resize-none focus:border-amber-500 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Destinatário</label>
                      <select
                        value={pushTarget}
                        onChange={(e) => setPushTarget(e.target.value as any)}
                        className="input-modern focus:border-amber-500 cursor-pointer text-xs"
                      >
                        <option value="all">Todos os Usuários</option>
                        <option value="tag">Por Tag de Usuário</option>
                        <option value="user">Usuário Específico</option>
                      </select>
                    </div>

                    {pushTarget === 'tag' && (
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtrar por Tag</label>
                        <select
                          value={pushTargetTag}
                          onChange={(e) => setPushTargetTag(e.target.value)}
                          className="input-modern focus:border-amber-500 cursor-pointer text-xs"
                          required
                        >
                          <option value="">-- Escolha a tag --</option>
                          <option value="red">{tagNames.red}</option>
                          <option value="green">{tagNames.green}</option>
                          <option value="blue">{tagNames.blue}</option>
                          <option value="purple">{tagNames.purple}</option>
                        </select>
                      </div>
                    )}

                    {pushTarget === 'user' && (
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Selecionar Usuário Alvo</label>
                        <select
                          value={pushTargetUser}
                          onChange={(e) => setPushTargetUser(e.target.value)}
                          className="input-modern focus:border-amber-500 cursor-pointer text-xs"
                          required
                        >
                          <option value="">-- Escolha o usuário --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.full_name} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(pushTarget === 'all' || pushTarget === 'tag') && <div className="hidden md:block"></div>}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingPush}
                        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-gray-950 font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        {sendingPush ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                            <span>Disparando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span>Enviar Disparo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Histórico de Disparos */}
              <div className="glass-card border-gray-800/60 bg-[#111625]/40 overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-gray-800/60 bg-gray-900/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Disparos Recentes</h3>
                    <p className="text-[11px] text-gray-400">Verifique a entrega e o alcance de cada mensagem enviada</p>
                  </div>
                  
                  <button
                    onClick={loadPushHistory}
                    disabled={loadingHistoryData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-850 hover:bg-gray-800 text-gray-400 hover:text-white transition-all text-xs cursor-pointer"
                  >
                    <RefreshIcon />
                    <span>Atualizar Log</span>
                  </button>
                </div>

                {loadingHistoryData ? (
                  <div className="text-center py-12 text-gray-500">
                    Buscando logs de entrega no banco...
                  </div>
                ) : pushHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs italic">
                    Nenhum disparo registrado até o momento.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800/60 bg-gray-900/20 text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                          <th className="px-5 py-3.5">Título / Mensagem</th>
                          <th className="px-4 py-3.5">Destino</th>
                          <th className="px-4 py-3.5">Entrega (Sucesso / Erro)</th>
                          <th className="px-5 py-3.5 text-right">Data de Envio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40 text-xs">
                        {pushHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-800/20 transition-colors">
                            <td className="px-5 py-4 max-w-sm">
                              <div>
                                <div className="font-bold text-gray-200 text-xs">{item.title}</div>
                                <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.body}</div>
                                {item.url && (
                                  <span className="inline-block mt-2 text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono">
                                    Redir: {item.url}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[10px] bg-gray-800 border border-gray-700/50 text-gray-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                {item.target === 'all' && 'Todos'}
                                {item.target === 'tag' && 'Tag de Usuário'}
                                {item.target === 'user' && 'Usuário Único'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-black">
                                  ✓ {item.success_count || 0}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-black">
                                  ✗ {item.failure_count || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right text-gray-450 font-medium">
                              {formatDate(item.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal de Configuração de Tags */}
      {showTagConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border-gray-700/60 bg-[#0F1424] shadow-2xl animate-scale-in">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Renomear Tags do Sistema
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tag Vermelha</label>
                <input type="text" value={editingTagNames.red} onChange={e => setEditingTagNames({...editingTagNames, red: e.target.value})} className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tag Verde</label>
                <input type="text" value={editingTagNames.green} onChange={e => setEditingTagNames({...editingTagNames, green: e.target.value})} className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tag Azul</label>
                <input type="text" value={editingTagNames.blue} onChange={e => setEditingTagNames({...editingTagNames, blue: e.target.value})} className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tag Roxa</label>
                <input type="text" value={editingTagNames.purple} onChange={e => setEditingTagNames({...editingTagNames, purple: e.target.value})} className="input-modern text-xs focus:border-amber-500 focus:ring-amber-500/10" />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-800/60 pt-4">
              <button onClick={() => setShowTagConfigModal(false)} className="px-4 py-2 rounded-xl border border-gray-850 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button 
                onClick={saveTagConfig} 
                disabled={savingTags} 
                className="px-5 py-2 rounded-xl bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider hover:bg-amber-450 transition-colors shadow-lg shadow-amber-500/15 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingTags ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Credenciais */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-6 border-gray-700/60 bg-[#0F1424] shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-800/65">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Histórico de Contas Betfair
              </h2>
              <button onClick={() => setShowHistoryModal(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <XCircleIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {loadingHistory ? (
                <div className="text-center py-12 text-gray-550 text-xs font-semibold uppercase tracking-wider">
                  Carregando registros...
                </div>
              ) : credentialHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-550 text-xs italic bg-gray-950/20 rounded-xl border border-gray-850">
                  Nenhum histórico de credenciais encontrado para este usuário.
                </div>
              ) : (
                credentialHistory.map((item, index) => (
                  <div key={item.id} className="p-4 bg-gray-900/40 border border-gray-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Conta:</span>
                        <span className="text-xs font-semibold text-white">{item.betfair_account || <span className="text-gray-550 italic">Vazio</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Senha:</span>
                        <span className="text-xs font-mono text-gray-300">{item.betfair_password || <span className="text-gray-550 italic">Vazio</span>}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Alterado em</div>
                      <div className="text-xs text-amber-500 font-semibold mt-0.5">{formatDate(item.changed_at)}</div>
                      {index === 0 && (
                        <span className="inline-block mt-2 text-[8.5px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                          Atual
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-800/60 mt-4">
              <button 
                onClick={() => setShowHistoryModal(null)}
                className="px-5 py-2 rounded-xl bg-gray-850 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

