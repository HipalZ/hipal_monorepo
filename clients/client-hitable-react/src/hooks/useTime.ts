import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";

export function useTimeAgoTicking(
  ts: string | number | Date,
  minStepMs = 30_000,
) {
  const date = useMemo(() => new Date(ts), [ts]);
  const [label, setLabel] = useState(() =>
    formatDistanceToNowStrict(date, { addSuffix: true }),
  );

  useEffect(() => {
    const update = () =>
      setLabel(formatDistanceToNowStrict(date, { addSuffix: true }));
    const age = Date.now() - date.getTime();
    const step = age < 60_000 ? 1_000 : minStepMs;

    update();
    let id = setInterval(update, step);
    const onVis = () => {
      clearInterval(id);
      update();
      id = setInterval(update, step);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [date, minStepMs]);

  return label;
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

  const pad = (n: number) => n.toString().padStart(2, "0");
  const hms = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const exact = format(new Date(start), "PPpp");
  return { total, h, m, s, hms, exact };
}
