import {
  BrowserCacheLocation,
  PublicClientApplication,
} from '@azure/msal-browser';

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID?.trim() || '';
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID?.trim() || '';
const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE?.trim() || '';
const configuredRedirectUri = import.meta.env.VITE_ENTRA_REDIRECT_URI?.trim();
const redirectUri = configuredRedirectUri ||
  (typeof window === 'undefined' ? '' : `${window.location.origin}/login`);

export const isMicrosoftEntraConfigured = Boolean(
  guidPattern.test(tenantId) &&
  guidPattern.test(clientId) &&
  apiScope.startsWith('api://') &&
  apiScope.length <= 256 &&
  redirectUri,
);

let msalInstance = isMicrosoftEntraConfigured
  ? new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
        postLogoutRedirectUri: redirectUri,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage,
        storeAuthStateInCookie: false,
      },
      system: {
        allowPlatformBroker: false,
      },
    })
  : null;
let initialized = false;

export const microsoftLoginRequest = Object.freeze({
  scopes: isMicrosoftEntraConfigured ? [apiScope] : [],
  prompt: 'select_account',
});

export const initializeMicrosoftIdentity = async () => {
  if (!msalInstance || initialized) return Boolean(msalInstance);

  try {
    await msalInstance.initialize();
    initialized = true;
    return true;
  } catch {
    msalInstance = null;
    initialized = false;
    return false;
  }
};

export const getMicrosoftIdentityInstance = () => (
  initialized ? msalInstance : null
);

export const isMicrosoftIdentityAvailable = () => (
  initialized && Boolean(msalInstance)
);

export const clearMicrosoftIdentitySession = async () => {
  if (!msalInstance) return;

  try {
    if (!initialized) {
      await msalInstance.initialize();
      initialized = true;
    }
    await msalInstance.clearCache();
  } catch {
    // Local OneITB session cleanup must continue even if browser storage is unavailable.
  }
};
