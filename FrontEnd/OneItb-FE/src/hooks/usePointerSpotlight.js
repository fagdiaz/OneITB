import { useCallback, useEffect, useRef } from 'react';

export const usePointerSpotlight = ({
  xProperty = '--spotlight-x',
  yProperty = '--spotlight-y',
  enabled = true,
} = {}) => {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canTrackRef = useRef(enabled);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const pointerQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: fine)')
      : null;

    const updateCapability = () => {
      canTrackRef.current = enabled
        && !motionQuery?.matches
        && (pointerQuery ? pointerQuery.matches : true);

      if (!canTrackRef.current) {
        element.style.setProperty(xProperty, '-9999px');
        element.style.setProperty(yProperty, '-9999px');
      }
    };

    element.style.setProperty(xProperty, '-9999px');
    element.style.setProperty(yProperty, '-9999px');
    updateCapability();
    motionQuery?.addEventListener?.('change', updateCapability);
    pointerQuery?.addEventListener?.('change', updateCapability);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      motionQuery?.removeEventListener?.('change', updateCapability);
      pointerQuery?.removeEventListener?.('change', updateCapability);
    };
  }, [enabled, xProperty, yProperty]);

  const onPointerMove = useCallback((event) => {
    if (!canTrackRef.current) return;
    const clientX = event.clientX;
    const clientY = event.clientY;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const element = containerRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty(xProperty, `${clientX - bounds.left}px`);
      element.style.setProperty(yProperty, `${clientY - bounds.top}px`);
      animationFrameRef.current = null;
    });
  }, [xProperty, yProperty]);

  const onPointerLeave = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const element = containerRef.current;
    element?.style.setProperty(xProperty, '-9999px');
    element?.style.setProperty(yProperty, '-9999px');
  }, [xProperty, yProperty]);

  return {
    containerRef,
    spotlightHandlers: { onPointerMove, onPointerLeave },
  };
};
