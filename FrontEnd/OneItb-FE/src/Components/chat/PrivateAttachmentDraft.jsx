import React, { useRef } from 'react';
import { formatFileSize } from './PrivateAttachmentView';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);
const MAX_FILES = 4;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024;

export const PrivateAttachmentDraft = ({ draftFiles, setDraftFiles, onError, disabled }) => {
  const fileInputRef = useRef(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    if (draftFiles.length + selected.length > MAX_FILES) {
      onError?.(`Podes adjuntar hasta ${MAX_FILES} archivos por mensaje.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    for (const file of selected) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        onError?.(`El archivo "${file.name}" no está permitido. Solo se admiten imágenes (PNG, JPEG, WebP) y PDF.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size <= 0) {
        onError?.('No se pueden adjuntar archivos vacíos.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    const newTotal = [...draftFiles, ...selected].reduce((acc, f) => acc + f.size, 0);
    if (newTotal > MAX_TOTAL_SIZE) {
      onError?.('El tamaño total de los archivos adjuntos supera los 15 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onError?.('');
    setDraftFiles((prev) => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleFiles}
        className="hidden"
        disabled={disabled || draftFiles.length >= MAX_FILES}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || draftFiles.length >= MAX_FILES}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        title="Adjuntar archivo (PDF o Imagen)"
        aria-label="Adjuntar archivo"
      >
        <i className="fa-solid fa-paperclip text-xs" />
      </button>
    </>
  );
};

export const PrivateAttachmentPreviewList = ({ draftFiles, onRemove }) => {
  if (!draftFiles || draftFiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-t border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/60">
      {draftFiles.map((file, idx) => (
        <div
          key={`${file.name}-${idx}`}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200/60 bg-blue-50/80 px-2 py-1 text-xs text-blue-900 dark:border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-200"
        >
          <i className={file.type === 'application/pdf' ? 'fa-solid fa-file-pdf text-red-500' : 'fa-solid fa-image text-blue-500'} />
          <span className="max-w-[140px] truncate font-medium">{file.name}</span>
          <span className="text-[10px] text-blue-700 dark:text-blue-300">({formatFileSize(file.size)})</span>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="ml-1 text-slate-400 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            aria-label={`Quitar archivo ${file.name}`}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  );
};
