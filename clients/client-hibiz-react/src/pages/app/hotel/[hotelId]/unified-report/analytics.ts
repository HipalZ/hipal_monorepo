// Pure mapping + aggregation for the unified report. No React, no fetching.

import type { CheckoutTask } from '@/components/store/hotel/useCheckoutTasks';
import type { reviewResponse } from '@/hooks/hotel/useReviewHook';
import type { Source, UnifiedRow } from './model';

const minutes = (from?: number | null, to?: number | null): number | null =>
  from && to && to >= from ? (to - from) / 60000 : null;

const isSlaLate = (actual: number | null, sla: number): boolean => actual != null && sla > 0 && actual > sla;

const serviceAcceptanceSla = (service?: { avgAcceptanceTime?: number }): number => service?.avgAcceptanceTime ?? 0;

const serviceCompletionSla = (service?: { avgDeliveryTime?: number; avgCompletionTime?: number }): number =>
  service?.avgDeliveryTime ?? service?.avgCompletionTime ?? 0;

const FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS = 0.5;
const FOOD_ORDER_FULFILLMENT_FALLBACK_MINS = 30;

type FoodOrderSlaSettings = {
  avgAcceptanceTime: number;
  avgDeliveryTime: number;
  useItemPrepTime: boolean;
};

const normalizeFoodOrderSlaSettings = (settings?: Partial<FoodOrderSlaSettings> | null): FoodOrderSlaSettings => ({
  avgAcceptanceTime: Number(settings?.avgAcceptanceTime) > 0 ? Number(settings?.avgAcceptanceTime) : FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS,
  avgDeliveryTime: Number(settings?.avgDeliveryTime) > 0 ? Number(settings?.avgDeliveryTime) : FOOD_ORDER_FULFILLMENT_FALLBACK_MINS,
  useItemPrepTime: settings?.useItemPrepTime !== false,
});

const cartItemName = (item: any): string => {
  const dishName = item?.dish?.name || item?.name || item?.dishName || '';
  const portionName = item?.portion?.name ? ` - ${item.portion.name}` : '';
  const extras =
    item?.extras
      ?.map((extra: any) => `${extra?.name || ''}${extra?.quantity > 1 ? ` x${extra.quantity}` : ''}`)
      .filter(Boolean)
      .join(', ') || '';
  return [dishName, portionName, extras ? ` + ${extras}` : ''].filter(Boolean).join('');
};

const hasFoodCartItems = (cart?: any[]): boolean =>
  Boolean(cart?.some((item) => item?.dish || item?.dishId || item?.name || item?.dishName));

const foodCartItemPrepMins = (item: any, fallbackMins: number): number => {
  const prepMins = Number(item?.dish?.avgPrepTime ?? item?.dish?.avgPreparationTime ?? item?.avgPrepTime ?? item?.avgPreparationTime ?? 0);
  return prepMins > 0 ? prepMins : fallbackMins;
};

const foodOrderFulfillmentSla = (cart?: any[], settings?: Partial<FoodOrderSlaSettings> | null): number => {
  if (!hasFoodCartItems(cart)) return 0;
  const normalized = normalizeFoodOrderSlaSettings(settings);
  const prepMins = normalized.useItemPrepTime ? Math.max(...cart!.map((item) => foodCartItemPrepMins(item, normalized.avgDeliveryTime))) : 0;
  return prepMins > 0 ? prepMins : normalized.avgDeliveryTime;
};

const foodOrderAcceptanceSla = (cart?: any[], settings?: Partial<FoodOrderSlaSettings> | null): number =>
  hasFoodCartItems(cart) ? normalizeFoodOrderSlaSettings(settings).avgAcceptanceTime : 0;

const buildOrderItems = (cart?: any[]): string =>
  hasFoodCartItems(cart)
    ? cart
        .map((item) => {
          const name = cartItemName(item);
          if (!name) return '';
          return `${name} x${item?.quantity ?? 1}`;
        })
        .filter(Boolean)
        .join(' | ')
    : '';

const cartQuantity = (cart?: any[]): number =>
  hasFoodCartItems(cart) ? cart!.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0;

const serviceQuantity = (items?: Array<{ quantity?: number }>, cart?: any[]): number => {
  const serviceTotal = items?.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) ?? 0;
  if (serviceTotal > 0) return serviceTotal;
  const foodTotal = cartQuantity(cart);
  return foodTotal > 0 ? foodTotal : 1;
};

const SYSTEM_ALERT_SERVICE_LABELS: Record<string, string> = {
  CHECKOUT_REQUEST: 'Checkout',
  WAKE_UP_CALL: 'Wake-up Call',
};

const MISSING_SERVICE_LABEL = 'Service details unavailable';

const systemAlertServiceLabel = (message?: string): string => {
  const prefix = message?.match(/^([A-Z_]+)::/)?.[1];
  return prefix ? SYSTEM_ALERT_SERVICE_LABELS[prefix] || '' : '';
};

const serviceLabel = (services: GuestAlert['serviceIds'] = [], cart?: any[], message?: string): string => {
  const names = services.map((x) => x.name).filter(Boolean).join(', ');
  if (names) return names;
  // System-generated alerts intentionally have no serviceIds. Their stable
  // message prefix is the service identity used by the rest of the hotel UI.
  const systemLabel = systemAlertServiceLabel(message);
  if (systemLabel) return systemLabel;
  if (message && /check\s*-?\s*out/i.test(message)) return 'Checkout';
  return hasFoodCartItems(cart) ? 'Food Order' : MISSING_SERVICE_LABEL;
};

// ── review matching ──────────────────────────────────────────────────────────
// A review may link straight to an alert, or only to guest+room+service; try the
// exact alertId link first, then a best-effort match after the request time.
const servicesOverlap = (a?: Array<{ name?: string }>, b?: Array<{ name?: string }>): boolean => {
  const names = new Set(a?.map((s) => s?.name?.toLowerCase()).filter(Boolean));
  return Boolean(b?.some((s) => names.has(s?.name?.toLowerCase())));
};

type ReviewIndex = {
  byAlertId: Map<string, reviewResponse>;
  byGuestRoom: Map<string, reviewResponse[]>;
};

const guestRoomKey = (phone?: string, room?: string) => `${phone || ''}\u0000${room || ''}`;

const buildReviewIndex = (reviews: reviewResponse[]): ReviewIndex => {
  const byAlertId = new Map<string, reviewResponse>();
  const byGuestRoom = new Map<string, reviewResponse[]>();
  for (const review of reviews) {
    const linked = typeof review.alertId === 'object' && review.alertId ? review.alertId._id : undefined;
    if (linked && !byAlertId.has(linked)) byAlertId.set(linked, review);

    const user = typeof review.userId === 'object' && review.userId ? review.userId : null;
    if (!user?.phone || !review.roomId?.name) continue;
    const key = guestRoomKey(user.phone, review.roomId.name);
    const candidates = byGuestRoom.get(key) || [];
    candidates.push(review);
    byGuestRoom.set(key, candidates);
  }
  return { byAlertId, byGuestRoom };
};

const findReview = (a: GuestAlert, reviews: reviewResponse[], index?: ReviewIndex): reviewResponse | undefined => {
  const exact = a._id
    ? index
      ? index.byAlertId.get(a._id)
      : reviews.find((review) => {
          const linked = typeof review.alertId === 'object' && review.alertId ? review.alertId._id : undefined;
          return linked === a._id;
        })
    : undefined;
  if (exact) return exact;
  const candidates = index
    ? index.byGuestRoom.get(guestRoomKey(a.createdBy?.phone, a.roomId?.name)) || []
    : reviews;
  return candidates.find((r) => {
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
const reviewOf = (a: GuestAlert, reviews: reviewResponse[], index?: ReviewIndex): { rating: number | null; feedback: string } => {
  const review = reviews.length ? findReview(a, reviews, index) : undefined;
  return {
    rating: review?.reviewRating ?? null,
    feedback:
      review?.review?.trim() ||
      review?.description?.trim() ||
      review?.note?.trim() ||
      review?.improvementAreas?.filter(Boolean).join(', ') ||
      '',
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
  serviceIds?: Array<{ name?: string; avgAcceptanceTime?: number; avgCompletionTime?: number; avgDeliveryTime?: number }>;
  roomId?: { name?: string };
  createdBy?: { name?: string; phone?: string };
  raisedByStaff?: { name?: string };
  acceptedBy?: { name?: string };
  deliveredBy?: { name?: string };
  cart?: any[];
  foodOrderSlaSettings?: Partial<FoodOrderSlaSettings>;
  serviceRequestItems?: Array<{ quantity?: number }>;
  serviceInstructionSnapshot?: { message?: string };
  /** System-generated requests such as wake-up calls carry a stable prefix. */
  message?: string;
};

const OPEN_GUEST = new Set(['CREATED', 'ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION', 'NON_ACCEPTED_AND_ESCALATION']);
const CLOSED_STATUS_LABEL: Record<string, string> = {
  DELIVERED: 'Delivered',
  RESOLVED: 'Resolved',
  NOT_DELIVERED: 'Not delivered',
  REJECTED: 'Rejected',
};

export const closedStatusLabel = (status?: string): string | null => (status ? CLOSED_STATUS_LABEL[status] ?? null : null);

/** A guest request → unified row. Accept leg + deliver leg = total SLA. */
export const mapGuestAlert = (
  a: GuestAlert,
  index: number,
  visitsByPhone: Record<string, number> = {},
  reviews: reviewResponse[] = [],
  reviewIndex?: ReviewIndex,
): UnifiedRow => {
  const { rating, feedback } = reviewOf(a, reviews, reviewIndex);
  const services = a.serviceIds ?? [];
  const serviceAcceptSla = services.reduce((s, x) => s + serviceAcceptanceSla(x), 0);
  const acceptSla = serviceAcceptSla > 0 ? serviceAcceptSla : foodOrderAcceptanceSla(a.cart, a.foodOrderSlaSettings);
  const serviceDeliverSla = services.reduce((s, x) => s + serviceCompletionSla(x), 0);
  const deliverSla = serviceDeliverSla > 0 ? serviceDeliverSla : foodOrderFulfillmentSla(a.cart, a.foodOrderSlaSettings);
  const totalSla = acceptSla + deliverSla;
  const acceptMins = minutes(a.createdAt, a.acceptedAt);
  const deliverMins = minutes(a.acceptedAt, a.deliveredAt);
  const totalMins = minutes(a.createdAt, a.deliveredAt);
  const verdict = totalMins != null && totalSla > 0 ? totalSla - totalMins : null;
  const breachedLegSla = isSlaLate(acceptMins, acceptSla) || isSlaLate(deliverMins, deliverSla);
  const room = a.roomId?.name || '—';
  return {
    id: a._id || `g-${index}`,
    source: 'GUEST',
    room,
    floor: floorOf(room),
    service: serviceLabel(services, a.cart, a.message),
    quantity: serviceQuantity(a.serviceRequestItems, a.cart),
    orderItems: buildOrderItems(a.cart),
    customerInstruction: a.serviceInstructionSnapshot?.message?.trim() || '',
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
    alertProgress: a.alertProgress || '',
    raisedAt: a.createdAt ?? 0,
    acceptMins,
    acceptSla,
    totalMins,
    totalSla,
    verdict,
    onTime: verdict == null ? null : verdict >= 0,
    escalated: Boolean(a.isEscalated) || breachedLegSla,
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
  const breachedLegSla = isSlaLate(acceptMins, t.acceptMins) || isSlaLate(deliverMins, t.completeMins);
  return {
    id: t._id || `c-${index}`,
    source: 'CHECKOUT',
    room,
    floor: t.zoneId?.name || floorOf(room),
    service: t.serviceId?.name || '—',
    quantity: 1,
    orderItems: '',
    customerInstruction: '',
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
    escalated: Boolean(t.escalatedAt) || escalationLevel != null || breachedLegSla,
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
): UnifiedRow[] => {
  const reviewIndex = buildReviewIndex(reviews);
  return [
    // A rejected request was never serviced, so including it in SLA/staff
    // performance would incorrectly count it as completed work.
    ...alerts
      .filter((alert) => alert.alertProgress !== 'REJECTED')
      .map((a, i) => mapGuestAlert(a, i, visitsByPhone, reviews, reviewIndex)),
    ...tasks.map((t, i) => mapCheckoutTask(t, i, visitsByPhone)),
  ].sort((a, b) => b.raisedAt - a.raisedAt);
};

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
  /** Completion performance against each row's own SLA. Positive = early, negative = late. */
  avgCompleteSlaResult: number | null;
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
  const completionSlaResults = rows
    .filter((r) => r.deliverMins != null && r.deliverSla > 0)
    .map((r) => r.deliverSla - r.deliverMins!)
    .filter(isNum);
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
    avgCompleteSlaResult: mean(completionSlaResults),
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
  if (r.verdict == null) return r.open ? 'In progress' : closedStatusLabel(r.alertProgress) ?? 'Status unavailable';
  return r.onTime ? `${dur(r.verdict)} early` : `${dur(r.verdict)} late`;
};

export const sourceLabel = (s: Source): string => (s === 'GUEST' ? 'Guest request' : 'Checkout turnover');
