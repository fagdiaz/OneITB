import React from 'react';

type InterfaceFailureViewProps = {
  errorId: string | null;
  onReload?: () => void;
};

const fallbackErrorId = (): string => (
  `ui-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
);

export const createInterfaceErrorId = (
  cryptoApi: Pick<Crypto, 'randomUUID'> | null | undefined = globalThis.crypto,
): string => {
  try {
    if (typeof cryptoApi?.randomUUID === 'function') {
      return cryptoApi.randomUUID();
    }
  } catch {
    // A browser privacy policy can deny Web Crypto without blocking recovery UI.
  }

  return fallbackErrorId();
};

export const reportInterfaceError = (
  error: unknown,
  errorId: string | null,
  componentStack?: string | null,
): void => {
  const diagnostic: {
    errorId: string | null;
    errorName: string;
    componentStack?: string;
  } = {
    errorId,
    errorName: error instanceof Error ? error.name : 'UnknownError',
  };

  if (import.meta.env.DEV && componentStack) {
    diagnostic.componentStack = componentStack;
  }

  console.error('Unhandled OneITB interface error', diagnostic);
};

export const InterfaceFailureView = ({
  errorId,
  onReload = () => window.location.reload(),
}: InterfaceFailureViewProps) => (
  <main
    role="alert"
    className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  >
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-slate-100 p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-900/80">
      <div
        aria-hidden="true"
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-slate-50 shadow-lg shadow-blue-600/25"
      >
        !
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
        OneITB - Resiliencia de interfaz
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
        La interfaz encontró un problema
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        No se perdió tu sesión. Recargá la pantalla para continuar; si el problema persiste,
        informá este código a administración.
      </p>
      {errorId && (
        <p className="mt-4 rounded-xl bg-slate-200 px-3 py-2 font-mono text-xs text-slate-600 dark:bg-slate-950/70 dark:text-slate-400">
          Código: {errorId}
        </p>
      )}
      <button
        type="button"
        onClick={onReload}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-slate-50 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        Recargar interfaz
      </button>
    </section>
  </main>
);
