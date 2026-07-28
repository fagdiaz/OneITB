import React from 'react';
import { act, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootstrapApplication, ensureApplicationRoot } from './bootstrap';

describe('pre-mount bootstrap guard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('creates the root host when the document does not provide one', () => {
    const rootElement = ensureApplicationRoot();

    expect(rootElement).toBeInstanceOf(HTMLDivElement);
    expect(rootElement).toHaveAttribute('id', 'root');
    expect(document.body).toContainElement(rootElement);
  });

  it('renders the institutional fallback when the application module cannot load', async () => {
    let reactRoot;

    await act(async () => {
      reactRoot = await bootstrapApplication({
        loadApplication: () => Promise.reject(new Error('bootstrap import failed')),
      });
    });

    expect(screen.getByRole('alert')).toHaveTextContent('La interfaz encontró un problema');

    await act(async () => {
      reactRoot.unmount();
    });
  });

  it('uses a static dependency-free fallback when React root creation fails', async () => {
    const root = await bootstrapApplication({
      createRootFactory: () => {
        throw new Error('root creation failed');
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('La interfaz encontró un problema');
    root.unmount();
  });

  it('mounts the loaded application component on the normal path', async () => {
    const TestApplication = () => <p>OneITB disponible</p>;
    let reactRoot;

    await act(async () => {
      reactRoot = await bootstrapApplication({
        loadApplication: () => Promise.resolve({ ApplicationRoot: TestApplication }),
      });
    });

    expect(screen.getByText('OneITB disponible')).toBeInTheDocument();

    await act(async () => {
      reactRoot.unmount();
    });
  });
});
