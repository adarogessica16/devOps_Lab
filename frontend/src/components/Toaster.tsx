import type { Toast } from '../hooks/useToast';

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const CONFIG = {
  success: {
    bar: 'bg-emerald-500',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bar: 'bg-red-500',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  confirm: {
    bar: 'bg-amber-400',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
};

export function Toaster({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(t => {
        const cfg = CONFIG[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden
                       animate-[slideUp_0.2s_ease-out]"
          >
            <div className={`h-1 w-full ${cfg.bar}`} />
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>

              <p className="flex-1 text-sm text-slate-700 font-medium leading-snug">{t.message}</p>

              {t.type !== 'confirm' && (
                <button
                  onClick={() => onDismiss(t.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition ml-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {t.type === 'confirm' && (
              <div className="flex gap-2 px-4 pb-3">
                <button
                  onClick={() => onDismiss(t.id)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { t.onConfirm?.(); onDismiss(t.id); }}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                >
                  Sí, eliminar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
