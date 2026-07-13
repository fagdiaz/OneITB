import React, { useEffect, useId, useRef } from 'react';

export const MediaGalleryModal = ({ isOpen, onClose, items, renderItem }) => {
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Galeria</p>
            <h2 id={titleId} className="text-lg font-bold text-slate-950 dark:text-white">Todos los archivos adjuntos</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar galeria" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white">
            <i className="fa-solid fa-xmark" />
          </button>
        </header>
        <div className="grid flex-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={item.key} className="min-h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              {renderItem(item, index, true)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
