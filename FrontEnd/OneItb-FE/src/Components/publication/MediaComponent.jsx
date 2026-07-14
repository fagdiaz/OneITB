import React, { useEffect, useMemo, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_LINK_PREVIEW } from '../../data/graphql/queries/linkPreview';
import { getMediaType, parseYouTubeContent } from '../../utils/mediaParser';
import { MediaAttachment, resolveMediaUrl, YouTubeEmbed } from './MediaAttachment';
import { MediaGrid } from './MediaGrid';

const URL_PATTERN = /https?:\/\/[^\s<>"]+/i;

const MediaComponent = ({
  textContext = '',
  fileUrl,
  attachments,
  previewData,
  compact = false,
  preferAttachmentCover = false,
}) => {
  const [fetchedPreview, setFetchedPreview] = useState(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);
  const [loadLinkPreview] = useLazyQuery(GET_LINK_PREVIEW, { fetchPolicy: 'no-cache' });
  const firstUrl = textContext.match(URL_PATTERN)?.[0] ?? null;
  const { videoId, videoIds } = useMemo(() => parseYouTubeContent(textContext), [textContext]);
  const normalizedAttachments = useMemo(() => {
    if (attachments?.length) return [...attachments].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
    return fileUrl ? [{ id: `legacy:${fileUrl}`, fileUrl }] : [];
  }, [attachments, fileUrl]);
  const imageGallery = useMemo(
    () => normalizedAttachments
      .filter((attachment) => getMediaType(attachment.fileUrl, attachment.contentType) === 'image')
      .map((attachment) => ({
        src: resolveMediaUrl(attachment.fileUrl),
        title: attachment.originalFileName || 'Imagen adjunta',
      })),
    [normalizedAttachments],
  );
  const imageIndexByUrl = useMemo(
    () => new Map(imageGallery.map((item, index) => [item.src, index])),
    [imageGallery],
  );

  useEffect(() => {
    if (!firstUrl || videoId || previewData) {
      setFetchedPreview(null);
      return undefined;
    }

    let cancelled = false;
    const fetchLinkPreview = async () => {
      try {
        const result = await loadLinkPreview({ variables: { url: firstUrl } });
        const preview = result.data?.linkPreview;
        if (!cancelled) setFetchedPreview(preview?.success ? preview : null);
      } catch {
        if (!cancelled) setFetchedPreview(null);
      }
    };
    fetchLinkPreview();
    return () => {
      cancelled = true;
    };
  }, [firstUrl, videoId, previewData, loadLinkPreview]);

  const finalPreview = previewData || fetchedPreview;
  useEffect(() => {
    setPreviewImageFailed(false);
  }, [finalPreview?.imageUrl]);

  const showPreviewImage = Boolean(finalPreview?.imageUrl) && (
    !finalPreview.imageUrl.startsWith('data:') ||
    /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/.test(finalPreview.imageUrl)
  ) && !previewImageFailed;

  if (!videoId && normalizedAttachments.length === 0 && !finalPreview?.success) return null;
  const attachmentItems = normalizedAttachments.map((attachment) => ({
    key: `attachment:${attachment.id || attachment.fileUrl}`,
    kind: 'attachment',
    attachment,
  }));
  const videoItems = videoIds.slice(0, 2).map((currentVideoId, index) => ({
    key: `youtube:${currentVideoId}:${index}`,
    kind: 'youtube',
    videoId: currentVideoId,
  }));
  const mediaItems = preferAttachmentCover && attachmentItems.length > 0
    ? [...attachmentItems, ...videoItems]
    : [...videoItems, ...attachmentItems];
  const renderMediaItem = (item, index, isCompact, metadata = {}) => {
    if (item.kind === 'youtube') return <YouTubeEmbed videoId={item.videoId} compact={isCompact} tile />;
    const absoluteUrl = resolveMediaUrl(item.attachment.fileUrl);
    return (
      <MediaAttachment
        attachment={item.attachment}
        compact={isCompact}
        featured={index === 0}
        tile
        landscapeCover={metadata.isLandscapePrimary}
        onIntrinsicImageDimensions={metadata.reportDimensions}
        galleryItems={imageGallery}
        galleryIndex={imageIndexByUrl.get(absoluteUrl) ?? 0}
      />
    );
  };

  return (
    <div className="mt-3 space-y-3">
      {mediaItems.length > 0 && <MediaGrid items={mediaItems} renderItem={renderMediaItem} compact={compact} />}

      {finalPreview?.success && !videoId && (
        <a
          href={finalPreview.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-800/80"
        >
          {showPreviewImage ? (
            <div className="aspect-video w-full bg-slate-200">
              <img
                src={finalPreview.imageUrl}
                alt={finalPreview.title || 'Vista previa del enlace'}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setPreviewImageFailed(true)}
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-slate-100 dark:bg-white/[0.04]">
              <i className="fa-solid fa-link text-4xl text-slate-300" />
            </div>
          )}
          <div className="p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{finalPreview.domain}</p>
            <h3 className="mb-1 line-clamp-1 text-sm font-bold text-slate-800 dark:text-slate-100">{finalPreview.title}</h3>
            {finalPreview.description && (
              <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{finalPreview.description}</p>
            )}
          </div>
        </a>
      )}
    </div>
  );
};

export default MediaComponent;
