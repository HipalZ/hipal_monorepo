// src/components/hooks/useGridAutoSpan.ts
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Measure the element height and compute row span for CSS-grid masonry.
 * - rowHeight MUST match [grid-auto-rows] in the grid container
 * - gap MUST match the grid gap (vertical)
 */
export function useGridAutoSpan<T extends HTMLElement>(
  deps: any[] = [],
  rowHeight = 12, // finer granularity -> tighter packing
  gap = 8,
) {
  const ref = useRef<T | null>(null);
  const [span, setSpan] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // offsetHeight includes padding + border; we add gap fudge so rows snap correctly
      const h = el.offsetHeight;
      const rows = Math.ceil((h + gap) / rowHeight);
      setSpan(Math.max(rows, 1));
    };

    // initial + next frame (ensures layout settled)
    measure();
    const raf = requestAnimationFrame(measure);

    // resize + content mutation observers
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useMemo(
    () => ({
      ref,
      style: { gridRowEnd: `span ${span}` } as React.CSSProperties,
    }),
    [span],
  );
}
