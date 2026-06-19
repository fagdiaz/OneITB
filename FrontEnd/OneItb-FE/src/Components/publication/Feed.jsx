import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ReportModal } from '../moderation/ReportModal';
import { CommentThread } from './CommentThread';
import { MediaAttachment, YouTubeEmbed } from './MediaAttachment';
import { parseYouTubeContent } from '../../utils/mediaParser';
import { UPLOAD_ACCEPT, uploadAttachment } from '../../utils/uploadFile';
import { GET_CAREERS, GET_MY_CAREERS } from '../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import { GET_INQUIRIES } from '../../data/graphql/queries/inquiries';
import {
  ADD_COMMENT,
  CREATE_INQUIRY,
  EDIT_COMMENT,
  EDIT_INQUIRY,
  INTERACT_WITH_USER,
  TOGGLE_COMMENT_STATUS,
  TOGGLE_INQUIRY_STATUS,
  TOGGLE_REACTION,
} from '../../data/graphql/mutations/inquiries';

const roleStyles = {
  Administrador: { name: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-500', label: 'admin' },
  Moderador: { name: 'text-amber-700', badge: 'bg-amber-50 text-amber-600', label: 'moderador' },
  Profesor: { name: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-600', label: 'profesor' },
  Estudiante: { name: 'text-blue-700', badge: 'bg-blue-50 text-blue-600', label: 'estudiante' },
  Egresado: { name: 'text-cyan-700', badge: 'bg-cyan-50 text-cyan-600', label: 'egresado' },
  Empleador: { name: 'text-fuchsia-700', badge: 'bg-fuchsia-50 text-fuchsia-600', label: 'empleador' },
};

const getRoleStyle = (role) => roleStyles[role] ?? { name: 'text-slate-800', badge: 'bg-slate-100 text-slate-500', label: role || 'usuario' };

const getParticipationBadges = (user) => {
  const badges = [];
  if ((user?.totalPosts ?? 0) >= 10) badges.push({ icon: 'fa-pen-nib', label: 'Publicador' });
  if ((user?.totalComments ?? 0) >= 20) badges.push({ icon: 'fa-comments', label: 'Conversador' });
  if ((user?.totalLikesReceived ?? 0) >= 25) badges.push({ icon: 'fa-star', label: 'Valorado' });
  return badges;
};

const ParticipationBadges = ({ user }) => {
  const badges = getParticipationBadges(user);
  if (badges.length === 0) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      {badges.map((badge) => (
        <span
          key={badge.label}
          title={badge.label}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-50 text-[10px] text-yellow-600"
        >
          <i className={`fa-solid ${badge.icon}`} />
        </span>
      ))}
    </span>
  );
};

export const Feed = () => {
  const { auth, token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchParams] = useSearchParams();
  const [openThreads, setOpenThreads] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [reportTargetId, setReportTargetId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingComment, setIsUploadingComment] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const publicationCareerId = selectedCareer ? Number(selectedCareer) : null;
  const searchTermParam = searchParams.get('q');
  const careerParam = searchParams.get('career');
  const subjectParam = searchParams.get('subject');

  const filterCareerId = careerParam ? Number(careerParam) : null;
  const inquiryVariables = {
    searchTerm: searchTermParam?.trim() || null,
    careerId: filterCareerId,
    subjectIds: subjectParam ? [Number(subjectParam)] : null,
  };

  const { data: careersData } = useQuery(GET_CAREERS);
  const { data: myCareersData } = useQuery(GET_MY_CAREERS);
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS, {
    variables: { careerId: publicationCareerId },
  });

  const {
    data: inquiriesData,
    loading: inquiriesLoading,
    error: inquiriesError,
    refetch,
  } = useQuery(GET_INQUIRIES, {
    variables: inquiryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const [createInquiry, { loading: isPublishing }] = useMutation(CREATE_INQUIRY);
  const [toggleReaction, { loading: isReacting }] = useMutation(TOGGLE_REACTION);
  const [addComment, { loading: isCommenting }] = useMutation(ADD_COMMENT);
  const [editInquiry] = useMutation(EDIT_INQUIRY);
  const [toggleInquiryStatus] = useMutation(TOGGLE_INQUIRY_STATUS);
  const [editComment] = useMutation(EDIT_COMMENT);
  const [toggleCommentStatus] = useMutation(TOGGLE_COMMENT_STATUS);
  const [interactWithUser] = useMutation(INTERACT_WITH_USER);

  const careers = careersData?.careers ?? [];
  const myCareers = myCareersData?.myCareers ?? [];
  const publicationSubjects = subjectsData?.subjects ?? [];
  const posts = inquiriesData?.inquiries ?? [];
  const isModerator = auth.role === 'Administrador' || auth.role === 'Moderador';
  const canSelectCareerForPost = myCareers.length > 1;
  const publicationCareerOptions = auth.role === 'Administrador' ? careers : myCareers;
  const mustSelectCareerForPost = auth.role === 'Administrador' || myCareers.length > 1;
  const effectivePublicationSubjects = useMemo(() => {
    if (!mustSelectCareerForPost || selectedCareer) return publicationSubjects;
    return [];
  }, [mustSelectCareerForPost, publicationSubjects, selectedCareer]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest('[data-post-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  useEffect(() => {
    if (inquiriesError) {
      console.error('GraphQL Error fetching inquiries:', inquiriesError);
    }
  }, [inquiriesError]);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !selectedSubject) return;

    let fileUrl = null;
    if (selectedFile) {
      setIsUploading(true);
      try {
        fileUrl = await uploadAttachment(selectedFile, token);
      } catch (error) {
        showFeedback('error', error.message);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      await createInquiry({
        variables: {
          subjectId: Number(selectedSubject),
          title: title.trim(),
          content: content.trim(),
          fileUrl,
        },
      });
      await refetch();
      setTitle('');
      setContent('');
      setSelectedCareer('');
      setSelectedSubject('');
      setSelectedFile(null);
      showFeedback('success', 'La publicacion se creo correctamente.');
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleReaction = async (inquiryId) => {
    try {
      await toggleReaction({ variables: { inquiryId } });
      await refetch();
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleComment = async (inquiryId, parentCommentId, commentContent, selectedCommentFile = null) => {
    let fileUrl = null;
    try {
      if (selectedCommentFile) {
        setIsUploadingComment(true);
        fileUrl = await uploadAttachment(selectedCommentFile, token);
      }

      await addComment({
        variables: {
          inquiryId,
          parentCommentId,
          content: commentContent.trim(),
          fileUrl,
        },
      });
      await refetch();
      showFeedback('success', parentCommentId ? 'Respuesta publicada.' : 'Comentario publicado.');
    } catch (error) {
      showFeedback('error', error.message);
      throw error;
    } finally {
      setIsUploadingComment(false);
    }
  };

  const saveEditPost = async (event) => {
    event.preventDefault();
    if (!editingPost?.title.trim() || !editingPost?.content.trim()) return;

    try {
      await editInquiry({
        variables: {
          inquiryId: editingPost.id,
          newTitle: editingPost.title.trim(),
          newContent: editingPost.content.trim(),
        },
      });
      setEditingPost(null);
      await refetch();
      showFeedback('success', 'Publicacion actualizada.');
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleTogglePost = async (inquiryId) => {
    setOpenMenuId(null);
    try {
      await toggleInquiryStatus({ variables: { inquiryId } });
      await refetch();
      showFeedback('success', 'Estado de la publicacion actualizado.');
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    await editComment({ variables: { commentId, newContent: newContent.trim() } });
    await refetch();
  };

  const handleToggleComment = async (commentId) => {
    await toggleCommentStatus({ variables: { commentId } });
    await refetch();
  };

  const handleUserInteraction = async (targetUserId, type) => {
    setOpenMenuId(null);
    try {
      await interactWithUser({ variables: { targetUserId, type } });
      await refetch();
      showFeedback('success', 'Interaccion social actualizada.');
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Muro academico</h1>
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
          placeholder="Titulo de tu consulta"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          maxLength={10000}
          placeholder="Que queres compartir con la comunidad?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="file-upload"
            type="file"
            accept={UPLOAD_ACCEPT}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <i className="fa-solid fa-paperclip" />
            Adjuntar archivo
          </label>
          {selectedFile && (
            <div className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              <span className="max-w-64 truncate">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                aria-label="Quitar archivo adjunto"
                className="text-slate-400 hover:text-red-600"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          )}
          <span className="text-xs text-slate-400">Maximo 15 MB</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {mustSelectCareerForPost && (
            <select
              value={selectedCareer}
              onChange={(event) => {
                setSelectedCareer(event.target.value);
                setSelectedSubject('');
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una carrera...</option>
              {publicationCareerOptions.map((career) => (
                <option key={career.id} value={career.id}>{career.name}</option>
              ))}
            </select>
          )}
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            disabled={subjectsLoading || (mustSelectCareerForPost && !selectedCareer)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una materia...</option>
            {effectivePublicationSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPublishing || isUploading || !title.trim() || !content.trim() || !selectedSubject}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Subiendo...' : isPublishing ? 'Publicando...' : 'Publicar'}
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
        const roleStyle = getRoleStyle(post.user?.role);
        const isAdminPost = post.user?.role === 'Administrador';
        const parsedContent = parseYouTubeContent(post.content);

        return (
          <article key={post.id} className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${
            isAdminPost ? 'border-blue-200 bg-blue-50/60' : 'border-slate-100 bg-white'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${post.user?.firstName ?? ''} ${post.user?.lastName ?? ''}`)}&background=3b82f6&color=fff&size=80`}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                  alt={`Avatar de ${post.user?.firstName ?? 'usuario'}`}
                />
                <div>
                  <p className={`text-sm font-semibold ${roleStyle.name}`}>
                    <Link to={`/profile/${post.user?.id}`} className="hover:underline">
                      {post.user?.firstName} {post.user?.lastName}
                    </Link>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleStyle.badge}`}>
                      {roleStyle.label}
                    </span>
                    <ParticipationBadges user={post.user} />
                  </p>
                  <p className="text-xs text-slate-400">
                    {post.subject?.name} · {new Date(post.publishDate).toLocaleDateString('es-AR')} {new Date(post.publishDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="relative" data-post-menu>
                <button
                  type="button"
                  onClick={() => setOpenMenuId((current) => (current === post.id ? null : post.id))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Abrir acciones de publicacion"
                >
                  <i className="fa-solid fa-ellipsis-vertical text-sm" />
                </button>
                {openMenuId === post.id && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl">
                  {post.user?.id === auth.id && (
                    <>
                      <button type="button" onClick={() => { setEditingPost({ id: post.id, title: post.title, content: post.content }); setOpenMenuId(null); }} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50">Editar</button>
                      <button type="button" onClick={() => handleTogglePost(post.id)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">Eliminar</button>
                    </>
                  )}
                  {post.user?.id !== auth.id && (
                    <>
                      <button type="button" onClick={() => handleUserInteraction(post.user.id, 'FOLLOW')} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50">Seguir autor</button>
                      <button type="button" onClick={() => handleUserInteraction(post.user.id, 'MUTE')} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50">Silenciar</button>
                      <button type="button" onClick={() => handleUserInteraction(post.user.id, 'BLOCK')} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50">Bloquear</button>
                      <button type="button" onClick={() => { setReportTargetId(post.id); setOpenMenuId(null); }} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">Reportar</button>
                    </>
                  )}
                  {isModerator && (
                    <button type="button" onClick={() => handleTogglePost(post.id)} className="block w-full border-t border-slate-100 px-4 py-2 text-left text-amber-700 hover:bg-amber-50">Desactivar contenido</button>
                  )}
                </div>
                )}
              </div>
            </div>

            <div>
              {editingPost?.id === post.id ? (
                <form onSubmit={saveEditPost} className="space-y-2">
                  <input
                    value={editingPost.title}
                    onChange={(event) => setEditingPost((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editingPost.content}
                    onChange={(event) => setEditingPost((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Guardar</button>
                    <button type="button" onClick={() => setEditingPost(null)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className={`font-semibold ${isAdminPost ? 'text-blue-950' : 'text-slate-800'}`}>{post.title}</h2>
                  {parsedContent.text && (
                    <p className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${isAdminPost ? 'text-blue-900' : 'text-slate-700'}`}>
                      {parsedContent.text}
                    </p>
                  )}
                </>
              )}
              {parsedContent.videoId && <div className="mt-3"><YouTubeEmbed videoId={parsedContent.videoId} /></div>}
              {post.fileUrl && <div className="mt-3"><MediaAttachment fileUrl={post.fileUrl} /></div>}
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
                {post.reactions.length} Me gusta
              </button>
              <button
                type="button"
                onClick={() => setOpenThreads((current) => ({ ...current, [post.id]: !current[post.id] }))}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-500"
              >
                <i className="fa-regular fa-comment" />
                {post.comments.length} comentarios
              </button>
              {post.user?.id && post.user.id !== auth.id && (
                <button
                  type="button"
                  onClick={() => handleUserInteraction(post.user.id, 'FOLLOW')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  <i className="fa-solid fa-user-plus" />
                  Seguir
                </button>
              )}
              {isModerator && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                  <i className="fa-solid fa-flag" />
                  {post.reportCount ?? 0} reportes
                </span>
              )}
            </div>

            {threadOpen && (
              <CommentThread
                comments={post.comments}
                submitting={isCommenting || isUploadingComment}
                onComment={(parentCommentId, commentContent, commentFile) =>
                  handleComment(post.id, parentCommentId, commentContent, commentFile)
                }
                onReport={() => setReportTargetId(post.id)}
                auth={auth}
                isModerator={isModerator}
                onEditComment={handleEditComment}
                onToggleComment={handleToggleComment}
              />
            )}
          </article>
        );
      })}

      <ReportModal
        isOpen={Boolean(reportTargetId)}
        inquiryId={reportTargetId}
        onClose={() => setReportTargetId(null)}
        onReported={() => showFeedback('success', 'El reporte fue enviado a moderacion.')}
      />
    </div>
  );
};
