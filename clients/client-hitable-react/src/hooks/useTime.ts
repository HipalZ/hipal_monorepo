import { format, formatDistanceToNowStrict, isToday } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

export function useTimeAgoTicking(ts: string | number | Date, minStepMs = 30_000) {
  const date = useMemo(() => new Date(ts), [ts]);
  const [label, setLabel] = useState(() => formatDistanceToNowStrict(date, { addSuffix: true }));

  useEffect(() => {
    const update = () => setLabel(formatDistanceToNowStrict(date, { addSuffix: true }));
    const age = Date.now() - date.getTime();
    const step = age < 60_000 ? 1_000 : minStepMs;

    update();
    let id = setInterval(update, step);
    const onVis = () => {
      clearInterval(id);
      update();
      id = setInterval(update, step);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [date, minStepMs]);

  return label;
}

/** "1h 08m" · "2m 15s" · "45s" — never an unbounded minute count like "312:07". */
export function formatClock(ms: number) {
  const total = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

/** Bare "11:05 PM" is ambiguous once a request outlives the day it was raised. */
export const formatRaised = (ts: number) => format(ts, isToday(ts) ? 'h:mm a' : 'd MMM, h:mm a');

/**
 * A ticking `Date.now()`. Every duration on a card is derived from this single
 * value, so one interval drives them all and they can never disagree.
 *
 * Pass active=false once a request is closed: the interval is torn down rather
 * than ticking forever behind frozen text (dozens of cards would otherwise each
 * hold a live timer nothing reads).
 */
export function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    let id = setInterval(tick, 1_000);
    // Background tabs throttle intervals to ~1/min, so resync on refocus —
    // staff switch away from the tablet constantly.
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      clearInterval(id);
      tick();
      id = setInterval(tick, 1_000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active]);

  return now;
}

export function useElapsed(ts: string | number | Date) {
  const start = useMemo(() => new Date(ts).getTime(), [ts]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [start]);

  const total = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hms = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const exact = format(new Date(start), 'PPpp');
  return { total, h, m, s, hms, exact };
}
