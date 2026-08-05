import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  beginMicrosoftRedirectFlow,
  clearMicrosoftRedirectFlow,
} from '../../auth/microsoftRedirectFlow';
import { MicrosoftRedirectBoundary } from './MicrosoftRedirectBoundary';

const msalState = vi.hoisted(() => ({
  accounts: [],
  inProgress: 'none',
  instance: { getActiveAccount: vi.fn(() => null) },
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => msalState,
}));

vi.mock('./MicrosoftRedirectCallback', () => ({
  MicrosoftRedirectCallback: () => <div>Procesando retorno institucional</div>,
}));

const renderBoundary = () => render(
  <MemoryRouter initialEntries={['/login']}>
    <MicrosoftRedirectBoundary>
      <div>Formulario de acceso</div>
    </MicrosoftRedirectBoundary>
  </MemoryRouter>,
);

describe('MicrosoftRedirectBoundary', () => {
  beforeEach(() => {
    sessionStorage.clear();
    msalState.accounts = [];
    msalState.inProgress = 'none';
    msalState.instance.getActiveAccount.mockReset().mockReturnValue(null);
  });

  it('renders normal routes when no institutional redirect is pending', () => {
    renderBoundary();
    expect(screen.getByText('Formulario de acceso')).toBeInTheDocument();
  });

  it('hides Login while MSAL is handling a pending redirect', () => {
    beginMicrosoftRedirectFlow('/feed');
    msalState.inProgress = 'handleRedirect';

    renderBoundary();

    expect(screen.getByText('Procesando retorno institucional')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de acceso')).not.toBeInTheDocument();
  });

  it('restores normal routes when redirect initiation is cancelled', () => {
    const flow = beginMicrosoftRedirectFlow('/feed');
    msalState.inProgress = 'login';
    renderBoundary();
    expect(screen.getByText('Procesando retorno institucional')).toBeInTheDocument();

    act(() => clearMicrosoftRedirectFlow(flow.id));

    expect(screen.getByText('Formulario de acceso')).toBeInTheDocument();
  });
});
