import React from 'react';
import {
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  beginMicrosoftRedirectFlow,
  markMicrosoftRedirectFlowCompleted,
  resetMicrosoftRedirectCoordinatorForTests,
} from '../../auth/microsoftRedirectFlow';

const account = {
  homeAccountId: 'account-1',
  username: 'ana.perez@itbeltran.com.ar',
};
const state = vi.hoisted(() => ({
  accounts: [],
  authSession: {
    auth: {},
    isAuthenticated: false,
    sessionVersion: 0,
    token: null,
  },
  inProgress: 'none',
}));
const mocks = vi.hoisted(() => ({
  acquireTokenSilent: vi.fn(),
  clearSession: vi.fn(),
  exchange: vi.fn(),
  getActiveAccount: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  navigate: vi.fn(),
  setActiveAccount: vi.fn(),
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      acquireTokenSilent: mocks.acquireTokenSilent,
      getActiveAccount: mocks.getActiveAccount,
      setActiveAccount: mocks.setActiveAccount,
    },
    accounts: state.accounts,
    inProgress: state.inProgress,
  }),
}));

vi.mock('@azure/msal-browser', () => ({
  InteractionStatus: {
    None: 'none',
    Startup: 'startup',
    Login: 'login',
    HandleRedirect: 'handleRedirect',
    AcquireToken: 'acquireToken',
  },
}));

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [mocks.exchange, { loading: false }],
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    ...state.authSession,
    login: mocks.login,
    logout: mocks.logout,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../auth/microsoftEntra', () => ({
  microsoftLoginRequest: {
    scopes: ['api://oneitb/access_as_user'],
    prompt: 'select_account',
  },
  clearMicrosoftIdentitySession: mocks.clearSession,
}));

import { MicrosoftRedirectCallback } from './MicrosoftRedirectCallback';

const successfulExchange = () => {
  mocks.acquireTokenSilent.mockResolvedValue({ accessToken: 'delegated-api-token' });
  mocks.exchange.mockResolvedValue({
    data: {
      microsoftLogin: {
        token: 'oneitb-jwt',
        username: 'Ana Pérez',
        isAuthenticated: true,
        id: 'user-1',
        role: 'Estudiante',
        email: 'ana.perez@itbeltran.com.ar',
      },
    },
  });
  mocks.login.mockResolvedValue(undefined);
};

describe('MicrosoftRedirectCallback', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetMicrosoftRedirectCoordinatorForTests();
    state.accounts = [account];
    state.authSession = {
      auth: {},
      isAuthenticated: false,
      sessionVersion: 0,
      token: null,
    };
    state.inProgress = 'none';
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.clearSession.mockResolvedValue(undefined);
    mocks.getActiveAccount.mockReturnValue(null);
    mocks.logout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits while MSAL handles the redirect and renders no login action', () => {
    state.inProgress = 'handleRedirect';
    beginMicrosoftRedirectFlow('/feed');
    render(<MicrosoftRedirectCallback />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Procesando la respuesta de Microsoft...',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(mocks.acquireTokenSilent).not.toHaveBeenCalled();
  });

  it('exchanges the delegated access token and hydrates OneITB once', async () => {
    beginMicrosoftRedirectFlow('/academic');
    successfulExchange();
    const view = render(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.acquireTokenSilent).toHaveBeenCalledWith(expect.objectContaining({
      account,
      scopes: ['api://oneitb/access_as_user'],
      prompt: undefined,
    }));
    expect(mocks.exchange).toHaveBeenCalledTimes(1);
    expect(mocks.exchange).toHaveBeenCalledWith({
      variables: { accessToken: 'delegated-api-token' },
      context: {
        fetchOptions: { signal: expect.any(AbortSignal) },
      },
    });
    expect(mocks.login).toHaveBeenCalledWith(
      'oneitb-jwt',
      {
        id: 'user-1',
        username: 'Ana Pérez',
        email: 'ana.perez@itbeltran.com.ar',
        role: 'Estudiante',
      },
      { identityProvider: 'microsoft' },
    );

    state.authSession = {
      auth: { id: 'user-1', role: 'Estudiante' },
      isAuthenticated: true,
      sessionVersion: 1,
      token: 'oneitb-jwt',
    };
    view.rerender(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      '/academic',
      { replace: true },
    ));
  });

  it('deduplicates concurrent callback mounts', async () => {
    beginMicrosoftRedirectFlow('/feed');
    successfulExchange();
    const view = render(
      <>
        <MicrosoftRedirectCallback />
        <MicrosoftRedirectCallback />
      </>,
    );

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    expect(mocks.acquireTokenSilent).toHaveBeenCalledTimes(1);
    expect(mocks.exchange).toHaveBeenCalledTimes(1);
    expect(mocks.login).toHaveBeenCalledTimes(1);

    state.authSession = {
      auth: { id: 'user-1' },
      isAuthenticated: true,
      sessionVersion: 1,
      token: 'oneitb-jwt',
    };
    view.rerender(
      <>
        <MicrosoftRedirectCallback />
        <MicrosoftRedirectCallback />
      </>,
    );
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
  });

  it('falls back to feed for an unsafe requested destination', async () => {
    beginMicrosoftRedirectFlow('https://attacker.example');
    successfulExchange();
    const view = render(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    state.authSession = {
      auth: { id: 'user-1' },
      isAuthenticated: true,
      sessionVersion: 1,
      token: 'oneitb-jwt',
    };
    view.rerender(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      '/feed',
      { replace: true },
    ));
  });

  it('does not repeat the exchange after a completed callback reload', async () => {
    const flow = beginMicrosoftRedirectFlow('/profile');
    markMicrosoftRedirectFlowCompleted(flow);
    state.authSession = {
      auth: { id: 'persisted-user' },
      isAuthenticated: true,
      sessionVersion: 2,
      token: 'persisted-token',
    };
    render(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      '/profile',
      { replace: true },
    ));
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it('does not navigate while a different identity is committed', async () => {
    beginMicrosoftRedirectFlow('/feed');
    successfulExchange();
    const view = render(<MicrosoftRedirectCallback />);

    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    state.authSession = {
      auth: { id: 'previous-user' },
      isAuthenticated: true,
      sessionVersion: 1,
      token: 'previous-token',
    };
    view.rerender(<MicrosoftRedirectCallback />);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('cleans a partial session if React never commits the exchanged identity', async () => {
    vi.useFakeTimers();
    beginMicrosoftRedirectFlow('/feed');
    successfulExchange();
    render(<MicrosoftRedirectCallback />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mocks.login).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'OneITB no pudo confirmar la sesión',
    );
  });

  it('shows a controlled error and clears transient identity after failure', async () => {
    beginMicrosoftRedirectFlow('/feed');
    mocks.acquireTokenSilent.mockRejectedValue(new Error('Token acquisition failed'));
    render(<MicrosoftRedirectCallback />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Token acquisition failed',
    );
    expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('aborts a stalled backend exchange and exposes a recoverable timeout', async () => {
    vi.useFakeTimers();
    beginMicrosoftRedirectFlow('/feed');
    mocks.acquireTokenSilent.mockResolvedValue({ accessToken: 'delegated-api-token' });
    mocks.exchange.mockImplementation(({ context }) => new Promise((resolve, reject) => {
      context.fetchOptions.signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    }));
    render(<MicrosoftRedirectCallback />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mocks.exchange).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'OneITB no respondió a tiempo',
    );
    expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('fails safely when no redirect account exists', async () => {
    state.accounts = [];
    beginMicrosoftRedirectFlow('/feed');
    render(<MicrosoftRedirectCallback />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Microsoft no devolvió una cuenta válida',
    );
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it('fails closed instead of guessing when multiple accounts have no active account', async () => {
    state.accounts = [account, { ...account, homeAccountId: 'account-2' }];
    beginMicrosoftRedirectFlow('/feed');
    render(<MicrosoftRedirectCallback />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Microsoft devolvió varias cuentas',
    );
    expect(mocks.acquireTokenSilent).not.toHaveBeenCalled();
    expect(mocks.exchange).not.toHaveBeenCalled();
  });
});
