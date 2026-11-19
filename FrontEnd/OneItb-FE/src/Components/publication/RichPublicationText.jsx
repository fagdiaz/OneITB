import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getYouTubeId } from '../../utils/mediaParser';

const youtubeTitleCache = new Map();
const inFlightRequests = new Map();

export const clearYouTubeTitleCache = () => {
  youtubeTitleCache.clear();
  inFlightRequests.clear();
};

export const fetchYouTubeTitle = async (videoId) => {
  if (!videoId) return null;
  if (youtubeTitleCache.has(videoId)) return youtubeTitleCache.get(videoId);
  if (inFlightRequests.has(videoId)) return inFlightRequests.get(videoId);

  const request = (async () => {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { headers: { Accept: 'application/json' } }
      );
      if (!response.ok) throw new Error('oEmbed request failed');
      const data = await response.json();
      const title = data?.title ? String(data.title).trim() : null;
      if (title) youtubeTitleCache.set(videoId, title);
      return title;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(videoId);
    }
  })();

  inFlightRequests.set(videoId, request);
  return request;
};

export const YouTubeInlineLink = ({ videoId, rawUrl }) => {
  const [title, setTitle] = useState(() => youtubeTitleCache.get(videoId) || null);

  useEffect(() => {
    if (!title && videoId) {
      let active = true;
      fetchYouTubeTitle(videoId).then((fetchedTitle) => {
        if (active && fetchedTitle) setTitle(fetchedTitle);
      });
      return () => {
        active = false;
      };
    }
  }, [videoId, title]);

  const displayTitle = title || 'Ver video en YouTube';
  const targetUrl = rawUrl || `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-red-200/80 bg-red-50/90 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-2xs transition hover:border-red-300 hover:bg-red-100 hover:text-red-800 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25 dark:hover:text-red-200 cursor-pointer align-baseline my-0.5 no-underline group"
      title={`${displayTitle} (Abrir en YouTube)`}
    >
      <i className="fa-brands fa-youtube text-red-600 text-sm group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
      <span className="truncate underline decoration-red-400/40 underline-offset-2">
        {displayTitle}
      </span>
      <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-red-500/80 ml-0.5 shrink-0" aria-hidden="true" />
    </a>
  );
};

const MENTION_OR_URL_PATTERN = /(@[\p{L}\p{N}._-]+|https?:\/\/[^\s<>"']+)/gu;
const TRAILING_PUNCTUATION = /[),.!?;:]+$/;
const normalizeAlias = (value) => String(value || '').trim().replace(/^@/, '').toLocaleLowerCase('es-AR');

export const RichPublicationText = ({ text = '', users = [], className = '' }) => {
  const usersByAlias = useMemo(() => {
    const aliases = new Map();
    users.filter((user) => user?.id).forEach((user) => {
      const candidates = [
        user.firstName,
        user.username,
        user.alias,
        user.fullName?.replace(/\s+/g, ''),
      ];
      candidates.forEach((candidate) => {
        const normalized = normalizeAlias(candidate);
        if (normalized && !aliases.has(normalized)) aliases.set(normalized, user);
      });
    });
    return aliases;
  }, [users]);

  if (!text) return null;

  const parts = String(text).split(MENTION_OR_URL_PATTERN);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if it's a mention
        if (part.startsWith('@')) {
          const user = usersByAlias.get(normalizeAlias(part));
          if (user) {
            return (
              <Link
                key={`mention:${index}:${part}`}
                to={`/profile/${user.id}`}
                className="font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-cyan-300 cursor-pointer"
              >
                {part}
              </Link>
            );
          }
          return <React.Fragment key={`text:${index}`}>{part}</React.Fragment>;
        }

        // Check if it's a URL
        if (/^https?:\/\//i.test(part)) {
          const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? '';
          const cleanUrl = trailing ? part.slice(0, -trailing.length) : part;
          const youtubeId = getYouTubeId(cleanUrl);

          if (youtubeId) {
            return (
              <React.Fragment key={`yt:${index}:${youtubeId}`}>
                <YouTubeInlineLink videoId={youtubeId} rawUrl={cleanUrl} />
                {trailing}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`url:${index}`}>
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
              >
                {cleanUrl}
              </a>
              {trailing}
            </React.Fragment>
          );
        }

        return <React.Fragment key={`text:${index}`}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export default RichPublicationText;
