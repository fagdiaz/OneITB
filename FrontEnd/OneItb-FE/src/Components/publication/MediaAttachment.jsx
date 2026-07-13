import React, { useEffect, useState } from 'react';
import { getFileName, getMediaType } from '../../utils/mediaParser';
import { apiBaseUrl } from '../../utils/uploadFile';
import { MediaViewerModal } from './MediaViewerModal';
import { PdfFirstPageThumbnail } from './PdfFirstPageThumbnail';

const fileStyles = {
  image: { icon: 'fa-file-image', iconClass: 'bg-emerald-50 text-emerald-600', label: 'Imagen' },
  video: { icon: 'fa-file-video', iconClass: 'bg-violet-50 text-violet-600', label: 'Video' },
  pdf: { icon: 'fa-file-pdf', iconClass: 'bg-red-50 text-red-600', label: 'Documento PDF' },
  ppt: { icon: 'fa-file-powerpoint', iconClass: 'bg-orange-50 text-orange-600', label: 'Presentacion' },
  document: { icon: 'fa-file-lines', iconClass: 'bg-blue-50 text-blue-600', label: 'Documento' },
};

export const resolveMediaUrl = (fileUrl) => fileUrl?.startsWith('http')
  ? fileUrl
  : `${apiBaseUrl}${fileUrl}`;

export const YouTubeEmbed = ({ videoId, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setThumbnailFailed(false);
  }, [videoId]);

  if (!videoId) return null;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative isolate flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm ${compact ? 'min-h-40 p-4' : 'aspect-video p-6'}`}
        aria-label="Reproducir video de YouTube"
      >
        {!thumbnailFailed && (
          <img
            src={thumbnailUrl}
            alt="Miniatura de video de YouTube"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setThumbnailFailed(true)}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80"
          />
        )}
        <span className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/20" />
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg ring-4 ring-white/20 transition group-hover:scale-105">
          <i className="fa-solid fa-play ml-0.5 text-lg" />
        </span>
        <span className="text-sm font-semibold">Video de YouTube</span>
        <span className="mt-1 text-xs text-slate-300">Abrir reproductor</span>
      </button>
      <MediaViewerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type="youtube"
        videoId={videoId}
        title="Video de YouTube"
      />
    </>
  );
};

export const MediaAttachment = ({
  attachment,
  fileUrl,
  compact = false,
  featured = false,
  galleryItems = [],
  galleryIndex = 0,
  tile = false,
}) => {
  const descriptor = attachment ?? { fileUrl };
  const sourceUrl = descriptor?.fileUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setViewerOpen(false);
  }, [sourceUrl]);

  if (!sourceUrl) return null;

  const type = getMediaType(sourceUrl, descriptor.contentType);
  const absoluteUrl = resolveMediaUrl(sourceUrl);
  const fileName = getFileName(sourceUrl, descriptor.originalFileName);
  const canPreview = type === 'image' || type === 'video' || type === 'pdf';

  if (type === 'image' && !imageFailed) {
    return (
      <>
        <button type="button" onClick={() => setViewerOpen(true)} className={`block w-full overflow-hidden text-left ${tile ? 'h-full bg-slate-100 dark:bg-slate-700/60' : 'rounded-lg'}`}>
          <img
            src={absoluteUrl}
            alt={`Archivo adjunto: ${fileName}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className={tile
              ? `h-full w-full cursor-zoom-in ${featured ? 'object-contain' : 'object-cover'}`
              : compact
              ? 'max-h-48 w-auto max-w-full cursor-zoom-in rounded-md object-contain'
              : featured
                ? 'max-h-[32rem] w-full cursor-zoom-in rounded-lg object-contain'
                : 'max-h-72 w-full cursor-zoom-in rounded-lg object-cover'}
          />
        </button>
        <MediaViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          type="image"
          src={absoluteUrl}
          title={fileName}
          galleryItems={galleryItems}
          initialIndex={galleryIndex}
        />
      </>
    );
  }

  if (type === 'video') {
    return (
      <>
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className={`group relative block w-full overflow-hidden bg-slate-950 ${tile ? 'h-full' : 'rounded-lg'}`}
        >
          <video src={absoluteUrl} muted preload="metadata" className={`${tile ? 'h-full' : compact ? 'max-h-48' : 'max-h-96'} w-full object-cover opacity-80`} />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition group-hover:scale-105">
              <i className="fa-solid fa-play ml-0.5" />
            </span>
          </span>
        </button>
        <MediaViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          type="video"
          src={absoluteUrl}
          title={fileName}
        />
      </>
    );
  }

  if (type === 'pdf' && tile) {
    return (
      <>
        <div className="group relative h-full min-h-36 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <PdfFirstPageThumbnail src={absoluteUrl} title={fileName} compact={compact} />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-3 pt-10 text-white">
            <span className="min-w-0 truncate text-xs font-semibold" title={fileName}>{fileName}</span>
            <span className="flex shrink-0 gap-1">
              <button type="button" onClick={() => setViewerOpen(true)} aria-label={`Ver ${fileName}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"><i className="fa-regular fa-eye" /></button>
              <a href={absoluteUrl} target="_blank" rel="noreferrer" download aria-label={`Descargar ${fileName}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"><i className="fa-solid fa-download" /></a>
            </span>
          </div>
        </div>
        <MediaViewerModal isOpen={viewerOpen} onClose={() => setViewerOpen(false)} type="pdf" src={absoluteUrl} title={fileName} />
      </>
    );
  }

  const style = fileStyles[type] ?? fileStyles.document;
  return (
    <>
      <div className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 ${compact ? 'p-2' : 'p-3'} dark:border-white/10 dark:bg-slate-900/60`}>
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${style.iconClass} ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
          <i className={`fa-solid ${style.icon} ${compact ? 'text-base' : 'text-xl'}`} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200" title={fileName}>{fileName}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">{imageFailed ? 'Imagen no disponible' : style.label}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {canPreview && (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/10"
            >
              <i className="fa-regular fa-eye" />
              {!compact && 'Ver'}
            </button>
          )}
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50 dark:bg-slate-950 dark:text-blue-300 dark:ring-white/10 dark:hover:bg-blue-500/10"
          >
            <i className="fa-solid fa-download" />
            {!compact && 'Descargar'}
          </a>
        </div>
      </div>
      <MediaViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        type={type}
        src={absoluteUrl}
        title={fileName}
      />
    </>
  );
};
