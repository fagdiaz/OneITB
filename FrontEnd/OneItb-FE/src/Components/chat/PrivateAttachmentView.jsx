import React, { useEffect, useState } from 'react';
import { fetchPrivateAttachmentBlobUrl } from '../../utils/uploadFile';

export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const PrivateAttachmentView = ({ attachment, token, isOwn }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isImage = attachment.contentType?.startsWith('image/');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (isImage && attachment.id && !attachment.id.startsWith('optimistic-')) {
      setLoading(true);
      fetchPrivateAttachmentBlobUrl(attachment.id, token, controller.signal)
        .then((url) => {
          if (active) {
            setBlobUrl(url);
            setLoading(false);
          } else {
            URL.revokeObjectURL(url);
          }
        })
        .catch(() => {
          if (active) {
            setError(true);
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
      controller.abort();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [attachment.id, attachment.contentType, token]);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let url = blobUrl;
      let shouldRevoke = false;
      if (!url) {
        url = await fetchPrivateAttachmentBlobUrl(attachment.id, token);
        shouldRevoke = true;
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name || 'archivo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch {
      alert('No se pudo descargar el archivo adjunto.');
    }
  };

  if (isImage) {
    if (loading) {
      return (
        <div className="flex h-32 w-48 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-white/10">
          <i className="fa-solid fa-spinner fa-spin text-slate-400" />
        </div>
      );
    }
    if (error || !blobUrl) {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 p-2 text-xs text-red-200">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>Error al cargar imagen</span>
        </div>
      );
    }
    return (
      <div className="group relative mt-1 overflow-hidden rounded-xl">
        <img
          src={blobUrl}
          alt={attachment.name || 'Imagen adjunta'}
          className="max-h-48 max-w-full rounded-xl object-contain cursor-pointer transition hover:opacity-95"
          onClick={() => window.open(blobUrl, '_blank')}
        />
        <button
          type="button"
          onClick={handleDownload}
          className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
          title="Descargar imagen"
          aria-label={`Descargar ${attachment.name}`}
        >
          <i className="fa-solid fa-download mr-1" />
          {formatFileSize(attachment.size)}
        </button>
      </div>
    );
  }

  // Document (PDF or other)
  return (
    <div
      onClick={handleDownload}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleDownload(e);
      }}
      className={`mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition ${
        isOwn
          ? 'border-blue-400/30 bg-blue-700/50 hover:bg-blue-700/70 text-white'
          : 'border-slate-200 bg-slate-100/80 hover:bg-slate-200/70 text-slate-800 dark:border-white/10 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-slate-100'
      }`}
      aria-label={`Descargar archivo ${attachment.name}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-500 dark:bg-red-500/20 dark:text-red-300">
        <i className="fa-solid fa-file-pdf text-lg" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold leading-tight">{attachment.name}</p>
        <p className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>
          {formatFileSize(attachment.size)}
        </p>
      </div>
      <i className={`fa-solid fa-download text-xs ${isOwn ? 'text-blue-200' : 'text-slate-400'}`} />
    </div>
  );
};
