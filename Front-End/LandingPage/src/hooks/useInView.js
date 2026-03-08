import { useEffect, useRef, useState } from 'react';

export default function useInView({ root = null, rootMargin = '0px', threshold = 0.12 } = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // respect reduced motion: reveal immediately but avoid synchronous setState
      requestAnimationFrame(() => setIsIntersecting(true));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            // one-time reveal: unobserve after first intersect
            obs.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [root, rootMargin, threshold]);

  return [ref, isIntersecting];
}