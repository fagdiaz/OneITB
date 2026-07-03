import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_INQUIRIES } from '../../data/graphql/queries/inquiries';
import { TOGGLE_INQUIRY_STATUS } from '../../data/graphql/mutations/inquiries';

const shortId = (id) => `#${String(id ?? '').slice(-6).toUpperCase()}`;

export const PublicationManagement = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_INQUIRIES, {
    variables: { searchTerm: null, careerId: null, subjectIds: null },
    fetchPolicy: 'cache-and-network',
  });
  const [toggleInquiryStatus, { loading: updating }] = useMutation(TOGGLE_INQUIRY_STATUS);
  const posts = data?.inquiries ?? [];

  const toggleStatus = async (inquiryId) => {
    await toggleInquiryStatus({ variables: { inquiryId } });
    await refetch();
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publicaciones</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Revision operativa del contenido activo del muro.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{posts.length} activas</span>
      </div>
      {loading && <p className="text-sm text-slate-500">Cargando publicaciones...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      <div className="space-y-3">
        {posts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{post.subject?.name}</p>
                <h3 className="font-semibold text-slate-900 dark:text-white">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{shortId(post.id)}</span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">{post.reportCount ?? 0} reportes</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {post.user?.firstName} {post.user?.lastName} · {new Date(post.publishDate).toLocaleDateString('es-AR')}
                </p>
              </div>
              <button
                type="button"
                disabled={updating}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStatus(post.id);
                }}
                className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                Desactivar
              </button>
            </div>
          </article>
        ))}
      </div>
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{selectedPost.subject?.name}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPost.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{shortId(selectedPost.id)} · {new Date(selectedPost.publishDate).toLocaleString('es-AR')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{selectedPost.content}</p>
            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/50 dark:text-slate-300 sm:grid-cols-2">
              <span><strong>Autor:</strong> {selectedPost.user?.firstName} {selectedPost.user?.lastName}</span>
              <span><strong>Rol:</strong> {selectedPost.user?.role}</span>
              <span><strong>Reportes:</strong> {selectedPost.reportCount ?? 0}</span>
              <span><strong>Comentarios:</strong> {selectedPost.comments?.length ?? 0}</span>
              <span><strong>Likes:</strong> {selectedPost.reactions?.length ?? 0}</span>
            </div>
            {selectedPost.comments?.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-2 text-sm font-bold text-slate-800 dark:text-white">Comentarios asociados</h4>
                <div className="space-y-2">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-slate-100 bg-white p-3 text-sm dark:border-white/10 dark:bg-slate-950/60">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{comment.user?.firstName} {comment.user?.lastName}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
