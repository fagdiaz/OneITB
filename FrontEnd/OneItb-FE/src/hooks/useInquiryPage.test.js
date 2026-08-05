import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQueryMock } = vi.hoisted(() => ({ useQueryMock: vi.fn() }));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
  };
});

import { mergeInquiryPages, useInquiryPage } from './useInquiryPage';

const page = (overrides = {}) => ({
  items: [{ id: '1' }],
  totalCount: 2,
  hasNextPage: true,
  nextCursor: 'page-2',
  ...overrides,
});

const queryResult = (inquiryPage, fetchMore = vi.fn()) => ({
  data: { inquiriesPage: inquiryPage },
  loading: false,
  error: undefined,
  networkStatus: 7,
  fetchMore,
  refetch: vi.fn(),
});

describe('mergeInquiryPages', () => {
  it('appends a bounded page without duplicating normalized entities', () => {
    const previous = { inquiriesPage: page({ items: [{ id: '1' }, { id: '2' }] }) };
    const incoming = {
      inquiriesPage: page({
        items: [{ id: '2' }, { id: '3' }, { id: '3' }],
        totalCount: 3,
        hasNextPage: false,
        nextCursor: '',
      }),
    };

    const merged = mergeInquiryPages(previous, incoming);

    expect(merged.inquiriesPage.items.map((item) => item.id)).toEqual(['1', '2', '3']);
    expect(merged.inquiriesPage.hasNextPage).toBe(false);
    expect(merged.inquiriesPage.nextCursor).toBe('');
  });
});

describe('useInquiryPage', () => {
  beforeEach(() => useQueryMock.mockReset());

  it('reports an explicit terminal result without issuing a request', async () => {
    const fetchMore = vi.fn();
    useQueryMock.mockReturnValue(queryResult(page({ hasNextPage: false, nextCursor: '' }), fetchMore));
    const { result } = renderHook(() => useInquiryPage());

    let outcome;
    await act(async () => {
      outcome = await result.current.loadMore();
    });

    expect(outcome).toEqual(expect.objectContaining({ status: 'end', appendedCount: 0 }));
    expect(fetchMore).not.toHaveBeenCalled();
    expect(result.current.loadMoreStatus).toBe('end');
  });

  it('keeps observable state updates enabled under React Strict Mode', async () => {
    useQueryMock.mockReturnValue(queryResult(page({ hasNextPage: false, nextCursor: '' })));
    const wrapper = ({ children }) => React.createElement(React.StrictMode, null, children);
    const { result } = renderHook(() => useInquiryPage(), { wrapper });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.loadMoreStatus).toBe('end');
  });

  it('blocks a concurrent click and reports the appended terminal page', async () => {
    let resolveFetch;
    const fetchMore = vi.fn(() => new Promise((resolve) => { resolveFetch = resolve; }));
    useQueryMock.mockReturnValue(queryResult(page(), fetchMore));
    const { result } = renderHook(() => useInquiryPage({ careerIds: [1] }));

    let firstRequest;
    act(() => {
      firstRequest = result.current.loadMore();
    });
    const concurrent = await result.current.loadMore();

    expect(concurrent.status).toBe('busy');
    expect(fetchMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({
        data: {
          inquiriesPage: page({
            items: [{ id: '2' }],
            hasNextPage: false,
            nextCursor: '',
          }),
        },
      });
      await firstRequest;
    });

    expect(result.current.loadMoreStatus).toBe('end');
    expect(result.current.lastAppendedCount).toBe(1);
  });

  it('preserves current items and exposes a recoverable next-page error', async () => {
    const fetchMore = vi.fn().mockRejectedValue(new Error('transport detail'));
    useQueryMock.mockReturnValue(queryResult(page(), fetchMore));
    const { result } = renderHook(() => useInquiryPage());

    let outcome;
    await act(async () => {
      outcome = await result.current.loadMore();
    });

    expect(outcome.status).toBe('error');
    expect(result.current.items.map((item) => item.id)).toEqual(['1']);
    expect(result.current.loadMoreError).toBeTruthy();
    expect(result.current.loadMoreStatus).toBe('error');
  });

  it('uses the current filter and cursor after a career change', async () => {
    const firstFetch = vi.fn();
    const secondFetch = vi.fn().mockResolvedValue({
      data: { inquiriesPage: page({ items: [{ id: '22' }], hasNextPage: false, nextCursor: '' }) },
    });
    useQueryMock.mockImplementation((_query, options) => {
      const careerId = options?.variables?.careerIds?.[0];
      return careerId === 2
        ? queryResult(page({ items: [{ id: '21' }], nextCursor: 'career-2' }), secondFetch)
        : queryResult(page({ nextCursor: 'career-1' }), firstFetch);
    });
    const { result, rerender } = renderHook(
      ({ careerIds }) => useInquiryPage({ careerIds }),
      { initialProps: { careerIds: [1] } },
    );

    rerender({ careerIds: [2] });
    await act(async () => {
      await result.current.loadMore();
    });

    expect(firstFetch).not.toHaveBeenCalled();
    expect(secondFetch).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ careerIds: [2], after: 'career-2' }),
    }));
  });
});
