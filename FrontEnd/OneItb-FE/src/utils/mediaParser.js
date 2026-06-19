const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION = /[),.!?;:]+$/;

const getYouTubeId = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    let candidate = null;

    if (host === 'youtu.be') {
      candidate = url.pathname.split('/').filter(Boolean)[0];
    } else if (YOUTUBE_HOSTS.has(host)) {
      if (url.pathname === '/watch') {
        candidate = url.searchParams.get('v');
      } else {
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments[0] === 'shorts' || segments[0] === 'embed') {
          candidate = segments[1];
        }
      }
    }

    return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

export const parseYouTubeContent = (content = '') => {
  let videoId = null;
  const text = content.replace(URL_PATTERN, (match) => {
    if (videoId) return match;

    const trailing = match.match(TRAILING_PUNCTUATION)?.[0] ?? '';
    const candidate = trailing ? match.slice(0, -trailing.length) : match;
    const parsedId = getYouTubeId(candidate);
    if (!parsedId) return match;

    videoId = parsedId;
    return trailing;
  });

  return {
    text: text
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .trim(),
    videoId,
  };
};

export const getFileExtension = (fileUrl = '') => {
  try {
    const pathname = new URL(fileUrl, 'https://oneitb.local').pathname;
    const fileName = pathname.split('/').filter(Boolean).pop() ?? '';
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
  } catch {
    return '';
  }
};

export const getMediaType = (fileUrl) => {
  const extension = getFileExtension(fileUrl);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (['ppt', 'pptx'].includes(extension)) return 'ppt';
  return 'document';
};

export const getFileName = (fileUrl = '') => {
  try {
    const pathname = new URL(fileUrl, 'https://oneitb.local').pathname;
    const encodedName = pathname.split('/').filter(Boolean).pop();
    return encodedName ? decodeURIComponent(encodedName) : 'Archivo adjunto';
  } catch {
    return 'Archivo adjunto';
  }
};
