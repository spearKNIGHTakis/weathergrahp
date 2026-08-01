import { useEffect, useRef, useState } from 'react';

// Counts up from 0 to the target value on mount/change, respecting reduced motion.
export default function AnimatedNumber({ value, duration = 900, className = '' }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || value == null) {
      setDisplay(value ?? 0);
      return;
    }
    const start = performance.now();
    const from = 0;
    const to = value;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={`tabular ${className}`}>{display}</span>;
}
