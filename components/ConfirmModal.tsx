import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white',
      border: 'border-red-500/20'
    },
    warning: {
      icon: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600 text-white',
      border: 'border-amber-500/20'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
      border: 'border-blue-500/20'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-panel rounded-2xl border border-slate-300 dark:border-white/10 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.icon} ${
              variant === 'danger' ? 'bg-red-500/10' : 
              variant === 'warning' ? 'bg-amber-500/10' : 
              'bg-blue-500/10'
            } flex items-center justify-center`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg ${styles.button} transition-colors font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

