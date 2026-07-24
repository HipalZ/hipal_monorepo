// Pure mapping + aggregation for the unified report. No React, no fetching.

import type { CheckoutTask } from '@/components/store/hotel/useCheckoutTasks';
import type { reviewResponse } from '@/hooks/hotel/useReviewHook';
import type { Source, UnifiedRow } from './model';

const minutes = (from?: number | null, to?: number | null): number | null =>
  from && to && to >= from ? (to - from) / 60000 : null;

// ── review matching ──────────────────────────────────────────────────────────
// A review may link straight to an alert, or only to guest+room+service; try the
// exact alertId link first, then a best-effort match after the request time.
const servicesOverlap = (a?: Array<{ name?: string }>, b?: Array<{ name?: string }>): boolean => {
  const names = new Set(a?.map((s) => s?.name?.toLowerCase()).filter(Boolean));
  return Boolean(b?.some((s) => names.has(s?.name?.toLowerCase())));
};

const findReview = (a: GuestAlert, reviews: reviewResponse[]): reviewResponse | undefined => {
  const exact = reviews.find((r) => {
    const linked = typeof r.alertId === 'object' && r.alertId ? r.alertId._id : undefined;
    return a._id && linked === a._id;
  });
  if (exact) return exact;
  return reviews.find((r) => {
    const user = typeof r.userId === 'object' && r.userId ? r.userId : null;
    const sameGuest = user?.phone && user.phone === a.createdBy?.phone;
    const sameRoom = r.roomId?.name && r.roomId.name === a.roomId?.name;
    const reviewAlert = typeof r.alertId === 'object' && r.alertId ? r.alertId : null;
    const sameService = servicesOverlap(a.serviceIds, reviewAlert?.serviceIds);
    const afterRequest = r.date && a.createdAt ? r.date >= a.createdAt : true;
    return Boolean(sameGuest && sameRoom && sameService && afterRequest);
  });
};

/** Rating (1–5) + free-text feedback pulled off a matched review. */
const reviewOf = (a: GuestAlert, reviews: reviewResponse[]): { rating: number | null; feedback: string } => {
  const review = reviews.length ? findReview(a, reviews) : undefined;
  return {
    rating: review?.reviewRating ?? null,
    feedback: review?.note || review?.improvementAreas?.filter(Boolean).join(', ') || '',
  };
};

const floorOf = (room: string): string => {
  const digits = room.replace(/\D/g, '');
  return digits.length >= 2 ? `Floor ${digits[0]}` : '—';
};

/** Raw guest alert, as returned by fetch_alert_history (populated refs). */
type GuestAlert = {
  _id?: string;
  createdAt?: number;
  acceptedAt?: number;
  deliveredAt?: number;
  isEscalated?: boolean;
  // Escalation tier reached (1-based), same field the Escalation Report shows.
  level?: number;
  alertProgress?: string;
  serviceIds?: Array<{ name?: string; avgAcceptanceTime?: number; avgDeliveryTime?: number }>;
  roomId?: { name?: string };
  createdBy?: { name?: string; phone?: string };
  raisedByStaff?: { name?: string };
  acceptedBy?: { name?: string };
  deliveredBy?: { name?: string };
};

const OPEN_GUEST = new Set(['CREATED', 'ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION', 'NON_ACCEPTED_AND_ESCALATION']);

/** A guest request → unified row. Accept leg + deliver leg = total SLA. */
export const mapGuestAlert = (
  a: GuestAlert,
  index: number,
  visitsByPhone: Record<string, number> = {},
  reviews: reviewResponse[] = [],
): UnifiedRow => {
  const { rating, feedback } = reviewOf(a, reviews);
  const services = a.serviceIds ?? [];
  const acceptSla = services.reduce((s, x) => s + (x.avgAcceptanceTime ?? 0), 0);
  const deliverSla = services.reduce((s, x) => s + (x.avgDeliveryTime ?? 0), 0);
  const totalSla = acceptSla + deliverSla;
  const acceptMins = minutes(a.createdAt, a.acceptedAt);
  const deliverMins = minutes(a.acceptedAt, a.deliveredAt);
  const totalMins = minutes(a.createdAt, a.deliveredAt);
  const verdict = totalMins != null && totalSla > 0 ? totalSla - totalMins : null;
  const room = a.roomId?.name || '—';
  return {
    id: a._id || `g-${index}`,
    source: 'GUEST',
    room,
    floor: floorOf(room),
    service: services.map((x) => x.name).filter(Boolean).join(', ') || '—',
    requesterName: a.createdBy?.name || 'Guest',
    requesterPhone: a.createdBy?.phone || '',
    requesterKind: 'GUEST',
    visits: a.createdBy?.phone ? visitsByPhone[a.createdBy.phone] ?? null : null,
    guestName: a.createdBy?.name || 'Guest',
    guestPhone: a.createdBy?.phone || '',
    // Guest alerts carry only the requester; companions come from checkouts.
    companions: [],
    servicedBy: a.deliveredBy?.name || a.acceptedBy?.name || '',
    acceptedByName: a.acceptedBy?.name || '',
    completedByName: a.deliveredBy?.name || '',
    operatorName: a.raisedByStaff?.name || '',
    raisedAt: a.createdAt ?? 0,
    acceptMins,
    acceptSla,
    totalMins,
    totalSla,
    verdict,
    onTime: verdict == null ? null : verdict >= 0,
    escalated: Boolean(a.isEscalated),
    escalationLevel: a.isEscalated ? a.level ?? 1 : null,
    deliverMins,
    deliverSla,
    open: OPEN_GUEST.has(a.alertProgress ?? ''),
    rating,
    feedback,
  };
};

/** A checkout turnover job → unified row. Accept + complete = total SLA. */
// The turnover ladder maps onto the same L1/L2/L3 tiers as the guest flow:
// floor staff → all floors → manager. FLOOR is the initial offer, not an
// escalation, so it carries no level.
const STAGE_LEVEL: Record<string, number | null> = { FLOOR: null, ALL_FLOORS: 2, MANAGER: 3 };

export const mapCheckoutTask = (t: CheckoutTask, index: number, visitsByPhone: Record<string, number> = {}): UnifiedRow => {
  const acceptMins = minutes(t.createdAt, t.acceptedAt);
  // The "complete" leg mirrors a guest's delivery leg: accepted → done.
  const deliverMins = minutes(t.acceptedAt, t.completedAt);
  const totalMins = minutes(t.createdAt, t.completedAt);
  const totalSla = t.acceptMins + t.completeMins;
  const verdict = totalMins != null ? totalSla - totalMins : null;
  const room = t.roomId?.name || '—';
  const escalationLevel = STAGE_LEVEL[t.stage ?? 'FLOOR'] ?? null;
  return {
    id: t._id || `c-${index}`,
    source: 'CHECKOUT',
    room,
    floor: t.zoneId?.name || floorOf(room),
    service: t.serviceId?.name || '—',
    requesterName: t.triggeredBy?.name || '',
    requesterPhone: t.triggeredBy?.phone || '',
    // Empty triggeredBy is a genuine "automatic" job, never a placeholder name.
    requesterKind: t.triggeredBy?.name ? 'FRONT_OFFICE' : 'AUTOMATIC',
    visits: t.guestPhone ? visitsByPhone[t.guestPhone] ?? null : null,
    // guests[0] is the primary; fall back to the denormalised fields for tasks
    // raised before the occupant snapshot existed.
    guestName: t.guests?.[0]?.name || t.guestName || '',
    guestPhone: t.guests?.[0]?.phone || t.guestPhone || '',
    companions: (t.guests ?? []).slice(1).map((g) => ({ name: g.name || '', phone: g.phone || '' })),
    servicedBy: t.completedBy?.name || t.acceptedBy?.name || '',
    acceptedByName: t.acceptedBy?.name || '',
    completedByName: t.completedBy?.name || '',
    operatorName: '',
    raisedAt: t.createdAt,
    acceptMins,
    acceptSla: t.acceptMins,
    totalMins,
    totalSla,
    verdict,
    onTime: verdict == null ? null : verdict >= 0,
    // Widening to all floors is itself an escalation, so L2+ counts as escalated.
    escalated: Boolean(t.escalatedAt) || escalationLevel != null,
    escalationLevel,
    deliverMins,
    deliverSla: t.completeMins,
    open: t.status === 'PENDING' || t.status === 'ACCEPTED',
    // Nobody rates a room turnover after checkout — always blank for these.
    rating: null,
    feedback: '',
  };
};

export const buildRows = (
  alerts: GuestAlert[],
  tasks: CheckoutTask[],
  visitsByPhone: Record<string, number> = {},
  reviews: reviewResponse[] = [],
): UnifiedRow[] =>
  [
    ...alerts.map((a, i) => mapGuestAlert(a, i, visitsByPhone, reviews)),
    ...tasks.map((t, i) => mapCheckoutTask(t, i, visitsByPhone)),
  ].sort((a, b) => b.raisedAt - a.raisedAt);

// ── aggregates ───────────────────────────────────────────────────────────────

const mean = (v: number[]): number | null => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
const isNum = (n: number | null): n is number => n != null;

export type Summary = {
  total: number;
  guest: number;
  checkout: number;
  open: number;
  escalated: number;
  onTime: number;
  judged: number;
  onTimeRate: number | null;
  avgAccept: number | null;
  /** Second leg (accept → done). "Complete" not "deliver" — not every service
   *  hands over an item; some just finish a task. Spans both request types. */
  avgComplete: number | null;
  /** Mean guest rating across reviewed requests; null when none reviewed. */
  avgRating: number | null;
  /** How many requests carry a rating — the base avgRating is drawn from. */
  reviewed: number;
};

/**
 * Metrics that are honest across both types (volume, on-time, escalations,
 * accept speed) plus the two type-specific ones. The page only surfaces the
 * type-specific values when a single source is selected — averaging a delivery
 * leg that half the rows don't have would be a lie.
 */
export const summarize = (rows: UnifiedRow[]): Summary => {
  const judged = rows.filter((r) => r.onTime != null);
  const onTime = judged.filter((r) => r.onTime).length;
  const rated = rows.map((r) => r.rating).filter(isNum);
  return {
    total: rows.length,
    guest: rows.filter((r) => r.source === 'GUEST').length,
    checkout: rows.filter((r) => r.source === 'CHECKOUT').length,
    open: rows.filter((r) => r.open).length,
    escalated: rows.filter((r) => r.escalated).length,
    onTime,
    judged: judged.length,
    onTimeRate: judged.length ? Math.round((onTime / judged.length) * 100) : null,
    avgAccept: mean(rows.map((r) => r.acceptMins).filter(isNum)),
    avgComplete: mean(rows.map((r) => r.deliverMins).filter(isNum)),
    avgRating: rated.length ? Math.round(mean(rated)! * 10) / 10 : null,
    reviewed: rated.length,
  };
};

export type GroupStat = { key: string; total: number; onTime: number; late: number; pct: number };

export const groupBy = (rows: UnifiedRow[], pick: (r: UnifiedRow) => string): GroupStat[] => {
  const map = new Map<string, { total: number; onTime: number; late: number }>();
  for (const row of rows) {
    const key = pick(row) || '—';
    const s = map.get(key) ?? { total: 0, onTime: 0, late: 0 };
    s.total += 1;
    if (row.onTime === true) s.onTime += 1;
    if (row.onTime === false) s.late += 1;
    map.set(key, s);
  }
  return [...map.entries()]
    .map(([key, s]) => ({ key, ...s, pct: s.onTime + s.late ? (s.onTime / (s.onTime + s.late)) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);
};

/** "5m 18s" · "1h 9m" — same reading as the timing columns. */
const dur = (m: number): string => {
  const s = Math.round(Math.abs(m) * 60);
  const h = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${min}m`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

/**
 * "early" = finished that much before the SLA deadline; "late" = missed it by
 * that much. Plainer than "before/over SLA", which read as ambiguous.
 */
export const verdictText = (r: UnifiedRow): string => {
  if (r.verdict == null) return r.open ? 'In progress' : 'Not delivered';
  return r.onTime ? `${dur(r.verdict)} early` : `${dur(r.verdict)} late`;
};

export const sourceLabel = (s: Source): string => (s === 'GUEST' ? 'Guest request' : 'Checkout turnover');
