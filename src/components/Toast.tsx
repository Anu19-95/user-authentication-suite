import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let borderColor = 'border-slate-200';
          let bgColor = 'bg-white';
          let textColor = 'text-slate-800';
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderColor = 'border-emerald-200';
            bgColor = 'bg-emerald-50/95';
            textColor = 'text-emerald-900';
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderColor = 'border-rose-200';
            bgColor = 'bg-rose-50/95';
            textColor = 'text-rose-900';
            iconColor = 'text-rose-600';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderColor = 'border-amber-200';
            bgColor = 'bg-amber-50/95';
            textColor = 'text-amber-900';
            iconColor = 'text-amber-600';
          } else if (toast.type === 'info') {
            Icon = Info;
            borderColor = 'border-sky-200';
            bgColor = 'bg-sky-50/95';
            textColor = 'text-sky-900';
            iconColor = 'text-sky-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm ${borderColor} ${bgColor} flex items-start gap-3`}
              id={`toast-${toast.id}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug ${textColor}`}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                id={`toast-dismiss-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
