
import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => showToast('success', message, duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast('error', message, duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast('warning', message, duration), [showToast]);

  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
        icon: CheckCircleIcon,
        border: 'border-emerald-400'
      },
      error: {
        bg: 'bg-gradient-to-r from-red-500 to-pink-500',
        icon: XCircleIcon,
        border: 'border-red-400'
      },
      info: {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        icon: InformationCircleIcon,
        border: 'border-blue-400'
      },
      warning: {
        bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: ExclamationTriangleIcon,
        border: 'border-yellow-400'
      }
    };
    return styles[type];
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-8 left-8 z-[9999] space-y-4 pointer-events-none">
        {toasts.map(toast => {
          const styles = getToastStyles(toast.type);
          const Icon = styles.icon;
          
          return (
            <div
              key={toast.id}
              className={`${styles.bg} text-white px-8 py-6 rounded-[2rem] shadow-2xl border-2 ${styles.border} pointer-events-auto animate-slide-in-left flex items-center gap-4 min-w-[400px] max-w-[600px]`}
            >
              <Icon className="w-8 h-8 flex-shrink-0" />
              <p className="flex-1 font-bold text-lg text-right">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}} />
    </ToastContext.Provider>
  );
};
