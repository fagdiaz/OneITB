import { NetworkStatus, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GET_INQUIRIES_PAGE } from '../data/graphql/queries/inquiries';

const normalizeIds = (values) => {
  if (!Array.isArray(values) || values.length === 0) return null;
  const normalized = [...new Set(values.map(Number).filter((value) => Number.isInteger(value) && value > 0))]
    .sort((left, right) => left - right);
  return normalized.length > 0 ? normalized : null;
};

const normalizeOptionalId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
};

export const mergeInquiryPages = (previous, incoming) => {
  if (!incoming?.inquiriesPage) return previous;

  const existingItems = previous?.inquiriesPage?.items ?? [];
  const incomingItems = incoming.inquiriesPage.items ?? [];
  const existingIds = new Set(existingItems.map((item) => item.id));
  const uniqueIncoming = incomingItems.filter((item) => {
    if (!item?.id || existingIds.has(item.id)) return false;
    existingIds.add(item.id);
    return true;
  });

  return {
    ...previous,
    inquiriesPage: {
      ...incoming.inquiriesPage,
      items: [...existingItems, ...uniqueIncoming],
    },
  };
};

export const useInquiryPage = ({
  pageSize = 10,
  searchTerm = null,
  careerId = null,
  careerIds = null,
  subjectIds = null,
  inquiryId = null,
  authorId = null,
  skip = false,
} = {}) => {
  const normalizedFilters = {
    searchTerm: searchTerm?.trim() || null,
    careerId: normalizeOptionalId(careerId),
    careerIds: normalizeIds(careerIds),
    subjectIds: normalizeIds(subjectIds),
    inquiryId: inquiryId || null,
    authorId: authorId || null,
  };
  const filterKey = JSON.stringify(normalizedFilters);
  // The serialized key keeps semantically identical array filters referentially stable.
  const variables = useMemo(() => ({
    ...normalizedFilters,
    first: pageSize,
    after: null,
  }), [filterKey, pageSize]);
  const query = useQuery(GET_INQUIRIES_PAGE, {
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const page = query.data?.inquiriesPage;
  const apolloLoadingMore = query.networkStatus === NetworkStatus.fetchMore;
  const mountedRef = useRef(true);
  const currentFilterRef = useRef(filterKey);
  const inFlightFilterRef = useRef(null);
  const [loadMoreState, setLoadMoreState] = useState({
    status: 'idle',
    error: null,
    appendedCount: 0,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    currentFilterRef.current = filterKey;
    if (inFlightFilterRef.current !== filterKey) inFlightFilterRef.current = null;
    setLoadMoreState({ status: 'idle', error: null, appendedCount: 0 });
  }, [filterKey]);

  const loadMore = useCallback(async () => {
    const requestFilterKey = filterKey;
    if (inFlightFilterRef.current === requestFilterKey) {
      return { status: 'busy', appendedCount: 0 };
    }
    if (!page?.hasNextPage || !page.nextCursor) {
      if (mountedRef.current && currentFilterRef.current === requestFilterKey) {
        setLoadMoreState({ status: 'end', error: null, appendedCount: 0 });
      }
      return { status: 'end', appendedCount: 0 };
    }

    inFlightFilterRef.current = requestFilterKey;
    setLoadMoreState((current) => ({ ...current, status: 'loading', error: null }));
    const existingIds = new Set((page.items ?? []).map((item) => item.id));

    try {
      const result = await query.fetchMore({
        variables: { ...variables, after: page.nextCursor },
        updateQuery: mergeInquiryPages,
      });
      if (currentFilterRef.current !== requestFilterKey) {
        return { status: 'stale', appendedCount: 0 };
      }

      const incomingPage = result?.data?.inquiriesPage;
      if (!incomingPage) {
        throw new Error('La pagina siguiente no devolvio un resultado valido.');
      }
      const appendedCount = (incomingPage.items ?? [])
        .filter((item) => item?.id && !existingIds.has(item.id)).length;
      const status = incomingPage.hasNextPage ? 'appended' : 'end';

      if (mountedRef.current) {
        setLoadMoreState({ status, error: null, appendedCount });
      }
      return { status, appendedCount };
    } catch (error) {
      if (currentFilterRef.current !== requestFilterKey) {
        return { status: 'stale', appendedCount: 0 };
      }
      if (mountedRef.current) {
        setLoadMoreState({ status: 'error', error, appendedCount: 0 });
      }
      return { status: 'error', error, appendedCount: 0 };
    } finally {
      if (inFlightFilterRef.current === requestFilterKey) {
        inFlightFilterRef.current = null;
      }
    }
  }, [filterKey, page?.hasNextPage, page?.items, page?.nextCursor, query.fetchMore, variables]);

  return {
    ...query,
    items: page?.items ?? [],
    totalCount: page?.totalCount ?? 0,
    hasNextPage: Boolean(page?.hasNextPage),
    nextCursor: page?.nextCursor ?? '',
    loadingMore: apolloLoadingMore || loadMoreState.status === 'loading',
    loadMoreStatus: loadMoreState.status,
    loadMoreError: loadMoreState.error,
    lastAppendedCount: loadMoreState.appendedCount,
    loadMore,
  };
};
