import React, { useMemo, useState } from 'react';
import { MediaGalleryModal } from './MediaGalleryModal';

const selectVisibleItems = (items, maximumVisible) => {
  if (items.length <= maximumVisible || items[0]?.kind === 'youtube') {
    return items.slice(0, maximumVisible);
  }

  const youtubeItem = items.find((item) => item.kind === 'youtube');
  if (!youtubeItem) return items.slice(0, maximumVisible);

  return [
    items[0],
    youtubeItem,
    ...items.slice(1).filter((item) => item.key !== youtubeItem.key),
  ].slice(0, maximumVisible);
};

export const MediaGrid = ({ items, renderItem, compact = false }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const maximumVisible = compact ? 3 : 5;
  const visibleItems = useMemo(
    () => selectVisibleItems(items, maximumVisible),
    [items, maximumVisible],
  );
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const secondaryCount = Math.max(0, visibleItems.length - 1);

  if (items.length === 0) return null;

  return (
    <>
      <div
        data-testid="media-grid"
        className={compact
          ? 'grid max-h-80 grid-cols-2 gap-1 overflow-hidden rounded-xl'
          : 'grid grid-cols-2 auto-rows-[minmax(8rem,1fr)] gap-1.5 overflow-hidden rounded-xl sm:h-[32rem] sm:grid-cols-4 sm:grid-rows-2'}
      >
        {visibleItems.map((item, index) => {
          const isPrimary = index === 0;
          const secondaryCellClass = secondaryCount === 1
            ? 'col-span-2 min-h-40 sm:row-span-2'
            : secondaryCount === 2
              ? 'col-span-2 min-h-36 sm:row-span-1'
              : 'col-span-1 min-h-32 sm:row-span-1';
          const cellClass = compact
            ? isPrimary ? 'col-span-2 min-h-40' : 'col-span-1 min-h-28'
            : isPrimary ? 'col-span-2 min-h-56 sm:row-span-2' : secondaryCellClass;
          const isOverflowCell = hiddenCount > 0 && index === visibleItems.length - 1;

          return (
            <div key={item.key} data-testid="media-tile" className={`relative min-w-0 overflow-hidden bg-slate-100 dark:bg-slate-700/70 ${cellClass}`}>
              {renderItem(item, index, !isPrimary || compact)}
              {isOverflowCell && (
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  aria-label={`Ver ${hiddenCount} ${hiddenCount === 1 ? 'archivo adjunto mas' : 'archivos adjuntos mas'}`}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-slate-700/68 px-3 text-center text-2xl font-black text-slate-100 backdrop-blur-[1px] transition hover:bg-slate-700/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                >
                  +{hiddenCount}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <MediaGalleryModal isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} items={items} renderItem={renderItem} />
    </>
  );
};
