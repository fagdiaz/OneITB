import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const buildCommentTree = (comments) => {
  const nodes = new Map(
    comments.map((comment) => [comment.id, { ...comment, replies: [] }])
  );
  const roots = [];

  nodes.forEach((comment) => {
    const parent = comment.parentCommentId
      ? nodes.get(comment.parentCommentId)
      : null;

    if (parent) {
      parent.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const sortByDate = (items) => {
    items.sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
    items.forEach((item) => sortByDate(item.replies));
  };
  sortByDate(roots);
  return roots;
};

const roleStyles = {
  Administrador: { name: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-500', label: 'admin' },
  Moderador: { name: 'text-amber-700', badge: 'bg-amber-50 text-amber-600', label: 'moderador' },
  Profesor: { name: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-600', label: 'profesor' },
  Estudiante: { name: 'text-blue-700', badge: 'bg-blue-50 text-blue-600', label: 'estudiante' },
  Egresado: { name: 'text-cyan-700', badge: 'bg-cyan-50 text-cyan-600', label: 'egresado' },
  Empleador: { name: 'text-fuchsia-700', badge: 'bg-fuchsia-50 text-fuchsia-600', label: 'empleador' },
};

const getRoleStyle = (role) => roleStyles[role] ?? { name: 'text-slate-700', badge: 'bg-slate-100 text-slate-500', label: role || 'usuario' };

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
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-50 text-[9px] text-yellow-600"
        >
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
  submitting,
  auth,
  isModerator,
  onEditComment,
  onToggleComment,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reply, setReply] = useState('');
  const [draftContent, setDraftContent] = useState(comment.content);
  const canManage = comment.userId === auth?.id || isModerator;
  const roleStyle = getRoleStyle(comment.user?.role);
  const isAdminComment = comment.user?.role === 'Administrador';

  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    await onReply(comment.id, reply);
    setReply('');
    setIsReplying(false);
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!draftContent.trim()) return;
    await onEditComment(comment.id, draftContent);
    setIsEditing(false);
  };

  return (
    <li className={`border-l-2 pl-3 ${isAdminComment ? 'border-blue-200' : 'border-slate-100'}`}>
      <div className={`rounded-lg p-3 ${isAdminComment ? 'bg-blue-50/70 ring-1 ring-blue-100' : 'bg-slate-50'}`}>
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
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                {comment.reportCount ?? 0} reportes
              </span>
            )}
            <time className="text-[11px] text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('es-AR')} {new Date(comment.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </time>
            <button
              type="button"
              onClick={() => onReport && onReport(comment.inquiryId)}
              className="text-slate-300 hover:text-red-500"
              title="Reportar comentario"
            >
              <i className="fa-solid fa-flag text-xs" />
            </button>
          </div>
        </div>
        {isEditing ? (
          <form onSubmit={submitEdit} className="mt-2 flex gap-2">
            <input
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              maxLength={1000}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Guardar</button>
            <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
          </form>
        ) : (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{comment.content}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsReplying((current) => !current)}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Responder
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing((current) => !current)}
                className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onToggleComment(comment.id)}
                className="mt-2 text-xs font-medium text-red-500 hover:text-red-600"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {isReplying && (
        <form onSubmit={submitReply} className="mt-2 flex gap-2">
          <input
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            maxLength={1000}
            placeholder="Escribí una respuesta..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={submitting || !reply.trim()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Enviar
          </button>
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
              submitting={submitting}
              auth={auth}
              isModerator={isModerator}
              onEditComment={onEditComment}
              onToggleComment={onToggleComment}
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
  submitting,
  auth,
  isModerator,
  onEditComment,
  onToggleComment,
}) => {
  const [draft, setDraft] = useState('');
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    await onComment(null, draft);
    setDraft('');
  };

  return (
    <section className="space-y-3 border-t border-slate-100 pt-3">
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={1000}
          placeholder="Sumate a la conversación..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Comentar
        </button>
      </form>

      {tree.length > 0 ? (
        <ul className="space-y-3">
          {tree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              onReply={onComment}
              onReport={onReport}
              submitting={submitting}
              auth={auth}
              isModerator={isModerator}
              onEditComment={onEditComment}
              onToggleComment={onToggleComment}
            />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">Todavía no hay comentarios.</p>
      )}
    </section>
  );
};
