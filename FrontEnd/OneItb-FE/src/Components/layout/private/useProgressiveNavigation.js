import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const DEFAULT_GAP = 4;
const DEFAULT_OVERFLOW_WIDTH = 36;

export const calculateVisibleItemCount = ({
  availableWidth,
  itemWidths,
  gap = DEFAULT_GAP,
  overflowWidth = DEFAULT_OVERFLOW_WIDTH,
}) => {
  const widths = Array.isArray(itemWidths)
    ? itemWidths.map((width) => Math.max(0, Number(width) || 0))
    : [];
  const available = Math.max(0, Number(availableWidth) || 0);

  if (widths.length === 0) return 0;
  if (available === 0 || widths.every((width) => width === 0)) return widths.length;

  const widthForPrefix = (count, includeOverflow) => {
    const itemTotal = widths.slice(0, count).reduce((total, width) => total + width, 0);
    const directGaps = Math.max(0, count - 1) * gap;
    const overflowGap = includeOverflow && count > 0 ? gap : 0;
    return itemTotal + directGaps + overflowGap + (includeOverflow ? overflowWidth : 0);
  };

  if (widthForPrefix(widths.length, false) <= available) return widths.length;

  for (let count = widths.length - 1; count >= 0; count -= 1) {
    if (widthForPrefix(count, true) <= available) return count;
  }

  return 0;
};

export const useProgressiveNavigation = (itemKeys = []) => {
  const containerRef = useRef(null);
  const measurementRef = useRef(null);
  const overflowMeasurementRef = useRef(null);
  const frameRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(itemKeys.length);
  const stableKey = itemKeys.join('|');

  const measure = useCallback(() => {
    const container = containerRef.current;
    const measurement = measurementRef.current;
    if (!container || !measurement) return;

    const itemWidths = Array.from(
      measurement.querySelectorAll('[data-navigation-measure-item]'),
      (element) => element.getBoundingClientRect().width,
    );
    const overflowWidth = overflowMeasurementRef.current?.getBoundingClientRect().width
      || DEFAULT_OVERFLOW_WIDTH;
    const nextCount = calculateVisibleItemCount({
      availableWidth: container.getBoundingClientRect().width,
      itemWidths,
      overflowWidth,
    });

    setVisibleCount((current) => (current === nextCount ? current : nextCount));
  }, []);

  const scheduleMeasurement = useCallback(() => {
    if (frameRef.current !== null) return;
    const requestFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
    frameRef.current = requestFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  useLayoutEffect(() => {
    let active = true;
    setVisibleCount(itemKeys.length);
    measure();

    const container = containerRef.current;
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(scheduleMeasurement)
      : null;
    if (container && observer) observer.observe(container);
    window.addEventListener('resize', scheduleMeasurement);

    if (document.fonts?.ready) {
      void document.fonts.ready
        .then(() => {
          if (active) scheduleMeasurement();
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener('resize', scheduleMeasurement);
      if (frameRef.current !== null) {
        const cancelFrame = window.cancelAnimationFrame || window.clearTimeout;
        cancelFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [itemKeys.length, measure, scheduleMeasurement, stableKey]);

  return {
    containerRef,
    measurementRef,
    overflowMeasurementRef,
    visibleCount: Math.min(visibleCount, itemKeys.length),
    scheduleMeasurement,
  };
};
