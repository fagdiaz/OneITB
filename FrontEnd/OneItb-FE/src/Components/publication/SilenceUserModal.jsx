import React, { useEffect, useId, useRef, useState } from 'react';

const DURATION_OPTIONS = [
  { label: '24 hs', hours: 24 },
  { label: '3 días', hours: 72 },
  { label: '1 semana', hours: 168 },
];

export const SilenceUserModal = ({
  target,
  submitting = false,
  onClose,
  onConfirm,
}) => {
  const [hours, setHours] = useState(24);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const handlersRef = useRef({ onClose, submitting });

  useEffect(() => {
    handlersRef.current = { onClose, submitting };
  }, [onClose, submitting]);

  useEffect(() => {
    if (!target) return undefined;
    setHours(24);
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      } else {
        dialogRef.current?.focus();
      }
    });

    const handleKeyDown = (event) => {
      const currentHandlers = handlersRef.current;
      if (event.key === 'Escape') {
        if (!currentHandlers.submitting) {
          event.preventDefault();
          currentHandlers.onClose?.();
        }
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first || document.activeElement === dialog) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [target]);

  if (!target) return null;

  const targetName = [target.firstName, target.lastName].filter(Boolean).join(' ') || target.name || 'Usuario';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
          <h3 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
            Silenciar Usuario (Moderación)
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-200"
            aria-label="Cerrar modal de silenciamiento"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <p id={descId} className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Aplica una sanción disciplinaria institucional a <strong>{targetName}</strong> impidiéndole publicar o comentar en la plataforma durante el período seleccionado.
        </p>

        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Duración de la sanción
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                type="button"
                onClick={() => setHours(opt.hours)}
                disabled={submitting}
                className={`rounded-xl border py-2 text-xs font-bold transition disabled:opacity-50 ${
                  hours === opt.hours
                    ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(hours)}
            disabled={submitting}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? 'Silenciando...' : `Confirmar silencio (${hours} hs)`}
          </button>
        </div>
      </div>
    </div>
  );
};
