import { describe, expect, it } from 'vitest';
import { resolveMicrosoftEntraConfig } from './microsoftEntraConfig';

const tenantGuid = '11111111-1111-4111-8111-111111111111';
const canonicalClientId = '22222222-2222-4222-8222-222222222222';
const legacyClientId = '33333333-3333-4333-8333-333333333333';

const completeEnvironment = {
  VITE_ENTRA_TENANT_ID: tenantGuid,
  VITE_ENTRA_CLIENT_ID: canonicalClientId,
  VITE_ENTRA_API_SCOPE: 'api://22222222-2222-4222-8222-222222222222/access_as_user',
  VITE_ENTRA_REDIRECT_URI: 'http://localhost:5173/auth/microsoft/callback',
};

describe('resolveMicrosoftEntraConfig', () => {
  it('uses the canonical client ID and gives it precedence over the legacy alias', () => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      VITE_MICROSOFT_CLIENT_ID: legacyClientId,
    });

    expect(configuration).toMatchObject({
      clientId: canonicalClientId,
      clientIdSource: 'canonical',
      isConfigured: true,
    });
  });

  it('uses the legacy alias only when the canonical value is blank', () => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      VITE_ENTRA_CLIENT_ID: '   ',
      VITE_MICROSOFT_CLIENT_ID: ` ${legacyClientId} `,
    });

    expect(configuration.clientId).toBe(legacyClientId);
    expect(configuration.clientIdSource).toBe('legacy');
    expect(configuration.isConfigured).toBe(true);
  });

  it('accepts the explicit common authority for multi-tenant Microsoft 365', () => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      VITE_ENTRA_TENANT_ID: ' COMMON ',
    });

    expect(configuration.isConfigured).toBe(true);
    expect(configuration.authority).toBe(
      'https://login.microsoftonline.com/common',
    );
  });

  it.each([
    ['missing tenant', { VITE_ENTRA_TENANT_ID: '' }],
    ['unsupported tenant alias', { VITE_ENTRA_TENANT_ID: 'organizations' }],
    ['invalid client ID', { VITE_ENTRA_CLIENT_ID: 'not-a-guid' }],
    ['missing scope', { VITE_ENTRA_API_SCOPE: '' }],
    ['invalid scope', { VITE_ENTRA_API_SCOPE: 'api://scope with spaces' }],
    ['invalid redirect', { VITE_ENTRA_REDIRECT_URI: 'javascript:alert(1)' }],
    ['legacy login redirect', { VITE_ENTRA_REDIRECT_URI: 'http://localhost:5173/login' }],
  ])('fails closed for %s', (_name, override) => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      ...override,
    });

    expect(configuration.isConfigured).toBe(false);
  });

  it('derives the dedicated callback and login URI from the current origin', () => {
    const configuration = resolveMicrosoftEntraConfig(
      {
        ...completeEnvironment,
        VITE_ENTRA_REDIRECT_URI: '',
      },
      'https://oneitb.example',
    );

    expect(configuration.redirectUri).toBe(
      'https://oneitb.example/auth/microsoft/callback',
    );
    expect(configuration.loginUri).toBe('https://oneitb.example/login');
    expect(configuration.isConfigured).toBe(true);
  });

  it.each([
    'http://localhost:5173/auth/microsoft/callback',
    'http://127.0.0.1:5173/auth/microsoft/callback',
    'https://oneitb.example/auth/microsoft/callback',
  ])('accepts a secure callback boundary for %s', (redirectUri) => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      VITE_ENTRA_REDIRECT_URI: redirectUri,
    });

    expect(configuration.redirectUri).toBe(redirectUri);
    expect(configuration.isConfigured).toBe(true);
  });

  it.each([
    'http://oneitb.example/auth/microsoft/callback',
    'http://localhost:5173/auth/microsoft/callback?returnTo=/feed',
    'http://localhost:5173/auth/microsoft/callback#token',
    'http://user:password@localhost:5173/auth/microsoft/callback',
  ])('rejects an unsafe callback boundary for %s', (redirectUri) => {
    const configuration = resolveMicrosoftEntraConfig({
      ...completeEnvironment,
      VITE_ENTRA_REDIRECT_URI: redirectUri,
    });

    expect(configuration.redirectUri).toBe('');
    expect(configuration.isConfigured).toBe(false);
  });

  it('fails closed when neither redirect nor a valid origin can be resolved', () => {
    const configuration = resolveMicrosoftEntraConfig(
      {
        ...completeEnvironment,
        VITE_ENTRA_REDIRECT_URI: '',
      },
      'not-an-origin',
    );

    expect(configuration.redirectUri).toBe('');
    expect(configuration.isConfigured).toBe(false);
  });
});
