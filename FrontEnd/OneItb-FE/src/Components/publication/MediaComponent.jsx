import React, { useState, useEffect } from 'react';

const MediaComponent = ({ textContext, fileUrl, previewData }) => {
  const [fetchedPreview, setFetchedPreview] = useState(null);

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
      const fetchMetadata = async () => {
        try {
          const res = await fetch(`/api/metadata?url=${encodeURIComponent(firstUrl)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // simple assumption, though API may just require auth cookie/header
            }
          });
          const data = await res.json();
          if (data && data.success) {
            setFetchedPreview(data);
          }
        } catch (error) {
          console.error('Failed to fetch metadata', error);
        }
      };
      fetchMetadata();
    }
  }, [firstUrl, youtubeId, previewData, fileUrl]);

  if (youtubeId) {
    return (
      <div className="mt-3">
        <iframe
          className="aspect-video w-full rounded-xl border-none"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (fileUrl) {
    const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    if (isImage) {
      return (
        <div className="mt-3">
          <img
            src={fileUrl}
            alt="Attachment"
            className="w-full max-h-[500px] object-cover rounded-xl border border-slate-200"
            loading="lazy"
          />
        </div>
      );
    } else {
      const fileName = fileUrl.split('/').pop();
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
            <p className="text-xs text-slate-500 uppercase">{fileName.split('.').pop()}</p>
          </div>
        </a>
      );
    }
  }

  const finalPreview = previewData || fetchedPreview;
  if (finalPreview && finalPreview.success) {
    return (
      <a
        href={finalPreview.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors"
      >
        {finalPreview.imageUrl && (
          <div className="aspect-video w-full bg-slate-200">
            <img
              src={finalPreview.imageUrl}
              alt={finalPreview.title || "Link preview"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
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
