import {
  BrowserCacheLocation,
  EventType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { resolveMicrosoftEntraConfig } from './microsoftEntraConfig';

export const microsoftEntraConfiguration = resolveMicrosoftEntraConfig(
  import.meta.env,
  typeof window === 'undefined' ? '' : window.location.origin,
);
export const isMicrosoftEntraConfigured =
  microsoftEntraConfiguration.isConfigured;

let msalInstance = isMicrosoftEntraConfigured
  ? new PublicClientApplication({
      auth: {
        clientId: microsoftEntraConfiguration.clientId,
        authority: microsoftEntraConfiguration.authority,
        redirectUri: microsoftEntraConfiguration.redirectUri,
        postLogoutRedirectUri: microsoftEntraConfiguration.loginUri,
        navigateToLoginRequestUrl: false,
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
let accountEventCallbackId = null;

export const microsoftLoginRequest = Object.freeze({
  scopes: isMicrosoftEntraConfigured
    ? [microsoftEntraConfiguration.apiScope]
    : [],
  prompt: 'select_account',
});

export const initializeMicrosoftIdentity = async () => {
  if (!msalInstance || initialized) return Boolean(msalInstance);

  try {
    await msalInstance.initialize();
    accountEventCallbackId ??= msalInstance.addEventCallback((event) => {
      const isAuthenticationSuccess = event.eventType === EventType.LOGIN_SUCCESS
        || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS;
      if (isAuthenticationSuccess && event.payload?.account) {
        msalInstance?.setActiveAccount(event.payload.account);
      }
    });
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
