import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loginPopup: vi.fn(),
  acquireTokenSilent: vi.fn(),
  exchange: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      loginPopup: mocks.loginPopup,
      acquireTokenSilent: mocks.acquireTokenSilent,
    },
    inProgress: 'none',
  }),
}));

vi.mock('@azure/msal-browser', () => ({
  InteractionStatus: { None: 'none' },
}));

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [mocks.exchange, { loading: false }],
}));

vi.mock('../../auth/microsoftEntra', () => ({
  microsoftLoginRequest: {
    scopes: ['api://oneitb/access_as_user'],
    prompt: 'select_account',
  },
  clearMicrosoftIdentitySession: mocks.clearSession,
}));

import { MicrosoftInstitutionalLogin } from './MicrosoftInstitutionalLogin';

describe('MicrosoftInstitutionalLogin', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.clearSession.mockResolvedValue(undefined);
  });

  it('exchanges only the API access token and returns the local OneITB session', async () => {
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    mocks.loginPopup.mockResolvedValue({
      accessToken: 'entra-api-token',
      account: { username: 'ana.perez@itbeltran.com.ar' },
    });
    mocks.exchange.mockResolvedValue({
      data: {
        microsoftLogin: {
          token: 'local-oneitb-jwt',
          username: 'Ana',
          isAuthenticated: true,
          id: 'user-1',
          role: 'Estudiante',
          email: 'ana.perez@itbeltran.com.ar',
        },
      },
    });

    render(
      <MicrosoftInstitutionalLogin
        onAuthenticated={onAuthenticated}
        onError={onError}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Microsoft 365/i }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    expect(mocks.exchange).toHaveBeenCalledWith({
      variables: { accessToken: 'entra-api-token' },
    });
    expect(onAuthenticated).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'local-oneitb-jwt' }),
      'ana.perez@itbeltran.com.ar',
    );
    expect(mocks.clearSession).not.toHaveBeenCalled();
  });

  it('clears transient Microsoft state after an exchange failure', async () => {
    const onAuthenticated = vi.fn();
    const onError = vi.fn();
    mocks.loginPopup.mockResolvedValue({
      accessToken: 'rejected-token',
      account: { username: 'ana.perez@itbeltran.com.ar' },
    });
    mocks.exchange.mockRejectedValue(new Error('Identidad rechazada'));

    render(
      <MicrosoftInstitutionalLogin
        onAuthenticated={onAuthenticated}
        onError={onError}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Microsoft 365/i }));

    await waitFor(() => expect(mocks.clearSession).toHaveBeenCalledTimes(1));
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(onError).toHaveBeenLastCalledWith('Identidad rechazada');
  });
});
