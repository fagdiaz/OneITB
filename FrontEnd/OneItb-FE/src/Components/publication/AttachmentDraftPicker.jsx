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
    if (!['image', 'video'].includes(type)) {
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
    <div className={`${compact ? 'h-20' : 'h-28'} flex w-full flex-col items-center justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300`}>
      <i className="fa-solid fa-file-pdf text-2xl" />
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">PDF</span>
    </div>
  );
};

export const AttachmentDraftPicker = ({
  files,
  onChange,
  onError,
  compact = false,
  allowCoverSelection = false,
  coverFileIdentity = null,
  onCoverChange,
}) => {
  const inputId = useId();
  const normalizedFiles = files ?? [];
  const totalSize = normalizedFiles.reduce((total, file) => total + file.size, 0);
  const [isDragActive, setIsDragActive] = useState(false);

  const mergeSelectedFiles = (selected) => {
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

  const handleSelection = (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    mergeSelectedFiles(selected);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    mergeSelectedFiles(Array.from(event.dataTransfer?.files ?? []));
  };

  return (
    <div
      className={`space-y-2 rounded-xl border border-dashed p-2 transition ${
        isDragActive
          ? 'border-blue-400 bg-blue-50/80 dark:border-blue-300/50 dark:bg-blue-500/10'
          : 'border-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="attachment-dropzone"
      aria-label="Zona para adjuntar archivos"
    >
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
        <span className={`text-xs font-medium ${isDragActive ? 'text-blue-600 dark:text-blue-200' : 'text-slate-400'}`}>
          {isDragActive ? 'Solta los archivos para adjuntarlos' : 'Tambien podes arrastrar archivos aca'}
        </span>
      </div>

      {normalizedFiles.length > 0 && (
        <ul className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {normalizedFiles.map((file) => {
            const identity = getFileIdentity(file);
            const isCover = coverFileIdentity === identity;
            return (
            <li
              key={identity}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70"
            >
              <LocalFilePreview file={file} compact={compact} />
              <div className="min-w-0 px-2.5 py-2">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200" title={file.name}>{file.name}</p>
                <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
                {allowCoverSelection && (
                  <button
                    type="button"
                    onClick={() => onCoverChange?.(identity)}
                    aria-pressed={isCover}
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition ${
                      isCover
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:bg-white/10 dark:text-slate-300'
                    }`}
                  >
                    <i className={`fa-${isCover ? 'solid' : 'regular'} fa-star`} />
                    {isCover ? 'Portada' : 'Usar de portada'}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextFiles = normalizedFiles.filter((item) => getFileIdentity(item) !== identity);
                  onChange(nextFiles);
                  if (isCover) onCoverChange?.(nextFiles[0] ? getFileIdentity(nextFiles[0]) : null);
                }}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-xs text-white shadow transition hover:bg-red-600"
                aria-label={`Quitar ${file.name}`}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
