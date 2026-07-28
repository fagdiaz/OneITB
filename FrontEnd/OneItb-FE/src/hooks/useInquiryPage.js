import { NetworkStatus, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { GET_INQUIRIES_PAGE } from '../data/graphql/queries/inquiries';

export const mergeInquiryPages = (previous, incoming) => {
  if (!incoming?.inquiriesPage) return previous;

  const existingItems = previous?.inquiriesPage?.items ?? [];
  const incomingItems = incoming.inquiriesPage.items ?? [];
  const existingIds = new Set(existingItems.map((item) => item.id));

  return {
    ...previous,
    inquiriesPage: {
      ...incoming.inquiriesPage,
      items: [
        ...existingItems,
        ...incomingItems.filter((item) => !existingIds.has(item.id)),
      ],
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
  const variables = {
    searchTerm,
    careerId,
    careerIds,
    subjectIds,
    inquiryId,
    authorId,
    first: pageSize,
    after: null,
  };
  const query = useQuery(GET_INQUIRIES_PAGE, {
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const page = query.data?.inquiriesPage;
  const loadingMore = query.networkStatus === NetworkStatus.fetchMore;

  const loadMore = useCallback(async () => {
    if (!page?.hasNextPage || !page.nextCursor || loadingMore) return;

    await query.fetchMore({
      variables: {
        ...variables,
        after: page.nextCursor,
      },
      updateQuery: mergeInquiryPages,
    });
  }, [
    authorId,
    careerId,
    careerIds,
    inquiryId,
    loadingMore,
    page?.hasNextPage,
    page?.nextCursor,
    pageSize,
    query.fetchMore,
    searchTerm,
    subjectIds,
  ]);

  return {
    ...query,
    items: page?.items ?? [],
    totalCount: page?.totalCount ?? 0,
    hasNextPage: Boolean(page?.hasNextPage),
    nextCursor: page?.nextCursor ?? '',
    loadingMore,
    loadMore,
  };
};
