import React, { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ReportModal } from '../moderation/ReportModal';
import { CommentThread } from './CommentThread';
import MediaComponent from './MediaComponent';
import { AttachmentDraftPicker } from './AttachmentDraftPicker';
import { ReactionUsersModal } from './ReactionUsersModal';
import { copyPostShareUrl } from './sharePostLink';
import { ExpandableText } from './ExpandableText';
import { ModerationReasonModal } from './ModerationReasonModal';
import { FollowButton } from '../social/FollowButton';
import {
  apiBaseUrl,
  getFileIdentity,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE,
  uploadAttachments,
} from '../../utils/uploadFile';
import { parseYouTubeContent } from '../../utils/mediaParser';
import { GET_CAREERS, GET_MY_CAREERS } from '../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import { GET_INQUIRIES_PAGE } from '../../data/graphql/queries/inquiries';
import { SEARCH_PUBLIC_PROFILES } from '../../data/graphql/queries/searchPublicProfiles';
import { GET_MY_FOLLOWED_USER_IDS } from '../../data/graphql/social';
import {
  ADD_COMMENT,
  CREATE_INQUIRY,
  EDIT_COMMENT,
  EDIT_INQUIRY,
  INTERACT_WITH_USER,
  MODERATE_COMMENT_VISIBILITY,
  MODERATE_INQUIRY_VISIBILITY,
  TOGGLE_COMMENT_STATUS,
  TOGGLE_INQUIRY_STATUS,
  TOGGLE_COMMENT_REACTION,
  TOGGLE_REACTION,
} from '../../data/graphql/mutations/inquiries';

const REACTION_FRAGMENT = gql`
  fragment FeedReaction on Reaction {
    id
    userId
  }
`;

const COMMENT_REACTION_FRAGMENT = gql`
  fragment FeedCommentReaction on CommentReaction {
    id
    userId
  }
`;

const updateReactionCache = (cache, {
  parentType,
  parentId,
  reactionType,
  reactionId,
  userId,
  isReacted,
}) => {
  const parentCacheId = cache.identify({ __typename: parentType, id: parentId });
  if (!parentCacheId) return;

  let reactionReference = null;
  if (isReacted && reactionId) {
    reactionReference = cache.writeFragment({
      data: { __typename: reactionType, id: reactionId, userId },
      fragment: reactionType === 'Reaction' ? REACTION_FRAGMENT : COMMENT_REACTION_FRAGMENT,
    });
  }

  cache.modify({
    id: parentCacheId,
    fields: {
      reactions(existing = [], { readField }) {
        const withoutCurrentUser = existing.filter((reference) => readField('userId', reference) !== userId);
        return isReacted && reactionReference ? [...withoutCurrentUser, reactionReference] : withoutCurrentUser;
      },
    },
  });
};

const toAttachmentInput = (attachment, sortOrder) => ({
  fileUrl: attachment.fileUrl,
  originalFileName: attachment.originalFileName,
  contentType: attachment.contentType,
  size: Number(attachment.size),
  sortOrder,
});

const roleStyles = {
  Administrador: { name: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-500', label: 'admin' },
  Moderador: { name: 'text-amber-700', badge: 'bg-amber-50 text-amber-600', label: 'moderador' },
  Profesor: { name: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-600', label: 'profesor' },
  Estudiante: { name: 'text-blue-700', badge: 'bg-blue-50 text-blue-600', label: 'estudiante' },
  Egresado: { name: 'text-cyan-700', badge: 'bg-cyan-50 text-cyan-600', label: 'egresado' },
  Empleador: { name: 'text-fuchsia-700', badge: 'bg-fuchsia-50 text-fuchsia-600', label: 'empleador' },
};

const getRoleStyle = (role) => roleStyles[role] ?? { name: 'text-slate-800', badge: 'bg-slate-100 text-slate-500', label: role || 'usuario' };

const resolveAvatarUrl = (user) => {
  if (user?.avatarUrl) {
    if (/^https?:\/\//i.test(user.avatarUrl) || user.avatarUrl.startsWith('data:')) return user.avatarUrl;
    if (user.avatarUrl.startsWith('/')) return `${apiBaseUrl}${user.avatarUrl}`;
    return user.avatarUrl;
  }
  return null;
};

const failedAvatarUrls = new Set();

const getInitials = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?';
};

const getNameInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const parseIdList = (value) =>
  (value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = resolveAvatarUrl(user);
  const [failed, setFailed] = React.useState(() => Boolean(avatarUrl && failedAvatarUrls.has(avatarUrl)));
  const initials = getInitials(user?.firstName, user?.lastName);
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  React.useEffect(() => {
    setFailed(Boolean(avatarUrl && failedAvatarUrls.has(avatarUrl)));
  }, [avatarUrl]);

  const handleAvatarError = () => {
    if (avatarUrl) failedAvatarUrls.add(avatarUrl);
    setFailed(true);
  };

  if (!avatarUrl || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 font-bold text-slate-600 shadow-sm ${sizeClass}`}
        aria-label={`Avatar de ${user?.firstName ?? 'usuario'}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={avatarUrl}
      className={`shrink-0 rounded-full border-2 border-white object-cover shadow-sm ${sizeClass}`}
      alt={`Avatar de ${user?.firstName ?? 'usuario'}`}
      decoding="async"
      loading="lazy"
      onError={handleAvatarError}
    />
  );
};

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
  const [reactionUsersInquiryId, setReactionUsersInquiryId] = useState(null);
  const [commentFocusRequest, setCommentFocusRequest] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [coverSelection, setCoverSelection] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingComment, setIsUploadingComment] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [moderationTarget, setModerationTarget] = useState(null);
  const [moderationError, setModerationError] = useState(null);
  const isAdmin = auth.role === 'Administrador';
  const publicationCareerId = isAdmin && selectedCareer ? Number(selectedCareer) : null;
  const searchTermParam = searchParams.get('q');
  const normalizedSearchTerm = searchTermParam?.trim() || '';
  const careerParam = searchParams.get('career');
  const careersParam = searchParams.get('careers');
  const subjectParam = searchParams.get('subject');
  const subjectsParam = searchParams.get('subjects');
  const targetInquiryId = searchParams.get('inquiryId');
  const targetCommentId = searchParams.get('commentId');

  const legacyCareerId = careerParam ? Number(careerParam) : null;
  const filterCareerIds = parseIdList(careersParam);
  const effectiveCareerIds = filterCareerIds.length > 0
    ? filterCareerIds
    : Number.isInteger(legacyCareerId)
      ? [legacyCareerId]
      : [];
  const filterSubjectIds = parseIdList(subjectsParam);
  const legacySubjectId = subjectParam ? Number(subjectParam) : null;
  const effectiveSubjectIds = filterSubjectIds.length > 0
    ? filterSubjectIds
    : Number.isInteger(legacySubjectId)
      ? [legacySubjectId]
      : [];
  const inquiryVariables = {
    searchTerm: normalizedSearchTerm || null,
    careerId: null,
    careerIds: effectiveCareerIds.length > 0 ? effectiveCareerIds : null,
    subjectIds: effectiveSubjectIds.length > 0 ? effectiveSubjectIds : null,
    inquiryId: targetInquiryId || null,
    first: 15,
    after: null,
  };

  const { data: careersData } = useQuery(GET_CAREERS);
  const { data: myCareersData } = useQuery(GET_MY_CAREERS);
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS, {
    variables: { careerId: publicationCareerId },
  });
  const { data: searchProfilesData, loading: searchProfilesLoading } = useQuery(SEARCH_PUBLIC_PROFILES, {
    variables: { searchTerm: normalizedSearchTerm, first: 8 },
    skip: normalizedSearchTerm.length < 2,
    fetchPolicy: 'cache-and-network',
  });
  const { data: followedData } = useQuery(GET_MY_FOLLOWED_USER_IDS, {
    skip: !auth?.id,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: inquiriesData,
    loading: inquiriesLoading,
    error: inquiriesError,
    refetch,
    fetchMore,
  } = useQuery(GET_INQUIRIES_PAGE, {
    variables: inquiryVariables,
    fetchPolicy: 'cache-and-network',
  });

  const [createInquiry, { loading: isPublishing }] = useMutation(CREATE_INQUIRY);
  const [toggleReaction, { loading: isReacting }] = useMutation(TOGGLE_REACTION);
  const [toggleCommentReaction] = useMutation(TOGGLE_COMMENT_REACTION);
  const [addComment, { loading: isCommenting }] = useMutation(ADD_COMMENT);
  const [editInquiry] = useMutation(EDIT_INQUIRY);
  const [toggleInquiryStatus] = useMutation(TOGGLE_INQUIRY_STATUS);
  const [editComment] = useMutation(EDIT_COMMENT);
  const [toggleCommentStatus] = useMutation(TOGGLE_COMMENT_STATUS);
  const [interactWithUser] = useMutation(INTERACT_WITH_USER);
  const [moderateInquiryVisibility, { loading: moderatingInquiry }] = useMutation(MODERATE_INQUIRY_VISIBILITY);
  const [moderateCommentVisibility, { loading: moderatingComment }] = useMutation(MODERATE_COMMENT_VISIBILITY);
  const [followOverrides, setFollowOverrides] = useState({});

  const careers = careersData?.careers ?? [];
  const myCareers = myCareersData?.myCareers ?? [];
  const publicationSubjects = subjectsData?.subjects ?? [];
  const searchProfiles = searchProfilesData?.searchPublicProfiles ?? [];
  const feedPage = inquiriesData?.inquiriesPage;
  const posts = feedPage?.items ?? [];
  const followedUserIds = useMemo(
    () => new Set(followedData?.myFollowedUserIds ?? []),
    [followedData],
  );
  const isSearchResultsView = normalizedSearchTerm.length > 0;
  const isModerator = auth.role === 'Administrador' || auth.role === 'Moderador';
  const composerVideoId = useMemo(() => parseYouTubeContent(content).videoId, [content]);
  const publicationCareerOptions = careers;
  const mustSelectCareerForPost = isAdmin;
  const effectivePublicationSubjects = useMemo(() => {
    const allowedCareerIds = isAdmin
      ? selectedCareer ? [Number(selectedCareer)] : []
      : myCareers.map((career) => Number(career.id));
    if (allowedCareerIds.length === 0) return [];

    const allowed = new Set(allowedCareerIds);
    return publicationSubjects
      .filter((subject) => subject.isActive && subject.career?.isActive !== false && allowed.has(Number(subject.career?.id)))
      .slice()
      .sort((left, right) => (
        (left.career?.name ?? '').localeCompare(right.career?.name ?? '', 'es', { sensitivity: 'base' }) ||
        (left.year ?? Number.MAX_SAFE_INTEGER) - (right.year ?? Number.MAX_SAFE_INTEGER) ||
        left.name.localeCompare(right.name, 'es', { sensitivity: 'base' })
      ));
  }, [isAdmin, myCareers, publicationSubjects, selectedCareer]);
  const publicationSubjectGroups = useMemo(() => {
    const groups = new Map();
    effectivePublicationSubjects.forEach((subject) => {
      const key = subject.career?.id ?? 'unknown';
      if (!groups.has(key)) {
        groups.set(key, { career: subject.career, subjects: [] });
      }
      groups.get(key).subjects.push(subject);
    });
    return Array.from(groups.values());
  }, [effectivePublicationSubjects]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest('[data-post-menu]')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  useEffect(() => {
    const fileIds = new Set(selectedFiles.map(getFileIdentity));
    const selectionIsValid = coverSelection === 'youtube'
      ? Boolean(composerVideoId)
      : Boolean(coverSelection && fileIds.has(coverSelection));
    if (selectionIsValid) return;
    if (composerVideoId) setCoverSelection('youtube');
    else setCoverSelection(selectedFiles[0] ? getFileIdentity(selectedFiles[0]) : null);
  }, [composerVideoId, coverSelection, selectedFiles]);

  useEffect(() => {
    if (!targetInquiryId) return undefined;
    const targetPost = posts.find((post) => post.id === targetInquiryId);
    if (!targetPost) return undefined;
    setOpenThreads((current) => current[targetInquiryId] ? current : { ...current, [targetInquiryId]: true });
    const hasTargetComment = !targetCommentId || targetPost.comments?.some((comment) => comment.id === targetCommentId);
    const frame = window.requestAnimationFrame(() => {
      if (!targetCommentId || !hasTargetComment) {
        document.getElementById(`inquiry-${targetInquiryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (targetCommentId && !hasTargetComment) {
      setFeedback({ type: 'error', message: 'El comentario indicado ya no esta disponible. Se abrio la publicacion relacionada.' });
    }
    return () => window.cancelAnimationFrame(frame);
  }, [posts, targetCommentId, targetInquiryId]);

  useEffect(() => {
    setFollowOverrides({});
  }, [auth?.id]);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !selectedSubject || attachmentError) return;

    let attachments = [];

    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        const orderedFiles = [...selectedFiles];
        const coverIndex = orderedFiles.findIndex((file) => getFileIdentity(file) === coverSelection);
        if (coverIndex > 0) {
          const [coverFile] = orderedFiles.splice(coverIndex, 1);
          orderedFiles.unshift(coverFile);
        }
        attachments = await uploadAttachments(orderedFiles, token);
      }
      await createInquiry({
        variables: {
          subjectId: Number(selectedSubject),
          title: title.trim(),
          content: content.trim(),
          fileUrl: attachments[0]?.fileUrl ?? null,
          attachments,
          preferAttachmentCover: attachments.length > 0 && (!composerVideoId || coverSelection !== 'youtube'),
        },
      });
      await refetch();
      setTitle('');
      setContent('');
      setSelectedCareer('');
      setSelectedSubject('');
      setSelectedFiles([]);
      setCoverSelection(null);
      setAttachmentError(null);
      showFeedback('success', 'La publicacion se creo correctamente.');
    } catch (error) {
      showFeedback('error', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReaction = async (post) => {
    const isLiked = (post.reactions ?? []).some((reaction) => reaction.userId === auth.id);
    const nextIsReacted = !isLiked;
    const optimisticReactionId = `optimistic-inquiry-${post.id}-${auth.id}`;
    try {
      await toggleReaction({
        variables: { inquiryId: post.id },
        optimisticResponse: {
          toggleReaction: {
            __typename: 'ToggleReactionPayload',
            inquiryId: post.id,
            isReacted: nextIsReacted,
            reactionCount: Math.max(0, post.reactions.length + (nextIsReacted ? 1 : -1)),
            reactionId: optimisticReactionId,
          },
        },
        update: (cache, { data }) => {
          const payload = data?.toggleReaction;
          if (!payload) return;
          updateReactionCache(cache, {
            parentType: 'Inquiry',
            parentId: post.id,
            reactionType: 'Reaction',
            reactionId: payload.reactionId || optimisticReactionId,
            userId: auth.id,
            isReacted: payload.isReacted,
          });
        },
      });
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleCopyPostLink = async (inquiryId) => {
    setOpenMenuId(null);
    try {
      await copyPostShareUrl(inquiryId);
      showFeedback('success', 'Enlace de publicacion copiado.');
    } catch (error) {
      showFeedback('error', error.message || 'No se pudo copiar el enlace.');
    }
  };

  const handleLoadMore = async () => {
    if (!feedPage?.hasNextPage || !feedPage.nextCursor) return;

    try {
      await fetchMore({
        variables: {
          ...inquiryVariables,
          after: feedPage.nextCursor,
        },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult?.inquiriesPage) return previous;
          const existingItems = previous?.inquiriesPage?.items ?? [];
          const incomingItems = fetchMoreResult.inquiriesPage.items ?? [];
          const existingIds = new Set(existingItems.map((item) => item.id));
          const mergedItems = [
            ...existingItems,
            ...incomingItems.filter((item) => !existingIds.has(item.id)),
          ];

          return {
            ...previous,
            inquiriesPage: {
              ...fetchMoreResult.inquiriesPage,
              items: mergedItems,
            },
          };
        },
      });
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const handleComment = async (inquiryId, parentCommentId, commentContent, selectedCommentFiles = [], replyTargetCommentId = null) => {
    let attachments = [];
    try {
      if (selectedCommentFiles.length > 0) {
        setIsUploadingComment(true);
        attachments = await uploadAttachments(selectedCommentFiles, token);
      }

      await addComment({
        variables: {
          inquiryId,
          parentCommentId,
          replyTargetCommentId,
          content: commentContent.trim(),
          fileUrl: attachments[0]?.fileUrl ?? null,
          attachments,
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

  const handleCommentReaction = async (comment) => {
    const isLiked = (comment.reactions ?? []).some((reaction) => reaction.userId === auth.id);
    const nextIsReacted = !isLiked;
    const optimisticReactionId = `optimistic-comment-${comment.id}-${auth.id}`;
    try {
      await toggleCommentReaction({
        variables: { commentId: comment.id },
        optimisticResponse: {
          toggleCommentReaction: {
            __typename: 'ToggleCommentReactionPayload',
            commentId: comment.id,
            isReacted: nextIsReacted,
            reactionCount: Math.max(0, (comment.reactions?.length ?? 0) + (nextIsReacted ? 1 : -1)),
            reactionId: optimisticReactionId,
          },
        },
        update: (cache, { data }) => {
          const payload = data?.toggleCommentReaction;
          if (!payload) return;
          updateReactionCache(cache, {
            parentType: 'Comment',
            parentId: comment.id,
            reactionType: 'CommentReaction',
            reactionId: payload.reactionId || optimisticReactionId,
            userId: auth.id,
            isReacted: payload.isReacted,
          });
        },
      });
    } catch (error) {
      showFeedback('error', error.message);
    }
  };

  const saveEditPost = async (event) => {
    event.preventDefault();
    if (!editingPost?.title.trim() || !editingPost?.content.trim()) return;

    try {
      let uploadedAttachments = [];
      if (editingPost.newFiles.length > 0) {
        setIsUploading(true);
        uploadedAttachments = await uploadAttachments(editingPost.newFiles, token);
      }
      const combinedAttachments = [
        ...editingPost.attachments,
        ...uploadedAttachments,
      ];
      const totalSize = combinedAttachments.reduce((sum, attachment) => sum + Number(attachment.size || 0), 0);
      if (combinedAttachments.length > MAX_UPLOAD_FILES || totalSize > MAX_UPLOAD_SIZE) {
        throw new Error('Los adjuntos editados superan el limite de 10 archivos o 15 MB.');
      }
      const attachmentInputs = combinedAttachments.map(toAttachmentInput);
      await editInquiry({
        variables: {
          inquiryId: editingPost.id,
          newTitle: editingPost.title.trim(),
          newContent: editingPost.content.trim(),
          attachments: attachmentInputs,
          preferAttachmentCover: editingPost.preferAttachmentCover && attachmentInputs.length > 0,
        },
      });
      setEditingPost(null);
      await refetch();
      showFeedback('success', 'Publicacion actualizada.');
    } catch (error) {
      showFeedback('error', error.message);
    } finally {
      setIsUploading(false);
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

  const handleEditComment = async (commentId, newContent, retainedAttachments = [], newFiles = []) => {
    const uploadedAttachments = newFiles.length > 0 ? await uploadAttachments(newFiles, token) : [];
    const combinedAttachments = [...retainedAttachments, ...uploadedAttachments];
    const totalSize = combinedAttachments.reduce((sum, attachment) => sum + Number(attachment.size || 0), 0);
    if (combinedAttachments.length > MAX_UPLOAD_FILES || totalSize > MAX_UPLOAD_SIZE) {
      throw new Error('Los adjuntos editados superan el limite de 10 archivos o 15 MB.');
    }
    await editComment({
      variables: {
        commentId,
        newContent: newContent.trim(),
        attachments: combinedAttachments.map(toAttachmentInput),
      },
    });
    await refetch();
  };

  const handleToggleComment = async (commentId) => {
    await toggleCommentStatus({ variables: { commentId } });
    await refetch();
  };

  const handleModerationConfirm = async (reason) => {
    if (!moderationTarget) return;
    setModerationError(null);
    try {
      if (moderationTarget.kind === 'comment') {
        await moderateCommentVisibility({
          variables: { commentId: moderationTarget.id, isHidden: true, reason },
        });
      } else {
        await moderateInquiryVisibility({
          variables: { inquiryId: moderationTarget.id, isHidden: true, reason },
        });
      }
      setModerationTarget(null);
      await refetch();
      showFeedback('success', 'Contenido ocultado y decision registrada.');
    } catch (error) {
      setModerationError(error.message || 'No se pudo aplicar la moderacion.');
    }
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

  const resolveFollowState = (targetUserId) => followOverrides[targetUserId] ?? followedUserIds.has(targetUserId);
  const handleFollowStateChange = (targetUserId, isFollowing) => {
    setFollowOverrides((current) => ({ ...current, [targetUserId]: isFollowing }));
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4 px-4 py-6 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-600" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Muro academico</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{posts.length} de {feedPage?.totalCount ?? posts.length} publicaciones activas</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
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

      <form onSubmit={handlePublish} className="flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800/75 dark:shadow-[0_18px_50px_rgba(15,23,42,0.24)]">
        <input
          type="text"
          maxLength={200}
          placeholder="Titulo de tu consulta"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-100 dark:placeholder:font-semibold dark:placeholder:text-slate-200"
        />
        <textarea
          maxLength={10000}
          placeholder="Que queres compartir con la comunidad?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-100 dark:placeholder:text-slate-300"
        />
        <AttachmentDraftPicker
          files={selectedFiles}
          onChange={setSelectedFiles}
          onError={setAttachmentError}
          allowCoverSelection
          coverFileIdentity={coverSelection === 'youtube' ? null : coverSelection}
          onCoverChange={setCoverSelection}
        />
        {attachmentError && (
          <p className="text-xs font-semibold text-red-600 dark:text-red-300">{attachmentError}</p>
        )}
        {content.match(/https?:\/\//i) && (
          <div className="-mt-1 mb-2">
            <MediaComponent textContext={content} />
          </div>
        )}
        {composerVideoId && selectedFiles.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Portada principal</span>
            <button
              type="button"
              onClick={() => setCoverSelection('youtube')}
              aria-pressed={coverSelection === 'youtube'}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                coverSelection === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-red-600 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10'
              }`}
            >
              <i className="fa-brands fa-youtube" />
              Video de YouTube
            </button>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {mustSelectCareerForPost && (
            <select
              value={selectedCareer}
              onChange={(event) => {
                setSelectedCareer(event.target.value);
                setSelectedSubject('');
              }}
              className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-1 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-200"
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
            className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-1 dark:border-white/10 dark:bg-slate-700/75 dark:text-slate-200"
          >
            <option value="">Selecciona una materia...</option>
            {publicationSubjectGroups.map((group) => (
              <optgroup key={group.career?.id ?? 'unknown'} label={`Carrera: ${group.career?.name ?? 'Sin carrera'}`}>
                {group.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {subject.code}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPublishing || isUploading || Boolean(attachmentError) || !title.trim() || !content.trim() || !selectedSubject}
            className="w-full shrink-0 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
          >
            {isUploading ? 'Subiendo...' : isPublishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>

      {isSearchResultsView && (
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_50px_rgba(2,6,23,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                Busqueda global
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Resultados de Perfiles
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {normalizedSearchTerm}
            </span>
          </div>

          {normalizedSearchTerm.length < 2 ? (
            <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-200">
              Escribi al menos 2 caracteres para buscar perfiles.
            </p>
          ) : searchProfilesLoading ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Buscando perfiles...</p>
          ) : searchProfiles.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
              No se encontraron perfiles para esta busqueda.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {searchProfiles.map((profile) => {
                const avatarUrl = resolveAvatarUrl({ avatarUrl: profile.avatarUrl });
                return (
                  <Link
                    key={profile.id}
                    to={`/profile/${profile.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-blue-300/30 dark:hover:bg-blue-500/10"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`Avatar de ${profile.fullName}`}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {getNameInitials(profile.fullName)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                        {profile.fullName}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {profile.canViewSensitiveProfile === false
                          ? `${profile.role} - Perfil privado`
                          : [profile.role, ...(profile.careers || []).slice(0, 2)].filter(Boolean).join(' - ')}
                      </span>
                    </span>
                    {profile.canViewSensitiveProfile === false && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-300/20">
                        Privado
                      </span>
                    )}
                    <i className="fa-solid fa-arrow-right text-xs text-slate-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {isSearchResultsView && (
        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Publicaciones filtradas
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Resultados de Publicaciones
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {feedPage?.totalCount ?? posts.length} resultado{(feedPage?.totalCount ?? posts.length) === 1 ? '' : 's'}
            </span>
          </div>
        </section>
      )}

      {inquiriesLoading && posts.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">Cargando publicaciones...</p>
      )}
      {inquiriesError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el muro: {inquiriesError.message}
        </p>
      )}

      {!inquiriesLoading && !inquiriesError && posts.length === 0 && (
        <p className="rounded-xl border border-slate-100 bg-white p-4 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-400">
          {isSearchResultsView ? 'No se encontraron publicaciones para esta busqueda.' : 'Todavia no hay publicaciones activas.'}
        </p>
      )}

      {posts.map((post) => {
        const isLiked = post.reactions.some((reaction) => reaction.userId === auth.id);
        const threadOpen = Boolean(openThreads[post.id]);
        const roleStyle = getRoleStyle(post.user?.role);
        const isAdminPost = post.user?.role === 'Administrador';

        return (
          <article id={`inquiry-${post.id}`} key={post.id} className={`scroll-mt-24 flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${
            isAdminPost ? 'border-blue-200 bg-blue-50/60 dark:border-blue-300/20 dark:bg-blue-500/10' : 'border-slate-100 bg-white dark:border-white/10 dark:bg-slate-900/70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={post.user} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-sm font-semibold ${roleStyle.name}`}>
                      <Link to={`/profile/${post.user?.id}`} className="hover:underline">
                        {post.user?.firstName} {post.user?.lastName}
                      </Link>
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleStyle.badge}`}>
                        {roleStyle.label}
                      </span>
                      <ParticipationBadges user={post.user} />
                    </p>
                    {post.user?.id && post.user.id !== auth.id && (
                      <FollowButton
                        targetUserId={post.user.id}
                        isFollowing={resolveFollowState(post.user.id)}
                        onStateChange={handleFollowStateChange}
                        onError={(error) => showFeedback('error', error.message)}
                        compact
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {post.subject?.name} · {new Date(post.publishDate).toLocaleDateString('es-AR')} {new Date(post.publishDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="relative" data-post-menu>
                <button
                  type="button"
                  onClick={() => setOpenMenuId((current) => (current === post.id ? null : post.id))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
                  aria-label="Abrir acciones de publicacion"
                >
                  <i className="fa-solid fa-ellipsis-vertical text-sm" />
                </button>
                {openMenuId === post.id && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
                  <button type="button" onClick={() => handleCopyPostLink(post.id)} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]">
                    <i className="fa-solid fa-link mr-2 text-xs text-slate-400" />
                    Copiar enlace
                  </button>
                  {post.user?.id === auth.id && (
                    <>
                      <button type="button" onClick={() => { setEditingPost({ id: post.id, title: post.title, content: post.content, attachments: [...(post.attachments ?? [])], newFiles: [], attachmentError: null, preferAttachmentCover: Boolean(post.preferAttachmentCover) }); setOpenMenuId(null); }} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]">Editar</button>
                      <button type="button" onClick={() => handleTogglePost(post.id)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">Eliminar</button>
                    </>
                  )}
                  {post.user?.id !== auth.id && (
                    <>
                      <button type="button" onClick={() => handleUserInteraction(post.user.id, 'MUTE')} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]">Silenciar</button>
                      <button type="button" onClick={() => handleUserInteraction(post.user.id, 'BLOCK')} className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]">Bloquear</button>
                      <button type="button" onClick={() => { setReportTargetId(post.id); setOpenMenuId(null); }} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">Reportar</button>
                    </>
                  )}
                  {isModerator && post.user?.id !== auth.id && (
                    <button type="button" onClick={() => { setModerationTarget({ kind: 'inquiry', id: post.id }); setModerationError(null); setOpenMenuId(null); }} className="block w-full border-t border-slate-100 px-4 py-2 text-left text-amber-700 hover:bg-amber-50">Ocultar por moderacion</button>
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
                  {editingPost.attachments.length > 0 && (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {editingPost.attachments.map((attachment) => (
                        <li key={attachment.id || attachment.fileUrl} className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/60">
                          <i className="fa-solid fa-paperclip text-slate-400" />
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{attachment.originalFileName}</span>
                          <button type="button" onClick={() => setEditingPost((current) => ({ ...current, attachments: current.attachments.filter((item) => item.id !== attachment.id) }))} className="text-slate-400 hover:text-red-600" aria-label={`Quitar ${attachment.originalFileName}`}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <AttachmentDraftPicker
                    files={editingPost.newFiles}
                    onChange={(newFiles) => setEditingPost((current) => ({ ...current, newFiles }))}
                    onError={(attachmentError) => setEditingPost((current) => ({ ...current, attachmentError }))}
                    compact
                  />
                  {editingPost.attachmentError && <p className="text-xs font-semibold text-red-600">{editingPost.attachmentError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={Boolean(editingPost.attachmentError) || isUploading} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{isUploading ? 'Subiendo...' : 'Guardar'}</button>
                    <button type="button" onClick={() => setEditingPost(null)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className={`font-semibold ${isAdminPost ? 'text-blue-950 dark:text-blue-100' : 'text-slate-800 dark:text-slate-100'}`}>{post.title}</h2>
                  {post.content && (
                    <ExpandableText className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${isAdminPost ? 'text-blue-900 dark:text-blue-100/85' : 'text-slate-700 dark:text-slate-300'}`}>
                      {post.content}
                    </ExpandableText>
                  )}
                </>
              )}
              {editingPost?.id !== post.id && (
                <MediaComponent textContext={post.content} fileUrl={post.fileUrl} attachments={post.attachments} preferAttachmentCover={post.preferAttachmentCover} />
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-white/10">
              <div className={`inline-flex items-center overflow-hidden rounded-full border text-xs font-semibold transition ${isLiked ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-blue-200' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'}`}>
                <button
                  type="button"
                  disabled={isReacting}
                  onClick={() => handleReaction(post)}
                  aria-pressed={isLiked}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 transition hover:bg-blue-100 disabled:opacity-50 dark:hover:bg-blue-500/15"
                >
                  <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`} />
                  Me gusta
                </button>
                {post.user?.id === auth.id || isModerator ? (
                  <button type="button" onClick={() => setReactionUsersInquiryId(post.id)} className="border-l border-current/15 px-2.5 py-1.5 transition hover:bg-blue-100 dark:hover:bg-blue-500/15" aria-label={`Ver ${post.reactions.length} reacciones`}>
                    {post.reactions.length}
                  </button>
                ) : (
                  <span className="border-l border-current/15 px-2.5 py-1.5">{post.reactions.length}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenThreads((current) => ({ ...current, [post.id]: true }));
                  setCommentFocusRequest((current) => ({ ...current, [post.id]: (current[post.id] ?? 0) + 1 }));
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-500"
              >
                <i className="fa-regular fa-comment" />
                {post.comments.length} comentarios
              </button>
              {isModerator && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                  <i className="fa-solid fa-flag" />
                  {post.reportCount ?? 0} reportes
                </span>
              )}
            </div>

            {threadOpen && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-white/10">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <i className="fa-regular fa-comment mr-1.5" />
                    {post.comments.length} {post.comments.length === 1 ? 'comentario' : 'comentarios'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenThreads((current) => ({ ...current, [post.id]: false }))}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
                    aria-label="Cerrar hilo de comentarios"
                  >
                    <i className="fa-solid fa-xmark" />
                    Cerrar
                  </button>
                </div>
                <CommentThread
                  comments={post.comments}
                  submitting={isCommenting || isUploadingComment}
                  onComment={(parentCommentId, commentContent, commentFiles, replyTargetCommentId) =>
                    handleComment(post.id, parentCommentId, commentContent, commentFiles, replyTargetCommentId)
                  }
                  onReport={() => setReportTargetId(post.id)}
                  onToggleReaction={handleCommentReaction}
                  auth={auth}
                  isModerator={isModerator}
                  onEditComment={handleEditComment}
                  onToggleComment={handleToggleComment}
                  onModerateComment={(commentId) => {
                    setModerationTarget({ kind: 'comment', id: commentId });
                    setModerationError(null);
                  }}
                  focusRequest={commentFocusRequest[post.id]}
                  targetCommentId={post.id === targetInquiryId ? targetCommentId : null}
                />
              </div>
            )}
          </article>
        );
      })}

      {feedPage?.hasNextPage && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={inquiriesLoading}
          className="self-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-300/20 dark:bg-slate-900/80 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          {inquiriesLoading ? 'Cargando...' : isSearchResultsView ? 'Buscar mas' : 'Cargar mas publicaciones'}
        </button>
      )}

      {isSearchResultsView && posts.length > 0 && !feedPage?.hasNextPage && (
        <p className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-400">
          No hay mas resultados.
        </p>
      )}

      <ReactionUsersModal
        inquiryId={reactionUsersInquiryId}
        isOpen={Boolean(reactionUsersInquiryId)}
        onClose={() => setReactionUsersInquiryId(null)}
      />

      <ReportModal
        isOpen={Boolean(reportTargetId)}
        inquiryId={reportTargetId}
        onClose={() => setReportTargetId(null)}
        onReported={() => showFeedback('success', 'El reporte fue enviado a moderacion.')}
      />

      <ModerationReasonModal
        target={moderationTarget}
        submitting={moderatingInquiry || moderatingComment}
        error={moderationError}
        onClose={() => {
          if (!moderatingInquiry && !moderatingComment) setModerationTarget(null);
        }}
        onConfirm={handleModerationConfirm}
      />
    </div>
  );
};
