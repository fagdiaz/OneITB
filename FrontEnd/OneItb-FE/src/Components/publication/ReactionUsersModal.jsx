import React, { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_INQUIRY_REACTION_USERS_PAGE } from '../../data/graphql/queries/inquiries';
import { apiBaseUrl } from '../../utils/uploadFile';

const resolveAvatar = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl) || avatarUrl.startsWith('data:')) return avatarUrl;
  return avatarUrl.startsWith('/') ? `${apiBaseUrl}${avatarUrl}` : avatarUrl;
};

const initials = (user) => `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const ReactionUserAvatar = ({ user }) => {
  const avatar = resolveAvatar(user.avatarUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [avatar]);

  if (!avatar || failed) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200">
        {initials(user)}
      </span>
    );
  }

  return (
    <img
      src={avatar}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
};

export const ReactionUsersModal = ({ inquiryId, isOpen, onClose }) => {
  const titleId = useId();
  const previouslyFocusedElement = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data, loading, error, fetchMore } = useQuery(GET_INQUIRY_REACTION_USERS_PAGE, {
    variables: { inquiryId, first: 20, after: null },
    skip: !isOpen || !inquiryId,
    fetchPolicy: 'network-only',
  });
  const page = data?.inquiryReactionUsersPage;

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    previouslyFocusedElement.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      const element = previouslyFocusedElement.current;
      if (element && document.contains(element) && typeof element.focus === 'function') {
        element.focus();
      }
      previouslyFocusedElement.current = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const loadMore = async () => {
    if (!page?.hasNextPage || !page.nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: { inquiryId, first: 20, after: page.nextCursor },
        updateQuery: (previous, { fetchMoreResult }) => {
          const incoming = fetchMoreResult?.inquiryReactionUsersPage;
          if (!incoming) return previous;
          const existingItems = previous?.inquiryReactionUsersPage?.items ?? [];
          const existingIds = new Set(existingItems.map((user) => user.id));
          return {
            inquiryReactionUsersPage: {
              ...incoming,
              items: [...existingItems, ...incoming.items.filter((user) => !existingIds.has(user.id))],
            },
          };
        },
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <div>
            <h2 id={titleId} className="font-bold text-slate-900 dark:text-white">Me gusta</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{page?.totalCount ?? 0} personas</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {loading && <p className="py-8 text-center text-sm text-slate-500">Cargando reacciones...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{error.message}</p>}
          {!loading && !error && (page?.items?.length ?? 0) === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Todavia no hay reacciones.</p>
          )}
          <ul className="space-y-1">
            {page?.items?.map((user) => {
              return (
                <li key={user.id}>
                  <Link to={`/profile/${user.id}`} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                    <ReactionUserAvatar user={user} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user.firstName} {user.lastName}</span>
                      <span className="block text-xs text-slate-400">{user.role}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {page?.hasNextPage && (
          <footer className="border-t border-slate-200 p-3 dark:border-white/10">
            <button type="button" onClick={loadMore} disabled={isLoadingMore} className="w-full rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/15">
              {isLoadingMore ? 'Cargando...' : 'Cargar mas'}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
};
