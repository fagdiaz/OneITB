export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
export const UPLOAD_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp,.zip';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'https://localhost:44397/graphql';
export const apiBaseUrl = graphqlUrl.replace(/\/graphql\/?$/, '');

export const uploadAttachment = async (file, token) => {
  if (!file) return null;
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('El archivo supera el limite de 15 MB.');
  }

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

  return payload.fileUrl;
};
