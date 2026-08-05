import React from 'react';

export const FeedPaginationControls = ({
  hasItems,
  hasNextPage,
  initialLoading,
  isSearchResultsView,
  loadingMore,
  loadMoreError,
  loadMoreStatus,
  lastAppendedCount,
  onLoadMore,
}) => {
  if (initialLoading || !hasItems) return null;

  const buttonLabel = loadingMore
    ? 'Cargando...'
    : loadMoreError
      ? 'Reintentar'
      : isSearchResultsView
        ? 'Buscar más'
        : 'Cargar más publicaciones';

  return (
    <div className="flex flex-col items-center gap-2" aria-live="polite">
      {loadMoreError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-300/20 dark:bg-red-500/10 dark:text-red-200">
          No se pudo cargar la página siguiente. Las publicaciones visibles se conservaron.
        </p>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-300/20 dark:bg-slate-900/80 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          {buttonLabel}
        </button>
      )}

      {loadMoreStatus === 'appended' && lastAppendedCount > 0 && hasNextPage && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Se agregaron {lastAppendedCount} publicaciones.
        </p>
      )}

      {!hasNextPage && !loadMoreError && (
        <p className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-400">
          {isSearchResultsView ? 'No hay más resultados.' : 'No hay más publicaciones.'}
        </p>
      )}
    </div>
  );
};
