export const buildPostShareUrl = (inquiryId, locationLike = window.location) => {
  if (!inquiryId) {
    throw new Error('No se pudo identificar la publicacion.');
  }

  const origin = locationLike.origin || `${locationLike.protocol}//${locationLike.host}`;
  const url = new URL(`/post/${encodeURIComponent(inquiryId)}`, origin);
  return url.toString();
};

export const copyPostShareUrl = async (inquiryId, {
  clipboard = navigator.clipboard,
  locationLike = window.location,
} = {}) => {
  if (!clipboard?.writeText) {
    throw new Error('El portapapeles no esta disponible en este navegador.');
  }

  const shareUrl = buildPostShareUrl(inquiryId, locationLike);
  await clipboard.writeText(shareUrl);
  return shareUrl;
};
