import React, { useEffect, useRef, useState } from 'react';

export const RevealOnScroll = ({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  threshold = 0.14,
  ...rest
}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const prefersReducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof window.IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold, rootMargin: '0px 0px -7% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={elementRef}
      {...rest}
      className={[
        'transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        className,
      ].join(' ')}
      style={{ transitionDelay: isVisible && delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Component>
  );
};
