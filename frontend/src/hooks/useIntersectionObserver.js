/**
 * Custom hook for Intersection Observer API
 * Useful for lazy loading, infinite scroll, animations on scroll
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer hook
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Threshold for intersection
 * @param {string} options.rootMargin - Root margin
 * @returns {[React.RefObject, boolean]} - [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, hasIntersected]);

  return [elementRef, isIntersecting, hasIntersected];
};

