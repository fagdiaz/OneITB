import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationRoot } from './ApplicationRoot';

const PassthroughProvider = ({ children }) => children;

const ThrowingProvider = () => {
  throw new Error('provider initialization failed');
};

const ThrowingChild = () => {
  throw new Error('child render failed');
};

describe('ApplicationRoot bootstrap resilience', () => {
  const suppressExpectedRenderError = (event) => event.preventDefault();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.addEventListener('error', suppressExpectedRenderError);
  });

  afterEach(() => {
    window.removeEventListener('error', suppressExpectedRenderError);
    vi.restoreAllMocks();
  });

  it.each([
    ['Apollo client factory', {
      clientFactory: () => {
        throw new Error('client factory failed');
      },
    }],
    ['Apollo provider', {
      clientFactory: () => ({}),
      ApolloProviderComponent: ThrowingProvider,
    }],
    ['theme provider', {
      clientFactory: () => ({}),
      ApolloProviderComponent: PassthroughProvider,
      ThemeProviderComponent: ThrowingProvider,
    }],
  ])('renders the institutional fallback when %s fails', (_name, overrides) => {
    render(
      <ApplicationRoot {...overrides}>
        <p>Aplicación activa</p>
      </ApplicationRoot>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('La interfaz encontró un problema');
    expect(screen.queryByText('Aplicación activa')).not.toBeInTheDocument();
  });

  it('catches failures from the application child tree', () => {
    render(
      <ApplicationRoot
        clientFactory={() => ({})}
        ApolloProviderComponent={PassthroughProvider}
        ThemeProviderComponent={PassthroughProvider}
      >
        <ThrowingChild />
      </ApplicationRoot>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('La interfaz encontró un problema');
  });

  it('creates one client across parent rerenders', () => {
    const client = {};
    const clientFactory = vi.fn(() => client);
    const providers = {
      clientFactory,
      ApolloProviderComponent: PassthroughProvider,
      ThemeProviderComponent: PassthroughProvider,
    };
    const { rerender } = render(
      <ApplicationRoot {...providers}>
        <p>Primera vista</p>
      </ApplicationRoot>,
    );

    rerender(
      <ApplicationRoot {...providers}>
        <p>Segunda vista</p>
      </ApplicationRoot>,
    );

    expect(clientFactory).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Segunda vista')).toBeInTheDocument();
  });
});
