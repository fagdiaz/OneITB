import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
};

type GlobalErrorBoundaryState = {
  hasError: boolean;
  errorId: string | null;
};

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState = {
    hasError: false,
    errorId: null,
  };

  public static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return {
      hasError: true,
      errorId: crypto.randomUUID?.() ?? `${Date.now()}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React render error', {
      errorId: this.state.errorId,
      message: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  private reload(): void {
    window.location.reload();
  }

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-900/80">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/25">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
            OneITB - Resiliencia de interfaz
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            La interfaz encontro un problema
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            No se perdio tu sesion. Recarga la pantalla para continuar; si el problema persiste,
            informa este codigo a administracion.
          </p>
          {this.state.errorId && (
            <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
              Codigo: {this.state.errorId}
            </p>
          )}
          <button
            type="button"
            onClick={() => this.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            Recargar interfaz
          </button>
        </section>
      </main>
    );
  }
}
