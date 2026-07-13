import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

const clampIndex = (index, length) => {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
};

export const MediaViewerModal = ({
  isOpen,
  onClose,
  type,
  src,
  title,
  videoId,
  galleryItems = [],
  initialIndex = 0,
}) => {
  const titleId = useId();
  const previouslyFocusedElement = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [pdfState, setPdfState] = useState({ status: 'idle', url: null, message: null });
  const normalizedGallery = useMemo(
    () => galleryItems.filter((item) => item?.src),
    [galleryItems],
  );
  const hasGallery = normalizedGallery.length > 0;
  const currentGalleryItem = hasGallery
    ? normalizedGallery[clampIndex(activeIndex, normalizedGallery.length)]
    : null;
  const activeType = hasGallery ? 'image' : type;
  const activeSrc = currentGalleryItem?.src || src;
  const activeTitle = currentGalleryItem?.title || title || 'Contenido multimedia';

  useEffect(() => {
    if (isOpen) setActiveIndex(clampIndex(initialIndex, normalizedGallery.length));
  }, [initialIndex, isOpen, normalizedGallery.length]);

  const moveGallery = useCallback((delta) => {
    if (normalizedGallery.length <= 1) return;
    setActiveIndex((current) => clampIndex(current + delta, normalizedGallery.length));
  }, [normalizedGallery.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    previouslyFocusedElement.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (hasGallery && event.key === 'ArrowLeft') moveGallery(-1);
      if (hasGallery && event.key === 'ArrowRight') moveGallery(1);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      const element = previouslyFocusedElement.current;
      if (element && document.contains(element) && typeof element.focus === 'function') element.focus();
      previouslyFocusedElement.current = null;
    };
  }, [hasGallery, isOpen, moveGallery, onClose]);

  useEffect(() => {
    if (!isOpen || activeType !== 'pdf' || !activeSrc) {
      setPdfState({ status: 'idle', url: null, message: null });
      return undefined;
    }

    if (activeSrc.startsWith('blob:')) {
      setPdfState({ status: 'ready', url: activeSrc, message: null });
      return undefined;
    }

    const controller = new AbortController();
    let objectUrl = null;
    let active = true;
    setPdfState({ status: 'loading', url: null, message: null });

    const loadPdf = async () => {
      try {
        const response = await fetch(activeSrc, { signal: controller.signal, credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfState({ status: 'ready', url: objectUrl, message: null });
      } catch (error) {
        if (!active || error.name === 'AbortError') return;
        setPdfState({
          status: 'error',
          url: null,
          message: 'No se pudo cargar la vista previa. Podes abrir el PDF en una pestaña nueva.',
        });
      }
    };
    loadPdf();

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeSrc, activeType, isOpen]);

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
        aria-labelledby={titleId}
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold" title={activeTitle}>{activeTitle}</p>
            {hasGallery && (
              <p className="text-xs text-slate-400" aria-live="polite">
                Imagen {clampIndex(activeIndex, normalizedGallery.length) + 1} de {normalizedGallery.length}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} autoFocus className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar visor">
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-2 sm:p-4">
          {activeType === 'youtube' && youtubeSrc && (
            <iframe
              src={youtubeSrc}
              title={activeTitle}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="aspect-video w-full max-w-5xl rounded-xl border-0"
            />
          )}
          {activeType === 'image' && activeSrc && (
            <img src={activeSrc} alt={activeTitle} className="max-h-[80vh] max-w-full object-contain" />
          )}
          {activeType === 'video' && activeSrc && (
            <video src={activeSrc} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl" />
          )}
          {activeType === 'pdf' && (
            <div className="flex h-[80vh] w-full items-center justify-center rounded-xl bg-white">
              {pdfState.status === 'loading' && <p className="text-sm font-semibold text-slate-500">Cargando PDF...</p>}
              {pdfState.status === 'ready' && pdfState.url && (
                <iframe src={`${pdfState.url}#page=1&view=FitH`} title={activeTitle} className="h-full w-full rounded-xl border-0 bg-white" />
              )}
              {pdfState.status === 'error' && (
                <div className="max-w-md p-6 text-center">
                  <i className="fa-solid fa-file-pdf text-4xl text-red-500" />
                  <p className="mt-3 text-sm text-slate-600">{pdfState.message}</p>
                  <a href={activeSrc} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir PDF</a>
                </div>
              )}
            </div>
          )}

          {hasGallery && normalizedGallery.length > 1 && (
            <>
              <button type="button" onClick={() => moveGallery(-1)} className="absolute left-2 flex h-14 w-10 items-center justify-center text-slate-100 drop-shadow-[0_3px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:left-4" aria-label="Imagen anterior">
                <i className="fa-solid fa-chevron-left text-3xl" />
              </button>
              <button type="button" onClick={() => moveGallery(1)} className="absolute right-2 flex h-14 w-10 items-center justify-center text-slate-100 drop-shadow-[0_3px_3px_rgba(0,0,0,0.95)] transition hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:right-4" aria-label="Imagen siguiente">
                <i className="fa-solid fa-chevron-right text-3xl" />
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
