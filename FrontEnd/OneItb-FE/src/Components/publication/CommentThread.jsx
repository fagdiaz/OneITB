import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MediaComponent from './MediaComponent';
import { AttachmentDraftPicker } from './AttachmentDraftPicker';
import { MentionText } from './MentionText';

const buildCommentTree = (comments = []) => {
  const nodes = new Map(comments.map((comment) => [comment.id, {
    ...comment,
    attachments: comment.attachments ?? [],
    reactions: comment.reactions ?? [],
    replies: [],
  }]));
  const roots = [];

  nodes.forEach((comment) => {
    const parent = comment.parentCommentId ? nodes.get(comment.parentCommentId) : null;
    const canonicalParent = parent?.parentCommentId ? nodes.get(parent.parentCommentId) : parent;
    if (canonicalParent) canonicalParent.replies.push(comment);
    else roots.push(comment);
  });

  const sortByDate = (items) => {
    items.sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
    items.forEach((item) => sortByDate(item.replies));
  };
  sortByDate(roots);
  return roots;
};

const roleStyles = {
  Administrador: { name: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-200', label: 'admin' },
  Moderador: { name: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200', label: 'moderador' },
  Profesor: { name: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200', label: 'profesor' },
  Estudiante: { name: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200', label: 'estudiante' },
  Egresado: { name: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-200', label: 'egresado' },
  Empleador: { name: 'text-fuchsia-700 dark:text-fuchsia-300', badge: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-200', label: 'empleador' },
};

const getRoleStyle = (role) => roleStyles[role] ?? {
  name: 'text-slate-700 dark:text-slate-300',
  badge: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
  label: role || 'usuario',
};

const ParticipationBadges = ({ user }) => {
  const badges = [];
  if ((user?.totalPosts ?? 0) >= 10) badges.push({ icon: 'fa-pen-nib', label: 'Publicador' });
  if ((user?.totalComments ?? 0) >= 20) badges.push({ icon: 'fa-comments', label: 'Conversador' });
  if ((user?.totalLikesReceived ?? 0) >= 25) badges.push({ icon: 'fa-star', label: 'Valorado' });
  if (badges.length === 0) return null;

  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      {badges.map((badge) => (
        <span key={badge.label} title={badge.label} className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-50 text-[9px] text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-300">
          <i className={`fa-solid ${badge.icon}`} />
        </span>
      ))}
    </span>
  );
};

const CommentNode = ({
  comment,
  onReply,
  onReport,
  onToggleReaction,
  submitting,
  auth,
  isModerator,
  onEditComment,
  onToggleComment,
  onModerateComment,
  targetCommentId,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [draftContent, setDraftContent] = useState(comment.content);
  const [retainedAttachments, setRetainedAttachments] = useState(comment.attachments ?? []);
  const [editFiles, setEditFiles] = useState([]);
  const [editFileError, setEditFileError] = useState(null);
  const replyInputRef = useRef(null);
  const nodeRef = useRef(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const canAuthorManage = comment.userId === auth?.id;
  const roleStyle = getRoleStyle(comment.user?.role);
  const isAdminComment = comment.user?.role === 'Administrador';
  const reactions = comment.reactions ?? [];
  const isLiked = reactions.some((reaction) => reaction.userId === auth?.id);

  useEffect(() => {
    if (!isReplying) return undefined;
    const frame = window.requestAnimationFrame(() => replyInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isReplying]);

  useEffect(() => {
    if (targetCommentId !== comment.id) return undefined;
    setIsHighlighted(true);
    const frame = window.requestAnimationFrame(() => {
      nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nodeRef.current?.focus({ preventScroll: true });
    });
    const timeout = window.setTimeout(() => setIsHighlighted(false), 3500);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [comment.id, targetCommentId]);

  const toggleReplyComposer = () => {
    setIsReplying((current) => {
      const next = !current;
      if (next && depth > 0 && !reply.trim()) {
        const mentionName = comment.user?.firstName?.trim();
        setReply(mentionName ? `@${mentionName} ` : '');
      }
      return next;
    });
  };

  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    try {
      const rootParentId = depth > 0 ? comment.parentCommentId : comment.id;
      await onReply(rootParentId, reply, replyFiles, comment.id);
      setReply('');
      setReplyFiles([]);
      setFileError(null);
      setIsReplying(false);
    } catch {
      // Feed owns the global error; keep this draft for retry.
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!draftContent.trim()) return;
    try {
      await onEditComment(comment.id, draftContent, retainedAttachments, editFiles);
      setEditFiles([]);
      setEditFileError(null);
      setIsEditing(false);
    } catch (error) {
      setEditFileError(error.message || 'No se pudo actualizar el comentario.');
    }
  };

  return (
    <li id={`comment-${comment.id}`} ref={nodeRef} tabIndex={-1} className={`scroll-mt-28 border-l-2 outline-none transition-colors duration-700 ${depth > 0 ? 'ml-4 border-blue-200 pl-4 sm:ml-7 dark:border-blue-400/25' : 'border-slate-200 pl-3 dark:border-white/10'} ${isHighlighted ? 'rounded-xl bg-amber-100/80 ring-2 ring-amber-300 dark:bg-amber-400/10 dark:ring-amber-300/40' : ''}`}>
      <div className={`rounded-lg p-3 ${depth > 0 ? 'bg-blue-50/45 dark:bg-blue-500/[0.06]' : ''} ${isAdminComment ? 'bg-blue-50/70 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-300/20' : 'ring-1 ring-slate-100 dark:bg-slate-900/55 dark:ring-white/10'}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold ${roleStyle.name}`}>
            <Link to={`/profile/${comment.user?.id}`} className="hover:underline">
              {comment.user?.firstName} {comment.user?.lastName}
            </Link>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleStyle.badge}`}>
              {roleStyle.label}
            </span>
            <ParticipationBadges user={comment.user} />
          </span>
          <div className="flex items-center gap-3">
            {isModerator && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-200">
                {comment.reportCount ?? 0} reportes
              </span>
            )}
            <time className="text-[11px] text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('es-AR')} {' '}
              {new Date(comment.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </time>
            <button type="button" onClick={() => onReport?.(comment.inquiryId)} className="text-slate-300 hover:text-red-500" title="Reportar comentario">
              <i className="fa-solid fa-flag text-xs" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={submitEdit} className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input value={draftContent} onChange={(event) => setDraftContent(event.target.value)} maxLength={1000} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-100" />
              <button type="submit" disabled={Boolean(editFileError)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Guardar</button>
              <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">Cancelar</button>
            </div>
            {retainedAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {retainedAttachments.map((attachment) => (
                  <span key={attachment.id || attachment.fileUrl} className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <span className="truncate">{attachment.originalFileName}</span>
                    <button type="button" onClick={() => setRetainedAttachments((items) => items.filter((item) => item.id !== attachment.id))} aria-label={`Quitar ${attachment.originalFileName}`} className="hover:text-red-600"><i className="fa-solid fa-xmark" /></button>
                  </span>
                ))}
              </div>
            )}
            <AttachmentDraftPicker files={editFiles} onChange={setEditFiles} onError={setEditFileError} compact />
            {editFileError && <p className="text-xs font-medium text-red-600">{editFileError}</p>}
          </form>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-200">
            <MentionText text={comment.content} users={comment.replyToUser ? [comment.replyToUser] : []} />
          </p>
        )}

        <MediaComponent textContext={comment.content} fileUrl={comment.fileUrl} attachments={comment.attachments} compact />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onToggleReaction(comment)} className={`text-xs font-semibold transition ${isLiked ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300'}`}>
            <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up mr-1.5`} />
            Me gusta{reactions.length > 0 ? ` · ${reactions.length}` : ''}
          </button>
          <button type="button" onClick={toggleReplyComposer} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300">
            {depth > 0 ? `Responder a ${comment.user?.firstName || 'usuario'}` : 'Responder'}
          </button>
          {canAuthorManage && (
            <>
              <button type="button" onClick={() => { setDraftContent(comment.content); setRetainedAttachments(comment.attachments ?? []); setEditFiles([]); setEditFileError(null); setIsEditing((current) => !current); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">Editar</button>
              <button type="button" onClick={() => onToggleComment(comment.id)} className="text-xs font-medium text-red-500 hover:text-red-600">Eliminar</button>
            </>
          )}
          {isModerator && !canAuthorManage && (
            <button type="button" onClick={() => onModerateComment(comment.id)} className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-300">Ocultar</button>
          )}
        </div>
      </div>

      {isReplying && (
        <form onSubmit={submitReply} className="mt-2 space-y-2">
          <div className="flex gap-2">
            <input ref={replyInputRef} value={reply} onChange={(event) => setReply(event.target.value)} maxLength={1000} placeholder="Escribe una respuesta..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-100 dark:placeholder:text-slate-300" />
            <button type="submit" disabled={submitting || !reply.trim()} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
          <AttachmentDraftPicker files={replyFiles} onChange={setReplyFiles} onError={setFileError} compact />
          {fileError && <p className="text-xs font-medium text-red-600 dark:text-red-300">{fileError}</p>}
        </form>
      )}

      {comment.replies.length > 0 && (
        <ul className="mt-3 space-y-3">
          {comment.replies.map((replyComment) => (
            <CommentNode
              key={replyComment.id}
              comment={replyComment}
              onReply={onReply}
              onReport={onReport}
              onToggleReaction={onToggleReaction}
              submitting={submitting}
              auth={auth}
              isModerator={isModerator}
              onEditComment={onEditComment}
              onToggleComment={onToggleComment}
              onModerateComment={onModerateComment}
              targetCommentId={targetCommentId}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const CommentThread = ({
  comments,
  onComment,
  onReport,
  onToggleReaction,
  submitting,
  auth,
  isModerator,
  onEditComment,
  onToggleComment,
  onModerateComment,
  focusRequest,
  targetCommentId,
}) => {
  const [draft, setDraft] = useState('');
  const [draftFiles, setDraftFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const draftInputRef = useRef(null);
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    if (!focusRequest) return undefined;
    const frame = window.requestAnimationFrame(() => draftInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest]);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    try {
      await onComment(null, draft, draftFiles);
      setDraft('');
      setDraftFiles([]);
      setFileError(null);
    } catch {
      // Feed owns the global error; keep this draft for retry.
    }
  };

  return (
    <section className="space-y-3 border-t border-slate-100 pt-3 dark:border-white/10">
      <form onSubmit={submitComment} className="space-y-2">
        <div className="flex gap-2">
          <input ref={draftInputRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1000} placeholder="Sumate a la conversacion..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-100 dark:placeholder:text-slate-300" />
          <button type="submit" disabled={submitting || !draft.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500">
            {submitting ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
        <AttachmentDraftPicker files={draftFiles} onChange={setDraftFiles} onError={setFileError} compact />
        {fileError && <p className="text-xs font-medium text-red-600 dark:text-red-300">{fileError}</p>}
      </form>

      {tree.length > 0 ? (
        <ul className="space-y-3">
          {tree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              onReply={onComment}
              onReport={onReport}
              onToggleReaction={onToggleReaction}
              submitting={submitting}
              auth={auth}
              isModerator={isModerator}
              onEditComment={onEditComment}
              onToggleComment={onToggleComment}
              onModerateComment={onModerateComment}
              targetCommentId={targetCommentId}
              depth={0}
            />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">Todavia no hay comentarios.</p>
      )}
    </section>
  );
};
