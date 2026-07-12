import React, { useEffect } from 'react';

export const MediaViewerModal = ({ isOpen, onClose, type, src, title, videoId }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const youtubeSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Visor multimedia'}
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <p className="min-w-0 truncate text-sm font-semibold" title={title}>{title || 'Contenido multimedia'}</p>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar visor"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-2 sm:p-4">
          {type === 'youtube' && youtubeSrc && (
            <iframe
              src={youtubeSrc}
              title={title || 'Video de YouTube'}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="aspect-video w-full max-w-5xl rounded-xl border-0"
            />
          )}
          {type === 'image' && src && (
            <img src={src} alt={title || 'Imagen adjunta'} className="max-h-[80vh] max-w-full object-contain" />
          )}
          {type === 'video' && src && (
            <video src={src} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl" />
          )}
          {type === 'pdf' && src && (
            <iframe
              src={`${src}#page=1&view=FitH`}
              title={title || 'Documento PDF'}
              className="h-[80vh] w-full rounded-xl border-0 bg-white"
            />
          )}
        </div>
      </section>
    </div>
  );
};
