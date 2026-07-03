import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_INQUIRIES } from '../../data/graphql/queries/inquiries';
import { TOGGLE_COMMENT_STATUS } from '../../data/graphql/mutations/inquiries';

const shortId = (id) => `#${String(id ?? '').slice(-6).toUpperCase()}`;

export const CommentManagement = () => {
  const [selectedComment, setSelectedComment] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_INQUIRIES, {
    variables: { searchTerm: null, careerId: null, subjectIds: null },
    fetchPolicy: 'cache-and-network',
  });
  const [toggleCommentStatus, { loading: updating }] = useMutation(TOGGLE_COMMENT_STATUS);
  const comments = (data?.inquiries ?? []).flatMap((post) =>
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
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{comments.length} activos</span>
      </div>
      {loading && <p className="text-sm text-slate-500">Cargando comentarios...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      <div className="space-y-3">
        {comments.map((comment) => (
          <article
            key={comment.id}
            onClick={() => setSelectedComment(comment)}
            className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{comment.postTitle}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{shortId(comment.id)}</span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">{comment.reportCount ?? 0} reportes</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {comment.user?.firstName} {comment.user?.lastName} · {new Date(comment.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              <button
                type="button"
                disabled={updating}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStatus(comment.id);
                }}
                className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                Desactivar
              </button>
            </div>
          </article>
        ))}
      </div>
      {selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{selectedComment.postTitle}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Comentario {shortId(selectedComment.id)}</h3>
                <p className="mt-1 text-xs text-slate-400">{new Date(selectedComment.createdAt).toLocaleString('es-AR')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComment(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Comentario</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{selectedComment.content}</p>
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
          </div>
        </div>
      )}
    </section>
  );
};
