const SAFE_ORIGIN = 'https://oneitb.local';
const ENCODED_BACKSLASH_PATTERN = /%5c/i;

export const getSafeInternalPath = (value, fallback = null) => {
  if (typeof value !== 'string') return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith('/')
    || candidate.startsWith('//')
    || candidate.includes('\\')
    || ENCODED_BACKSLASH_PATTERN.test(candidate)
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, SAFE_ORIGIN);
    if (parsed.origin !== SAFE_ORIGIN || parsed.username || parsed.password) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
};
