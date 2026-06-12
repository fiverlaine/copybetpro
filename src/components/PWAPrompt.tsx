import { useState, useEffect } from 'react';

interface PWAPromptProps {
  userId: string | null;
  onSubscribed: () => void;
}

type DeviceOS = 'ios' | 'android' | 'desktop';

export function PWAPrompt({ userId, onSubscribed }: PWAPromptProps) {
  const [os, setOs] = useState<DeviceOS>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Dialog visibility states
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  
  // Android native install prompt reference
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Detect OS and PWA status
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    let detectedOS: DeviceOS = 'desktop';
    if (/iphone|ipad|ipod/.test(ua)) {
      detectedOS = 'ios';
    } else if (/android/.test(ua)) {
      detectedOS = 'android';
    }
    setOs(detectedOS);

    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // If not standalone and not dismissed, show install guide
    const installDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    if (!checkStandalone && !installDismissed && detectedOS !== 'desktop') {
      setShowInstallPrompt(true);
    }

    // If standalone and permission is default (and not dismissed), show push notification prompt
    const pushDismissed = localStorage.getItem('pwa_push_dismissed') === 'true';
    if (Notification.permission === 'default' && !pushDismissed) {
      // Show push prompt shortly after load
      const timer = setTimeout(() => {
        // If install guide is showing, wait; otherwise show it
        if (!showInstallPrompt) {
          setShowPushPrompt(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showInstallPrompt]);

  // Listen for Android install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If not standalone, and not dismissed, show it
      if (!isStandalone && localStorage.getItem('pwa_install_dismissed') !== 'true') {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  // Dismiss PWA install prompt
  const handleDismissInstall = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowInstallPrompt(false);
    
    // Check if we should trigger the notification popup after install guide is closed
    if (Notification.permission === 'default' && localStorage.getItem('pwa_push_dismissed') !== 'true') {
      setShowPushPrompt(true);
    }
  };

  // Dismiss Push request popup
  const handleDismissPush = () => {
    localStorage.setItem('pwa_push_dismissed', 'true');
    setShowPushPrompt(false);
  };

  // Trigger Android native PWA installation
  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Handle actual notification permission and subscription
  const handleAcceptPush = async () => {
    setPushLoading(true);
    try {
      const { subscribeToPush } = await import('../utils/pwa');
      await subscribeToPush(userId);
      onSubscribed();
      setShowPushPrompt(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao habilitar notificações.');
    } finally {
      setPushLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RENDERING
  // -------------------------------------------------------------

  if (os === 'desktop') return null;

  return (
    <>
      {/* ── 1. PWA INSTALL PROMPTS ── */}
      {showInstallPrompt && (
        <div className="fixed inset-x-0 bottom-0 z-[99999] p-4 flex justify-center animate-slide-up">
          {os === 'ios' ? (
            /* iOS (Safari) Install Guide Banner */
            <div className="w-full max-w-sm bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl text-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img src="/pwa-icon.png" alt="COPYBETPRO" className="w-10 h-10 rounded-xl" />
                  <div>
                    <h4 className="font-bold text-sm">Instalar COPYBETPRO</h4>
                    <p className="text-[11px] text-gray-400">Adicione à tela de início do seu iPhone</p>
                  </div>
                </div>
                <button onClick={handleDismissInstall} className="text-gray-400 hover:text-white text-xs px-2 py-1">
                  Fechar
                </button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 text-xs space-y-2.5 text-gray-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                  <p>
                    Toque no botão de <strong>Compartilhar</strong>{' '}
                    <svg className="inline-block w-4.5 h-4.5 text-blue-500 align-text-bottom" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                    </svg>
                    {' '}na barra do Safari.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                  <p>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Android Install Banner */
            <div className="w-full max-w-sm bg-[#2c2c2e]/98 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl text-white">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img src="/pwa-icon.png" alt="COPYBETPRO" className="w-11 h-11 rounded-xl" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Instalar Aplicativo</h4>
                    <p className="text-xs text-gray-400">Tenha acesso rápido e notificações</p>
                  </div>
                </div>
                <button onClick={handleDismissInstall} className="text-gray-500 hover:text-white text-xs px-1">
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDismissInstall}
                  className="flex-1 py-2 px-3 rounded-lg bg-white/5 text-gray-300 font-medium text-xs hover:bg-white/10"
                >
                  Agora Não
                </button>
                <button
                  onClick={handleAndroidInstall}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500 text-gray-900 font-bold text-xs hover:bg-amber-400"
                >
                  Instalar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. NATIVE-LOOK PUSH NOTIFICATION PROMPTS ── */}
      {showPushPrompt && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          {os === 'ios' ? (
            /* iOS Style Notification Alert (Blurred Dialog) */
            <div className="w-full max-w-[270px] bg-[#2c2c2e]/90 backdrop-blur-2xl rounded-[14px] overflow-hidden text-center text-white border border-white/10 animate-scale-in">
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-[17px] leading-tight">
                  “COPYBETPRO” Deseja Enviar Notificações
                </h4>
                <p className="text-[13px] leading-snug text-gray-300">
                  As notificações podem incluir alertas, sons e avisos nos ícones. Elas podem ser configuradas nos Ajustes.
                </p>
              </div>
              <div className="flex border-t border-white/10 text-[17px]">
                <button
                  onClick={handleDismissPush}
                  className="flex-1 py-3 border-r border-white/10 text-[#0a84ff] active:bg-white/10 font-normal transition-colors"
                >
                  Não Permitir
                </button>
                <button
                  onClick={handleAcceptPush}
                  disabled={pushLoading}
                  className="flex-1 py-3 text-[#0a84ff] active:bg-white/10 font-semibold transition-colors disabled:opacity-50"
                >
                  {pushLoading ? '...' : 'Permitir'}
                </button>
              </div>
            </div>
          ) : (
            /* Android Style Notification Alert (Material 3 Dialog) */
            <div className="w-full max-w-[320px] bg-[#1e2330] rounded-[28px] p-6 text-white border border-gray-800 shadow-2xl animate-scale-in">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <svg className="w-6 h-6 animate-swing" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-medium text-white">Deseja receber notificações?</h4>
                  <p className="text-sm text-gray-400">
                    O COPYBETPRO gostaria de enviar notificações de novas estratégias e avisos da Betfair no seu celular.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleDismissPush}
                  className="py-2.5 px-4 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Bloquear
                </button>
                <button
                  onClick={handleAcceptPush}
                  disabled={pushLoading}
                  className="py-2.5 px-5 text-sm font-semibold bg-amber-500 text-gray-900 rounded-full hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {pushLoading ? 'Habilitando...' : 'Permitir'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
