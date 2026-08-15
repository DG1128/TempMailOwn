import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="toast-item"
            style={{
              borderColor: isSuccess
                ? 'var(--accent-emerald)'
                : isError
                ? 'var(--accent-rose)'
                : 'var(--accent-primary)',
            }}
          >
            {isSuccess && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
            {isError && <AlertCircle size={16} color="var(--accent-rose)" />}
            {isInfo && <Info size={16} color="var(--accent-secondary)" />}

            <span>{toast.message}</span>

            <button
              className="btn-ghost"
              style={{ padding: '2px', marginLeft: '6px' }}
              onClick={() => onDismiss(toast.id)}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
