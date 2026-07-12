import React, { useEffect, useId, useState } from 'react';
import { getMediaType } from '../../utils/mediaParser';
import {
  getFileIdentity,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE,
  UPLOAD_ACCEPT,
  validateAttachmentFiles,
} from '../../utils/uploadFile';

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LocalFilePreview = ({ file, compact }) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const type = getMediaType(file.name, file.type);

  useEffect(() => {
    if (!['image', 'video', 'pdf'].includes(type)) {
      setObjectUrl(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file, type]);

  if (!objectUrl) {
    return (
      <div className="flex h-20 items-center justify-center bg-slate-100 text-2xl text-slate-400 dark:bg-white/[0.04] dark:text-slate-500">
        <i className="fa-solid fa-file-lines" />
      </div>
    );
  }

  if (type === 'image') {
    return <img src={objectUrl} alt={`Vista previa de ${file.name}`} className={`${compact ? 'h-20' : 'h-28'} w-full object-cover`} />;
  }

  if (type === 'video') {
    return <video src={objectUrl} muted controls className={`${compact ? 'h-20' : 'h-28'} w-full bg-slate-950 object-contain`} />;
  }

  return (
    <iframe
      src={`${objectUrl}#page=1&toolbar=0&navpanes=0`}
      title={`Primera pagina de ${file.name}`}
      className={`${compact ? 'h-20' : 'h-28'} w-full border-0 bg-white`}
    />
  );
};

export const AttachmentDraftPicker = ({ files, onChange, onError, compact = false }) => {
  const inputId = useId();
  const normalizedFiles = files ?? [];
  const totalSize = normalizedFiles.reduce((total, file) => total + file.size, 0);

  const handleSelection = (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selected.length === 0) return;

    const existingIds = new Set(normalizedFiles.map(getFileIdentity));
    const uniqueSelected = selected.filter((file) => !existingIds.has(getFileIdentity(file)));
    if (uniqueSelected.length === 0) {
      onError?.('Los archivos seleccionados ya estaban adjuntos.');
      return;
    }

    try {
      const merged = validateAttachmentFiles([...normalizedFiles, ...uniqueSelected]);
      onError?.(null);
      onChange(merged);
    } catch (error) {
      onError?.(error.message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={inputId}
          type="file"
          multiple
          accept={UPLOAD_ACCEPT}
          onChange={handleSelection}
          className="hidden"
        />
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/15 ${compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2 text-sm'}`}
        >
          <i className="fa-solid fa-paperclip" />
          {compact ? 'Adjuntar' : 'Adjuntar archivos'}
        </label>
        <span className="text-xs text-slate-400">
          {normalizedFiles.length}/{MAX_UPLOAD_FILES} · {formatSize(totalSize)} de {formatSize(MAX_UPLOAD_SIZE)}
        </span>
      </div>

      {normalizedFiles.length > 0 && (
        <ul className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {normalizedFiles.map((file) => (
            <li
              key={getFileIdentity(file)}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70"
            >
              <LocalFilePreview file={file} compact={compact} />
              <div className="min-w-0 px-2.5 py-2">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200" title={file.name}>{file.name}</p>
                <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(normalizedFiles.filter((item) => getFileIdentity(item) !== getFileIdentity(file)))}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-xs text-white shadow transition hover:bg-red-600"
                aria-label={`Quitar ${file.name}`}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
