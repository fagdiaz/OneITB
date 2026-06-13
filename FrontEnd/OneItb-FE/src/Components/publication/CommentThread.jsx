import React, { useMemo, useState } from 'react';

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

const CommentNode = ({ comment, onReply, onReport, submitting }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState('');

  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    await onReply(comment.id, reply);
    setReply('');
    setIsReplying(false);
  };

  return (
    <li className="border-l-2 border-slate-100 pl-3">
      <div className="rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">
            {comment.user?.firstName} {comment.user?.lastName}
          </span>
          <div className="flex items-center gap-3">
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
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{comment.content}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsReplying((current) => !current)}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Responder
          </button>
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
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const CommentThread = ({ comments, onComment, onReport, submitting }) => {
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
            />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">Todavía no hay comentarios.</p>
      )}
    </section>
  );
};

