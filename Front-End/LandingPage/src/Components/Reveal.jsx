import React from 'react';
import useInView from '../hooks/useInView';

export default function Reveal({ children, className = '', threshold = 0.12, delay = 0 }) {
  const [ref, inView] = useInView({ threshold });

  // Respect reduced-motion fallback already handled in hook
  // initial: opacity-0 translate-y-4
  // visible: opacity-100 translate-y-0
  const base = 'transition-all duration-500 ease-out will-change-transform';
  const hidden = 'opacity-0 translate-y-4';
  const visible = 'opacity-100 translate-y-0';

  // optional inline style delay (milliseconds)
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={`${base} ${className} ${inView ? visible : hidden}`}
      style={style}
      aria-hidden={!inView && undefined}
    >
      {children}
    </div>
  );
}