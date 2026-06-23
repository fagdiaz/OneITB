import React, { useEffect, useState } from 'react';
import { getFileName, getMediaType } from '../../utils/mediaParser';
import { apiBaseUrl } from '../../utils/uploadFile';

const fileStyles = {
  image: { icon: 'fa-file-image', iconClass: 'bg-emerald-50 text-emerald-600', label: 'Imagen' },
  pdf: { icon: 'fa-file-pdf', iconClass: 'bg-red-50 text-red-600', label: 'Documento PDF' },
  ppt: { icon: 'fa-file-powerpoint', iconClass: 'bg-orange-50 text-orange-600', label: 'Presentacion' },
  document: { icon: 'fa-file-lines', iconClass: 'bg-blue-50 text-blue-600', label: 'Documento' },
};

export const resolveMediaUrl = (fileUrl) => fileUrl?.startsWith('http')
  ? fileUrl
  : `${apiBaseUrl}${fileUrl}`;

export const YouTubeEmbed = ({ videoId, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setThumbnailFailed(false);
  }, [videoId]);

  if (!videoId) return null;

  if (!isPlaying) {
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <div
        className={`relative isolate flex flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm ${compact ? 'min-h-40 p-4' : 'aspect-video w-full p-6'}`}
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/20" />
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg ring-4 ring-white/20">
          <i className="fa-solid fa-play ml-0.5 text-lg" />
        </div>
        <p className="text-sm font-semibold">Video de YouTube</p>
        <p className="mt-1 max-w-sm text-center text-xs text-slate-300">
          El reproductor externo se carga solo al reproducir para mantener el feed liviano y reducir warnings de terceros.
        </p>
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Reproducir video
        </button>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
      title="Video de YouTube adjunto"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className="aspect-video w-full rounded-lg border-0"
    />
  );
};

export const MediaAttachment = ({ fileUrl, compact = false }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [fileUrl]);

  if (!fileUrl) return null;

  const type = getMediaType(fileUrl);
  const absoluteUrl = resolveMediaUrl(fileUrl);
  const fileName = getFileName(fileUrl);

  if (type === 'image' && !imageFailed) {
    return (
      <a href={absoluteUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
        <img
          src={absoluteUrl}
          alt={`Archivo adjunto: ${fileName}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className={compact
            ? 'max-h-48 w-auto max-w-full cursor-pointer rounded-md object-contain'
            : 'max-h-96 w-full cursor-pointer rounded-lg object-cover'}
        />
      </a>
    );
  }

  const style = fileStyles[type];
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 ${compact ? 'p-2' : 'p-3'}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-lg ${style.iconClass} ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
        <i className={`fa-solid ${style.icon} ${compact ? 'text-base' : 'text-xl'}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-700" title={fileName}>{fileName}</p>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{style.label}</p>
      </div>
      <a
        href={absoluteUrl}
        target="_blank"
        rel="noreferrer"
        download
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
      >
        <i className="fa-solid fa-download" />
        {!compact && 'Descargar'}
      </a>
    </div>
  );
};
