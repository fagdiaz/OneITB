import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  InterfaceFailureView,
  createInterfaceErrorId,
  reportInterfaceError,
} from './Components/layout/InterfaceFailureView';

const loadDefaultApplication = () => import('./ApplicationRoot');

export const ensureApplicationRoot = (documentRef = document) => {
  const existingRoot = documentRef.getElementById('root');
  if (existingRoot) return existingRoot;

  const rootElement = documentRef.createElement('div');
  rootElement.id = 'root';
  documentRef.body.append(rootElement);
  return rootElement;
};

const renderStaticFailure = (rootElement, errorId) => {
  const documentRef = rootElement.ownerDocument;
  const container = documentRef.createElement('main');
  const panel = documentRef.createElement('section');
  const symbol = documentRef.createElement('div');
  const eyebrow = documentRef.createElement('p');
  const title = documentRef.createElement('h1');
  const message = documentRef.createElement('p');
  const code = documentRef.createElement('p');
  const reloadButton = documentRef.createElement('button');

  container.setAttribute('role', 'alert');
  container.className = 'flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950';
  panel.className = 'w-full max-w-xl rounded-3xl border border-slate-200 bg-slate-100 p-8 text-center shadow-xl';
  symbol.className = 'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-slate-50';
  symbol.textContent = '!';
  symbol.setAttribute('aria-hidden', 'true');
  eyebrow.className = 'mt-6 text-xs font-bold uppercase tracking-widest text-blue-500';
  eyebrow.textContent = 'OneITB - Resiliencia de interfaz';
  title.className = 'mt-3 text-2xl font-black tracking-tight';
  title.textContent = 'La interfaz encontró un problema';
  message.className = 'mt-3 text-sm leading-6 text-slate-600';
  message.textContent = 'Recargá la pantalla para continuar.';
  code.className = 'mt-4 rounded-xl bg-slate-200 px-3 py-2 font-mono text-xs text-slate-600';
  code.textContent = `Código: ${errorId}`;
  reloadButton.type = 'button';
  reloadButton.className = 'mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-slate-50';
  reloadButton.textContent = 'Recargar interfaz';
  reloadButton.addEventListener('click', () => window.location.reload(), { once: true });

  panel.append(symbol, eyebrow, title, message, code, reloadButton);
  container.append(panel);
  rootElement.replaceChildren(container);
};

export const bootstrapApplication = async ({
  rootElement = null,
  loadApplication = loadDefaultApplication,
  createRootFactory = createRoot,
} = {}) => {
  const errorId = createInterfaceErrorId();
  let resolvedRoot = rootElement;
  let reactRoot;

  try {
    resolvedRoot ??= ensureApplicationRoot();
    reactRoot = createRootFactory(resolvedRoot);
    const { ApplicationRoot } = await loadApplication();
    reactRoot.render(<ApplicationRoot />);
    return reactRoot;
  } catch (error) {
    reportInterfaceError(error, errorId);

    if (reactRoot) {
      reactRoot.render(<InterfaceFailureView errorId={errorId} />);
      return reactRoot;
    }

    resolvedRoot ??= ensureApplicationRoot();
    renderStaticFailure(resolvedRoot, errorId);
    return {
      unmount: () => resolvedRoot.replaceChildren(),
    };
  }
};
