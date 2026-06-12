import { useState, useEffect } from 'react';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Listen to controllerchange event (reloads page when new SW takes over)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Check active registration
    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's already a waiting worker on load
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }

      // Listen for new service workers installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New worker is waiting
              setWaitingWorker(newWorker);
              setShowPrompt(true);
            }
          }
        });
      });
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999999] animate-slide-up max-w-sm w-full p-4">
      <div className="glass-card p-4 border border-amber-500/30 bg-[#0c1020]/95 backdrop-blur-md text-white shadow-2xl flex flex-col gap-3 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-amber-500">Atualização Disponível</h4>
            <p className="text-xs text-gray-400">Uma nova versão do Copybetpro está pronta para ser usada.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowPrompt(false)}
            className="py-1.5 px-3 rounded-lg text-[11px] font-medium text-gray-400 hover:text-white transition-colors"
          >
            Agora Não
          </button>
          <button
            onClick={handleUpdate}
            className="py-1.5 px-4 rounded-lg bg-amber-500 text-gray-900 font-bold text-[11px] hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
