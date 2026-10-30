import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { TOGGLE_COMMENT_STATUS } from '../../data/graphql/mutations/inquiries';
import { useInquiryPage } from '../../hooks/useInquiryPage';
import {
  shortId,
  ModerationArticleCard,
  ModerationDetailModal,
  ModerationFeedback,
  ModerationLoadMoreButton,
} from './PublicationManagement';

export const CommentManagement = () => {
  const [selectedComment, setSelectedComment] = useState(null);
  const {
    items: posts,
    totalCount: totalPostCount,
    hasNextPage,
    loading,
    loadingMore,
    error,
    loadMoreError,
    refetch,
    loadMore,
  } = useInquiryPage({ pageSize: 10 });
  const [toggleCommentStatus, { loading: updating }] = useMutation(TOGGLE_COMMENT_STATUS);

  const comments = posts.flatMap((post) =>
    (post.comments ?? []).map((comment) => ({
      ...comment,
      postId: post.id,
      postTitle: post.title,
      postContent: post.content,
    }))
  );

  const toggleStatus = async (commentId) => {
    await toggleCommentStatus({ variables: { commentId } });
    await refetch();
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comentarios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Moderacion rapida de respuestas y conversaciones.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {comments.length} comentarios en {posts.length}/{totalPostCount} publicaciones
        </span>
      </div>

      <ModerationFeedback
        loading={loading}
        loadingText="Cargando comentarios..."
        error={error}
        loadMoreError={loadMoreError}
        hasItems={posts.length > 0}
      />

      <div className="space-y-3">
        {comments.map((comment) => (
          <ModerationArticleCard
            key={comment.id}
            id={comment.id}
            reportCount={comment.reportCount}
            onClick={() => setSelectedComment(comment)}
            updating={updating}
            onDeactivate={() => toggleStatus(comment.id)}
            meta={`${comment.user?.firstName || ''} ${comment.user?.lastName || ''} · ${new Date(comment.createdAt).toLocaleDateString('es-AR')}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{comment.postTitle}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
          </ModerationArticleCard>
        ))}
      </div>

      <ModerationLoadMoreButton
        hasNextPage={hasNextPage}
        loadMore={loadMore}
        loadingMore={loadingMore}
        loadMoreError={loadMoreError}
        label="Cargar más publicaciones"
      />

      <ModerationDetailModal
        isOpen={Boolean(selectedComment)}
        onClose={() => setSelectedComment(null)}
        headerTag={selectedComment?.postTitle}
        title={`Comentario ${shortId(selectedComment?.id)}`}
        subtitle={selectedComment?.createdAt ? new Date(selectedComment.createdAt).toLocaleString('es-AR') : ''}
      >
        {selectedComment && (
          <>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Comentario</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedComment.content}
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Publicacion relacionada</p>
              <h4 className="mt-2 font-semibold text-slate-900 dark:text-white">{selectedComment.postTitle}</h4>
              <p className="mt-1 line-clamp-4 text-sm text-slate-600 dark:text-slate-300">{selectedComment.postContent}</p>
            </div>
            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/50 dark:text-slate-300 sm:grid-cols-2">
              <span><strong>Autor:</strong> {selectedComment.user?.firstName} {selectedComment.user?.lastName}</span>
              <span><strong>Rol:</strong> {selectedComment.user?.role}</span>
              <span><strong>Reportes:</strong> {selectedComment.reportCount ?? 0}</span>
              <span><strong>Publicacion:</strong> {shortId(selectedComment.postId)}</span>
            </div>
          </>
        )}
      </ModerationDetailModal>
    </section>
  );
};
