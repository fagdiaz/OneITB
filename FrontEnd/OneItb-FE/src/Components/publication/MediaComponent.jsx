import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_LINK_PREVIEW } from '../../data/graphql/queries/linkPreview';
import { MediaAttachment, YouTubeEmbed } from './MediaAttachment';

const MediaComponent = ({ textContext, fileUrl, previewData }) => {
  const [fetchedPreview, setFetchedPreview] = useState(null);
  const [loadLinkPreview] = useLazyQuery(GET_LINK_PREVIEW, { fetchPolicy: 'no-cache' });

  // 1. Detect YouTube
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractUrlFromText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    return urls.length > 0 ? urls[0] : null;
  };

  const firstUrl = extractUrlFromText(textContext);
  const youtubeId = firstUrl ? getYoutubeVideoId(firstUrl) : null;

  useEffect(() => {
    // If there's a standard link (not youtube), no fileUrl, and no previewData passed in, fetch it dynamically.
    if (firstUrl && !youtubeId && !previewData && !fileUrl) {
      let cancelled = false;
      const fetchLinkPreview = async () => {
        try {
          const result = await loadLinkPreview({ variables: { url: firstUrl } });
          const preview = result.data?.linkPreview;
          if (!cancelled) {
            setFetchedPreview(preview?.success ? preview : null);
          }
        } catch {
          if (!cancelled) setFetchedPreview(null);
        }
      };
      fetchLinkPreview();
      return () => {
        cancelled = true;
      };
    }
    setFetchedPreview(null);
    return undefined;
  }, [firstUrl, youtubeId, previewData, fileUrl, loadLinkPreview]);

  if (youtubeId) {
    return (
      <div className="mt-3">
        <YouTubeEmbed videoId={youtubeId} />
      </div>
    );
  }

  if (fileUrl) {
    return (
      <div className="mt-3">
        <MediaAttachment fileUrl={fileUrl} />
      </div>
    );
  }

  const finalPreview = previewData || fetchedPreview;
  if (finalPreview && finalPreview.success) {
    const isValidImage = (url) => {
      if (!url) return false;
      if (url.startsWith('data:')) {
        return /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/.test(url);
      }
      return true;
    };
    const showImage = isValidImage(finalPreview.imageUrl);

    return (
      <a
        href={finalPreview.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-800/80"
      >
        {showImage ? (
          <div className="aspect-video w-full bg-slate-200">
            <img
              src={finalPreview.imageUrl}
              alt={finalPreview.title || "Link preview"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-slate-100 flex items-center justify-center">
            <i className="fa-solid fa-link text-4xl text-slate-300" />
          </div>
        )}
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{finalPreview.domain}</p>
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{finalPreview.title}</h3>
          {finalPreview.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{finalPreview.description}</p>
          )}
        </div>
      </a>
    );
  }

  return null;
};

export default MediaComponent;
