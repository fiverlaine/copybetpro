import { useState, useEffect } from 'react';

interface RealtimeNotificationProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export function RealtimeNotification({ message, type, duration = 3000 }: RealtimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!isVisible || !message) return null;

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className={`glass-card p-4 border ${typeStyles[type]} max-w-sm`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}
