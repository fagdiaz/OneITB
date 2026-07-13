import React, { useEffect, useRef, useState } from 'react';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export const calculatePdfScale = (pageWidth, targetWidth, maximumScale = 2) => {
  if (!Number.isFinite(pageWidth) || pageWidth <= 0 || !Number.isFinite(targetWidth) || targetWidth <= 0) return 1;
  return Math.min(targetWidth / pageWidth, maximumScale);
};

export const PdfFirstPageThumbnail = ({ src, title, compact = false }) => {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const element = hostRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRender(true);
        observer.disconnect();
      }
    }, { rootMargin: '160px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (!src || !shouldRender) return undefined;
    let cancelled = false;
    let loadingTask;
    let renderTask;

    const renderFirstPage = async () => {
      setStatus('loading');
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = pdfjs.getDocument({ url: src });
        const document = await loadingTask.promise;
        const page = await document.getPage(1);
        if (cancelled || !canvasRef.current || !hostRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(hostRef.current.clientWidth || (compact ? 280 : 680), 160);
        const viewport = page.getViewport({ scale: calculatePdfScale(baseViewport.width, availableWidth) });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas unavailable');

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        page.cleanup();
        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (!cancelled && error?.name !== 'RenderingCancelledException') setStatus('error');
      }
    };

    renderFirstPage();
    return () => {
      cancelled = true;
      renderTask?.cancel();
      loadingTask?.destroy();
    };
  }, [compact, shouldRender, src]);

  return (
    <div ref={hostRef} className={`relative flex w-full items-start justify-center overflow-hidden bg-slate-100 dark:bg-slate-900 ${compact ? 'h-40' : 'h-72'}`}>
      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <i className={`fa-solid ${status === 'error' ? 'fa-file-pdf text-red-500' : 'fa-spinner fa-spin'} text-3xl`} />
          <span className="max-w-[85%] truncate text-xs font-semibold">{status === 'error' ? 'Vista previa no disponible' : 'Preparando primera pagina...'}</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-label={`Primera pagina de ${title || 'documento PDF'}`} className={status === 'ready' ? 'max-w-full' : 'invisible'} />
    </div>
  );
};
