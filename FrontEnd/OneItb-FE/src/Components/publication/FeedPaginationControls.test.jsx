import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedPaginationControls } from './FeedPaginationControls';

const baseProps = {
  hasItems: true,
  hasNextPage: true,
  initialLoading: false,
  isSearchResultsView: false,
  loadingMore: false,
  loadMoreError: null,
  loadMoreStatus: 'idle',
  lastAppendedCount: 0,
  onLoadMore: vi.fn(),
};

describe('FeedPaginationControls', () => {
  it('disables concurrent interaction while loading', () => {
    render(<FeedPaginationControls {...baseProps} loadingMore />);
    expect(screen.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
  });

  it('keeps a recoverable retry action after a next-page error', () => {
    const onLoadMore = vi.fn();
    render(
      <FeedPaginationControls
        {...baseProps}
        loadMoreError={new Error('network')}
        loadMoreStatus="error"
        onLoadMore={onLoadMore}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('se conservaron');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('renders an explicit terminal state for the normal feed', () => {
    render(<FeedPaginationControls {...baseProps} hasNextPage={false} loadMoreStatus="end" />);
    expect(screen.getByText('No hay más publicaciones.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
