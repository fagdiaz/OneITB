import React, { useContext } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const graphQlProviderMock = vi.hoisted(() => {
  let terminationHandler = null;

  return {
    clearHandler: () => {
      terminationHandler = null;
    },
    api: {
      setToken: vi.fn(),
      setUser: vi.fn(),
      resetToken: vi.fn(),
      resetUser: vi.fn(),
      invalidateSessionTransport: vi.fn(() => Promise.resolve()),
      waitForSessionTermination: vi.fn(() => Promise.resolve()),
      resetSessionExpirationGuard: vi.fn(),
      registerSessionTerminationHandler: vi.fn((handler) => {
        terminationHandler = handler;
        return () => {
          if (terminationHandler === handler) terminationHandler = null;
        };
      }),
      requestSessionTermination: vi.fn((reason) => (
        terminationHandler ? terminationHandler(reason) : Promise.resolve()
      )),
    },
  };
});

const microsoftSessionMock = vi.hoisted(() => ({
  clearMicrosoftIdentitySession: vi.fn(() => Promise.resolve()),
}));

vi.mock('../data/graphql/GraphqlProvider', () => ({
  GraphQLProvider: graphQlProviderMock.api,
}));

vi.mock('../auth/microsoftEntra', () => microsoftSessionMock);

import { AuthContext, AuthProvider } from './AuthContext';

const SessionProbe = () => {
  const session = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(session.isLoading)}</span>
      <span data-testid="authenticated">{String(session.isAuthenticated)}</span>
      <span data-testid="user-id">{session.auth?.id || 'none'}</span>
      <span data-testid="user-role">{session.auth?.role || 'none'}</span>
      <button type="button" onClick={() => session.logout()}>logout</button>
      <button
        type="button"
        onClick={() => session.login('token-b', { id: 'user-b', role: 'Moderador' })}
      >
        login-b
      </button>
    </div>
  );
};

describe('AuthContext session isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    graphQlProviderMock.clearHandler();
    microsoftSessionMock.clearMicrosoftIdentitySession.mockClear();
    Object.values(graphQlProviderMock.api).forEach((value) => {
      value?.mockClear?.();
    });
  });

  it('discards malformed persisted identity instead of crashing hydration', async () => {
    localStorage.setItem('token', 'stale-token');
    localStorage.setItem('user', '{malformed');

    render(<AuthProvider><SessionProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('clears user A before accepting user B', async () => {
    localStorage.setItem('token', 'token-a');
    localStorage.setItem('user', JSON.stringify({ id: 'user-a', role: 'Estudiante' }));
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user-id')).toHaveTextContent('user-a'));

    await act(async () => {
      screen.getByRole('button', { name: 'logout' }).click();
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('token')).toBeNull();
    expect(graphQlProviderMock.api.invalidateSessionTransport).toHaveBeenCalledTimes(1);
    expect(microsoftSessionMock.clearMicrosoftIdentitySession).toHaveBeenCalledTimes(1);

    await act(async () => {
      screen.getByRole('button', { name: 'login-b' }).click();
    });
    expect(graphQlProviderMock.api.waitForSessionTermination).toHaveBeenCalled();
    expect(graphQlProviderMock.api.invalidateSessionTransport).toHaveBeenCalledTimes(2);
    expect(microsoftSessionMock.clearMicrosoftIdentitySession).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('user-id')).toHaveTextContent('user-b');
    expect(screen.getByTestId('user-role')).toHaveTextContent('Moderador');
    expect(localStorage.getItem('token')).toBe('token-b');
    expect(localStorage.getItem('user')).toContain('user-b');
  });
});
