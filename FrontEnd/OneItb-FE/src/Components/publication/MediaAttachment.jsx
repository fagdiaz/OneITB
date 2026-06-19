import React from 'react';
import { getFileName, getMediaType } from '../../utils/mediaParser';
import { apiBaseUrl } from '../../utils/uploadFile';

const fileStyles = {
  pdf: { icon: 'fa-file-pdf', iconClass: 'bg-red-50 text-red-600', label: 'Documento PDF' },
  ppt: { icon: 'fa-file-powerpoint', iconClass: 'bg-orange-50 text-orange-600', label: 'Presentacion' },
  document: { icon: 'fa-file-lines', iconClass: 'bg-blue-50 text-blue-600', label: 'Documento' },
};

export const resolveMediaUrl = (fileUrl) => fileUrl?.startsWith('http')
  ? fileUrl
  : `${apiBaseUrl}${fileUrl}`;

export const YouTubeEmbed = ({ videoId }) => {
  if (!videoId) return null;
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="Video de YouTube adjunto"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="aspect-video w-full rounded-lg border-0"
    />
  );
};

export const MediaAttachment = ({ fileUrl, compact = false }) => {
  if (!fileUrl) return null;

  const type = getMediaType(fileUrl);
  const absoluteUrl = resolveMediaUrl(fileUrl);
  const fileName = getFileName(fileUrl);

  if (type === 'image') {
    return (
      <a href={absoluteUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
        <img
          src={absoluteUrl}
          alt={`Archivo adjunto: ${fileName}`}
          loading="lazy"
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
