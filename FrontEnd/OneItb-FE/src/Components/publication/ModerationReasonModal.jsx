import React, { useEffect, useId, useRef, useState } from 'react';

export const ModerationReasonModal = ({ target, submitting = false, error, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const titleId = useId();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!target) return undefined;
    setReason('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [target, submitting, onClose]);

  if (!target) return null;
  const isValid = reason.trim().length >= 5;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">Moderacion institucional</p>
            <h2 id={titleId} className="mt-1 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Ocultar {target.kind === 'comment' ? 'comentario' : 'publicacion'}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Cerrar moderacion" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          El contenido dejara de verse en el muro. El texto original no se modifica y la decision quedara registrada en la auditoria.
        </p>
        <label className="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor={`${titleId}-reason`}>
          Motivo
        </label>
        <textarea
          ref={inputRef}
          id={`${titleId}-reason`}
          value={reason}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Describe el incumplimiento observado..."
          className="mt-2 min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-500/20"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Minimo 5 caracteres</span>
          <span>{reason.length}/500</span>
        </div>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Cancelar</button>
          <button type="button" onClick={() => onConfirm(reason.trim())} disabled={!isValid || submitting} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Ocultando...' : 'Confirmar y registrar'}
          </button>
        </div>
      </section>
    </div>
  );
};
