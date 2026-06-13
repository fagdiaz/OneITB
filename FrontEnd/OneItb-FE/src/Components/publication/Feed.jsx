import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { ReportModal } from '../moderation/ReportModal';
import { CommentThread } from './CommentThread';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import {
  ADD_COMMENT,
  CREATE_INQUIRY,
  TOGGLE_REACTION
} from '../../data/graphql/mutations/inquiries';
import { GET_INQUIRIES } from '../../data/graphql/queries/inquiries';

export const Feed = () => {
  const { auth } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [openThreads, setOpenThreads] = useState({});
  const [reportTargetId, setReportTargetId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS);
  const {
    data: inquiriesData,
    loading: inquiriesLoading,
    error: inquiriesError,
    refetch
  } = useQuery(GET_INQUIRIES, { fetchPolicy: 'cache-and-network' });

  const refetchOptions = {
    refetchQueries: [{ query: GET_INQUIRIES }],
    awaitRefetchQueries: true
  };
  const [createInquiry, { loading: isPublishing }] = useMutation(CREATE_INQUIRY, refetchOptions);
  const [toggleReaction, { loading: isReacting }] = useMutation(TOGGLE_REACTION, refetchOptions);
  const [addComment, { loading: isCommenting }] = useMutation(ADD_COMMENT, refetchOptions);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !selectedSubject) return;

    try {
      await createInquiry({
        variables: {
          subjectId: Number(selectedSubject),
          title: title.trim(),
          content: content.trim()
        }
      });
      setTitle('');
      setContent('');
      setSelectedSubject('');
      showFeedback('success', 'La publicación se creó correctamente.');
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleReaction = async (inquiryId) => {
    try {
      await toggleReaction({ variables: { inquiryId } });
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleComment = async (inquiryId, parentCommentId, commentContent) => {
    try {
      await addComment({
        variables: {
          inquiryId,
          parentCommentId,
          content: commentContent.trim()
        }
      });
      showFeedback('success', parentCommentId ? 'Respuesta publicada.' : 'Comentario publicado.');
    } catch (error) {
      showFeedback('error', error.message);
      throw error;
    }
  };

  const posts = inquiriesData?.inquiries ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Muro académico</h1>
            <p className="text-xs text-slate-500">{posts.length} publicaciones activas</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
        >
          Actualizar
        </button>
      </header>

      {feedback && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handlePublish} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          maxLength={200}
          placeholder="Título de tu consulta"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          maxLength={10000}
          placeholder="¿Qué querés compartir con la comunidad?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            disabled={subjectsLoading}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccioná una materia...</option>
            {subjectsData?.subjects?.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPublishing || !title.trim() || !content.trim() || !selectedSubject}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>

      {inquiriesLoading && posts.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">Cargando publicaciones...</p>
      )}
      {inquiriesError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el muro: {inquiriesError.message}
        </p>
      )}

      {posts.map((post) => {
        const isLiked = post.reactions.some((reaction) => reaction.userId === auth.id);
        const threadOpen = Boolean(openThreads[post.id]);

        return (
          <article key={post.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${post.user?.firstName ?? ''} ${post.user?.lastName ?? ''}`)}&background=3b82f6&color=fff&size=80`}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                  alt={`Avatar de ${post.user?.firstName ?? 'usuario'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {post.user?.firstName} {post.user?.lastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {post.subject?.name} · {new Date(post.publishDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportTargetId(post.id)}
                className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"
                title="Reportar publicación"
              >
                <i className="fa-solid fa-flag text-sm" />
              </button>
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">{post.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{post.content}</p>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={isReacting}
                onClick={() => handleReaction(post.id)}
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  isLiked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
                }`}
              >
                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`} />
                {post.reactions.length} {post.reactions.length === 1 ? 'Me gusta' : 'Me gusta'}
              </button>
              <button
                type="button"
                onClick={() => setOpenThreads((current) => ({ ...current, [post.id]: !current[post.id] }))}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-500"
              >
                <i className="fa-regular fa-comment" />
                {post.comments.length} comentarios
              </button>
            </div>

            {threadOpen && (
              <CommentThread
                comments={post.comments}
                submitting={isCommenting}
                onComment={(parentCommentId, commentContent) =>
                  handleComment(post.id, parentCommentId, commentContent)
                }
              />
            )}
          </article>
        );
      })}

      <ReportModal
        isOpen={Boolean(reportTargetId)}
        inquiryId={reportTargetId}
        onClose={() => setReportTargetId(null)}
        onReported={() => showFeedback('success', 'El reporte fue enviado a moderación.')}
      />
    </div>
  );
};
