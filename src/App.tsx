import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSessionUser, clearSessionUser } from './lib/session';
import './index.css';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Strategies } from './pages/Strategies';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import sigatraderLogo from './assets/sigatrader-logo.svg';

// Componente de ícones SVG
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Login: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  Register: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Strategies: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(() => getSessionUser());

  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  const handleLogout = () => {
    clearSessionUser();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/strategies', label: 'Estratégias', icon: Icons.Strategies },
    { path: '/settings', label: 'Configurações', icon: Icons.Settings },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-gray-700 bg-gray-900/30 backdrop-blur-xl">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group transition-transform hover:scale-105">
          <img src={sigatraderLogo} alt="COPYBETPRO" className="h-10" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(to right, #6366f1, #4f46e5)' }}>
              <Icons.User />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 font-medium"
        >
          <Icons.Logout />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(() => getSessionUser());

  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/strategies', label: 'Estratégias', icon: Icons.Strategies },
    { path: '/settings', label: 'Configurações', icon: Icons.Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700 z-[9999]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-2 pb-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[70px] ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <item.icon />
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => {
            sessionStorage.removeItem('session_user');
            navigate('/login');
          }}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-400 transition-all duration-200 min-w-[70px]"
        >
          <Icons.Logout />
          <span className="text-xs font-medium whitespace-nowrap">Sair</span>
        </button>
      </div>
    </nav>
  );
}

function Header() {
  const [user, setUser] = useState<any>(() => getSessionUser());
  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  if (user) {
    return (
      <header className="md:hidden sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700">
        <div className="px-6 py-4">
          <Link to="/dashboard" className="flex items-center transition-transform active:scale-95">
            <img src={sigatraderLogo} alt="COPYBETPRO" className="h-10" />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img src={sigatraderLogo} alt="COPYBETPRO" className="h-10" />
          </Link>
          <nav className="flex gap-3">
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
              <Icons.Login />
              <span className="font-medium">Login</span>
            </Link>
            <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-xl transition-all"
                  style={{ background: 'linear-gradient(to right, #6366f1, #4f46e5)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
              <Icons.Register />
              <span>Registrar</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Componente para rotas administrativas (sem header/sidebar)
function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      {children}
    </div>
  );
}

// Componente para rotas normais (com header/sidebar)
function UserLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen text-white">
      {/* Background decorativo */}
      <div className="fixed inset-0 opacity-50 pointer-events-none" 
           style={{
             background: 'radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.15) 0px, transparent 50%)'
           }} />
      
      <div className="relative flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const raw = sessionStorage.getItem('session_user');
  const isLogged = Boolean(raw);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Admin - layout sem header/sidebar */}
        <Route path="/a1c909fe301e7082" element={
          <AdminLayout>
            <AdminLogin />
          </AdminLayout>
        } />
        <Route path="/a1c909fe301e7082/dashboard" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />

        {/* Rotas normais - layout com header/sidebar */}
        <Route path="/*" element={
          <UserLayout>
            <Routes>
              <Route path="/" element={<Navigate to={isLogged ? '/dashboard' : '/login'} replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </UserLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
