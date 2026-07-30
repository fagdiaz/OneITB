export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 10;
export const UPLOAD_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp,.zip,.mp4,.webm';

const ALLOWED_UPLOAD_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || '/graphql';
export const apiBaseUrl = graphqlUrl.replace(/\/graphql\/?$/, '');

export const getFileIdentity = (file) => `${file.name}:${file.size}:${file.lastModified}`;

export const validateAttachmentFiles = (files) => {
  const normalized = Array.from(files ?? []);
  if (normalized.length > MAX_UPLOAD_FILES) {
    throw new Error(`Podes adjuntar hasta ${MAX_UPLOAD_FILES} archivos.`);
  }

  const uniqueIds = new Set(normalized.map(getFileIdentity));
  if (uniqueIds.size !== normalized.length) {
    throw new Error('El mismo archivo fue seleccionado mas de una vez.');
  }

  const totalSize = normalized.reduce((total, file) => total + file.size, 0);
  if (totalSize > MAX_UPLOAD_SIZE) {
    throw new Error('Los archivos superan el limite total de 15 MB.');
  }

  normalized.forEach((file) => {
    if (!file || file.size <= 0) throw new Error('No se pueden adjuntar archivos vacios.');
    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
      throw new Error(`El tipo de archivo de ${file.name} no esta permitido.`);
    }
  });

  return normalized;
};

export const uploadAttachmentDescriptor = async (file, token) => {
  if (!file) return null;
  validateAttachmentFiles([file]);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${apiBaseUrl}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Error al subir el archivo.');
  }
  if (!payload.fileUrl) {
    throw new Error('El servidor no devolvio la URL del archivo.');
  }

  return {
    fileUrl: payload.fileUrl,
    originalFileName: payload.originalFileName || file.name,
    contentType: payload.contentType || file.type,
    size: Number(payload.size ?? file.size),
  };
};

export const uploadAttachment = async (file, token) => {
  const descriptor = await uploadAttachmentDescriptor(file, token);
  return descriptor?.fileUrl ?? null;
};

export const uploadAttachments = async (files, token) => {
  const normalized = validateAttachmentFiles(files);
  const uploaded = [];

  // Sequential uploads bound bandwidth and make the failing file deterministic.
  for (const file of normalized) {
    const descriptor = await uploadAttachmentDescriptor(file, token);
    uploaded.push({ ...descriptor, sortOrder: uploaded.length });
  }

  return uploaded;
};
