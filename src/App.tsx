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

// ── SVG ICONS (redesigned) ──

const Icons = {
  Dashboard: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  User: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Login: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  Register: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Strategies: () => (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

// ── Logo Component ──
function Logo({ className = 'h-7' }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
           style={{ background: 'var(--color-accent)' }}>
        <svg className="w-4.5 h-4.5 text-[#0B1120]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      <span className="heading-display text-[1.15rem] tracking-tight" style={{ letterSpacing: '-0.04em' }}>
        COPYBET<span style={{ color: 'var(--color-accent)' }}>PRO</span>
      </span>
    </div>
  );
}

// ── Sidebar ──
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
    <aside className="hidden md:flex md:flex-col w-[260px] border-r"
           style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}>
      {/* Logo */}
      <div className="px-6 py-7">
        <Link to="/dashboard" className="inline-flex transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-faint)' }}>
            Menu
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[0.875rem] transition-all duration-150"
              style={{
                background: isActive ? 'var(--color-accent-dim)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="surface-card p-3.5 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                 style={{ background: 'var(--color-accent)', color: '#0B1120' }}>
              {(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {user.full_name || 'Usuário'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-error)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Icons.Logout />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Navigation ──
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
    { path: '/settings', label: 'Config', icon: Icons.Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] border-t"
         style={{
           background: 'rgba(11, 17, 32, 0.95)',
           backdropFilter: 'blur(20px)',
           borderColor: 'var(--color-border)',
           paddingBottom: 'env(safe-area-inset-bottom)'
         }}>
      <div className="flex items-center justify-around px-2 py-2 pb-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            >
              <item.icon />
              <span className="text-[10px] font-semibold whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => {
            sessionStorage.removeItem('session_user');
            navigate('/login');
          }}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Icons.Logout />
          <span className="text-[10px] font-semibold whitespace-nowrap">Sair</span>
        </button>
      </div>
    </nav>
  );
}

// ── Header ──
function Header() {
  const [user, setUser] = useState<any>(() => getSessionUser());
  useEffect(() => {
    const handler = () => setUser(getSessionUser());
    window.addEventListener('session_user_changed', handler);
    return () => window.removeEventListener('session_user_changed', handler);
  }, []);

  if (user) {
    return (
      <header className="md:hidden sticky top-0 z-40 border-b"
              style={{
                background: 'rgba(11, 17, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                borderColor: 'var(--color-border)'
              }}>
        <div className="px-5 py-4">
          <Link to="/dashboard" className="inline-flex transition-transform active:scale-95">
            <Logo />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b"
            style={{
              background: 'rgba(11, 17, 32, 0.9)',
              backdropFilter: 'blur(20px)',
              borderColor: 'var(--color-border)'
            }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex transition-transform hover:scale-[1.02]">
            <Logo />
          </Link>
          <nav className="flex gap-2">
            <Link to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
            >
              <Icons.Login />
              <span>Login</span>
            </Link>
            <Link to="/register" className="btn-primary flex items-center gap-2 text-sm !py-2">
              <Icons.Register />
              <span>Registrar</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// ── Admin Layout ──
function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ color: 'var(--color-text-primary)' }}>
      {children}
    </div>
  );
}

// ── User Layout ──
function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ color: 'var(--color-text-primary)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.4 }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="relative flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8"
                style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    </div>
  );
}

// ── App ──
export default function App() {
  const raw = sessionStorage.getItem('session_user');
  const isLogged = Boolean(raw);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
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

        {/* User routes */}
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
