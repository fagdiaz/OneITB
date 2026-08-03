const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MICROSOFT_CALLBACK_PATH = '/auth/microsoft/callback';
export const MICROSOFT_LOGIN_PATH = '/login';

const trimmed = (value) => (
  typeof value === 'string' ? value.trim() : ''
);

const resolveRedirectUri = (configuredValue, origin) => {
  const configured = trimmed(configuredValue);

  try {
    const candidate = configured || (
      trimmed(origin)
        ? new URL(MICROSOFT_CALLBACK_PATH, trimmed(origin)).toString()
        : ''
    );
    if (!candidate) return '';
    const parsed = new URL(candidate);
    const isHttp = ['http:', 'https:'].includes(parsed.protocol);
    const isDedicatedCallback = parsed.pathname === MICROSOFT_CALLBACK_PATH
      && !parsed.search
      && !parsed.hash;
    return isHttp && isDedicatedCallback ? parsed.toString() : '';
  } catch {
    return '';
  }
};

const resolveLoginUri = (redirectUri) => {
  try {
    return redirectUri
      ? new URL(MICROSOFT_LOGIN_PATH, redirectUri).toString()
      : '';
  } catch {
    return '';
  }
};

export const resolveMicrosoftEntraConfig = (
  environment = {},
  origin = '',
) => {
  const rawTenantId = trimmed(environment.VITE_ENTRA_TENANT_ID);
  const tenantId = rawTenantId.toLowerCase() === 'common'
    ? 'common'
    : rawTenantId;
  const canonicalClientId = trimmed(environment.VITE_ENTRA_CLIENT_ID);
  const legacyClientId = trimmed(environment.VITE_MICROSOFT_CLIENT_ID);
  const clientId = canonicalClientId || legacyClientId;
  const clientIdSource = canonicalClientId
    ? 'canonical'
    : legacyClientId
      ? 'legacy'
      : null;
  const apiScope = trimmed(environment.VITE_ENTRA_API_SCOPE);
  const redirectUri = resolveRedirectUri(
    environment.VITE_ENTRA_REDIRECT_URI,
    origin,
  );
  const loginUri = resolveLoginUri(redirectUri);
  const tenantIsValid = tenantId.toLowerCase() === 'common'
    || guidPattern.test(tenantId);
  const scopeIsValid = apiScope.startsWith('api://')
    && apiScope.length <= 256
    && !/\s/.test(apiScope);
  const isConfigured = Boolean(
    tenantIsValid
    && guidPattern.test(clientId)
    && scopeIsValid
    && redirectUri,
  );

  return Object.freeze({
    tenantId,
    clientId,
    clientIdSource,
    apiScope,
    redirectUri,
    loginUri,
    authority: isConfigured
      ? `https://login.microsoftonline.com/${tenantId}`
      : '',
    isConfigured,
  });
};

export const isMicrosoftEntraTenantSupported = (value) => {
  const tenantId = trimmed(value);
  return tenantId.toLowerCase() === 'common' || guidPattern.test(tenantId);
};
