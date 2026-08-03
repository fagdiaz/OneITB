import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ inProgress: 'none' }));
const mocks = vi.hoisted(() => ({
  loginRedirect: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: { loginRedirect: mocks.loginRedirect },
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
    state.inProgress = 'none';
    sessionStorage.clear();
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.clearSession.mockResolvedValue(undefined);
  });

  it('starts one redirect and persists the safe return destination', async () => {
    mocks.loginRedirect.mockResolvedValue(undefined);
    render(
      <MicrosoftInstitutionalLogin
        returnTo="/academic?subject=3"
        onError={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Microsoft 365/i }));

    await waitFor(() => expect(mocks.loginRedirect).toHaveBeenCalledTimes(1));
    expect(mocks.loginRedirect).toHaveBeenCalledWith({
      scopes: ['api://oneitb/access_as_user'],
      prompt: 'select_account',
    });
    expect(sessionStorage.getItem('oneitb-microsoft-redirect-flow')).toContain(
      '/academic?subject=3',
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it.each(['startup', 'login', 'handleRedirect', 'acquireToken'])(
    'blocks a second action while MSAL is %s',
    (status) => {
      state.inProgress = status;
      render(<MicrosoftInstitutionalLogin onError={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      fireEvent.click(button);
      expect(mocks.loginRedirect).not.toHaveBeenCalled();
    },
  );

  it('shows explicit redirect handling copy', () => {
    state.inProgress = 'handleRedirect';
    render(<MicrosoftInstitutionalLogin onError={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Autenticando con Microsoft...' }),
    ).toBeDisabled();
  });

  it('clears transient state and permits retry after initiation failure', async () => {
    const onError = vi.fn();
    mocks.loginRedirect.mockRejectedValue(new Error('Redirect unavailable'));
    render(<MicrosoftInstitutionalLogin onError={onError} />);

    fireEvent.click(screen.getByRole('button', { name: /Microsoft 365/i }));

    await waitFor(() => expect(mocks.clearSession).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenLastCalledWith('Redirect unavailable');
    expect(sessionStorage.getItem('oneitb-microsoft-redirect-flow')).toBeNull();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
