// Pure analytics: turn raw alerts into request rows + aggregate stats.
// No React here — everything is deterministic and unit-testable.

import type { reviewResponse } from '@/hooks/hotel/useReviewHook';
import { formatDateTime } from './format';
import type { AlertItem, Companion, GuestImportance, RequestRow, RequestSortKey, ServicePerf } from './model';

// ── review matching ─────────────────────────────────────────────────────────
// A review may link straight to an alert, or only to the guest+room+service; we
// try the exact link first, then a best-effort match after the request time.
const servicesOverlap = (a?: { name?: string }[], b?: { name?: string }[]): boolean => {
  const names = new Set(a?.map((s) => s?.name?.toLowerCase()).filter(Boolean));
  return Boolean(b?.some((s) => names.has(s?.name?.toLowerCase())));
};

const findReview = (alert: AlertItem, reviews: reviewResponse[]): reviewResponse | undefined => {
  const exact = reviews.find((r) => {
    const linked = typeof r.alertId === 'object' && r.alertId ? r.alertId._id : undefined;
    return alert._id && linked === alert._id;
  });
  if (exact) return exact;
  return reviews.find((r) => {
    const user = typeof r.userId === 'object' && r.userId ? r.userId : null;
    const sameGuest = user?.phone && user.phone === alert.createdBy?.phone;
    const sameRoom = r.roomId?.name && r.roomId.name === alert.roomId?.name;
    const reviewAlert = typeof r.alertId === 'object' && r.alertId ? r.alertId : null;
    const sameService = servicesOverlap(alert.serviceIds, reviewAlert?.serviceIds);
    const afterRequest = r.date && alert.createdAt ? r.date >= alert.createdAt : true;
    return Boolean(sameGuest && sameRoom && sameService && afterRequest);
  });
};

/** Person present in a room stay, as returned by the analytics endpoint. */
type StayPerson = { name?: string; phone?: string } | null | undefined;
type StayRecord = {
  userId?: StayPerson;
  guestUserIds?: StayPerson[];
  source?: string;
  checkIn?: number;
  checkOut?: number;
};

/** Everything buildRequestRows needs beyond the raw alerts. */
export type ReportContext = {
  companionsByPhone: Map<string, Companion[]>;
  reviews: reviewResponse[];
  importanceByPhone: Map<string, GuestImportance>;
};

const toCompanion = (person: StayPerson): Companion | null =>
  person?.phone ? { name: person.name || 'Guest', phone: person.phone } : null;

const dedupeByPhone = (people: Companion[]): Companion[] => [...new Map(people.map((p) => [p.phone, p])).values()];

/**
 * Map each guest phone → the other guests who shared their room stay
 * (scanned the QR / were present), whether or not they raised a request.
 * A guest can appear across several stays, so companions accumulate.
 */
export const buildCompanionsByPhone = (stays: StayRecord[]): Map<string, Companion[]> => {
  const byPhone = new Map<string, Companion[]>();
  for (const stay of stays) {
    const present = dedupeByPhone(
      [toCompanion(stay.userId), ...(stay.guestUserIds ?? []).map(toCompanion)].filter((p): p is Companion => p != null),
    );
    for (const person of present) {
      const others = present.filter((p) => p.phone !== person.phone);
      if (!others.length) continue;
      byPhone.set(person.phone, dedupeByPhone([...(byPhone.get(person.phone) ?? []), ...others]));
    }
  }
  return byPhone;
};

/**
 * Customer importance = lifetime visits (New / Repeat / VIP) blended with the
 * guest's average rating across their reviewed services.
 */
export const buildImportanceByPhone = (
  visitCountByPhone: Record<string, number>,
  reviews: reviewResponse[],
): Map<string, GuestImportance> => {
  const ratingByPhone = new Map<string, { sum: number; n: number }>();
  for (const review of reviews) {
    const user = typeof review.userId === 'object' && review.userId ? review.userId : null;
    const phone = user?.phone;
    const rating = (review as { reviewRating?: number }).reviewRating;
    if (phone && typeof rating === 'number') {
      const cur = ratingByPhone.get(phone) ?? { sum: 0, n: 0 };
      cur.sum += rating;
      cur.n += 1;
      ratingByPhone.set(phone, cur);
    }
  }

  const phones = new Set<string>([...Object.keys(visitCountByPhone), ...ratingByPhone.keys()]);
  const byPhone = new Map<string, GuestImportance>();
  for (const phone of phones) {
    const visits = visitCountByPhone[phone] ?? 1;
    const rs = ratingByPhone.get(phone);
    const avgRating = rs && rs.n ? Math.round((rs.sum / rs.n) * 10) / 10 : null;
    byPhone.set(phone, { visits, avgRating });
  }
  return byPhone;
};

const minutesBetween = (from?: number | null, to?: number | null): number | null =>
  from && to && to >= from ? (to - from) / 60000 : null;

export const computePerf = (alert: AlertItem): ServicePerf => {
  const services = alert.serviceIds ?? [];
  const acceptSla = services.reduce((sum, s) => sum + (s?.avgAcceptanceTime ?? 0), 0);
  const deliverSla = services.reduce((sum, s) => sum + (s?.avgCompletionTime ?? s?.avgDeliveryTime ?? 0), 0);
  const acceptMins = minutesBetween(alert.createdAt, alert.acceptedAt);
  const deliverMins = minutesBetween(alert.acceptedAt, alert.deliveredAt);
  const totalActual = minutesBetween(alert.createdAt, alert.deliveredAt);
  const totalSla = acceptSla + deliverSla;
  const verdict = totalActual != null && totalSla > 0 ? totalSla - totalActual : null;
  return {
    acceptMins,
    deliverMins,
    acceptSla,
    deliverSla,
    acceptDelta: acceptMins != null && acceptSla > 0 ? acceptSla - acceptMins : null,
    deliverDelta: deliverMins != null && deliverSla > 0 ? deliverSla - deliverMins : null,
    totalSla,
    totalActual,
    verdict,
    onTime: verdict == null ? null : verdict >= 0,
  };
};

const serviceNames = (services?: { name?: string }[]): string =>
  services
    ?.map((s) => s?.name)
    .filter(Boolean)
    .join(', ') || '';

const orderItemsLabel = (cart?: AlertItem['cart']): string =>
  cart
    ?.map((item) => {
      const name = item?.dish?.name || item?.name || '';
      const qty = item?.quantity ?? 1;
      const price = item?.dish?.price;
      return price != null ? `${name} x${qty} (Rs ${price})` : `${name} x${qty}`;
    })
    .filter(Boolean)
    .join(' | ') || '';

const DEFAULT_IMPORTANCE: GuestImportance = { visits: 1, avgRating: null };

export const buildRequestRows = (alerts: AlertItem[], ctx: ReportContext): RequestRow[] =>
  alerts.map((alert) => {
    const guestPhone = alert.createdBy?.phone || '';
    const review = findReview(alert, ctx.reviews) as
      | (reviewResponse & { reviewRating?: number; note?: string; improvementAreas?: string[] })
      | undefined;
    return {
      guestName: alert.createdBy?.name || 'Guest',
      guestPhone,
      roomNo: alert.roomId?.name || '',
      serviceRequested: serviceNames(alert.serviceIds),
      orderItems: orderItemsLabel(alert.cart),
      acceptedByStaff: alert.acceptedBy?.name || '',
      acceptedAt: formatDateTime(alert.acceptedAt),
      deliveredByStaff: alert.deliveredBy?.name || '',
      deliveredAt: formatDateTime(alert.deliveredAt),
      escalated: Boolean(alert.isEscalated),
      escalationLevel: alert.isEscalated ? alert.level ?? 0 : null,
      crossedEscalationSla: Boolean(alert.isEscalated),
      rating: review?.reviewRating ?? null,
      feedback: review?.note || review?.improvementAreas?.filter(Boolean).join(', ') || '',
      companions: (guestPhone && ctx.companionsByPhone.get(guestPhone)) || [],
      importance: (guestPhone && ctx.importanceByPhone.get(guestPhone)) || DEFAULT_IMPORTANCE,
      perf: computePerf(alert),
    };
  });

// ── aggregates ──────────────────────────────────────────────────────────────

export type StaffStat = { name: string; onTime: number; late: number; total: number; pct: number };
export type ServiceStat = { service: string; avgMins: number; slaMins: number; total: number };
export type DonutStat = {
  onTime: number;
  missed: number;
  pct: number | null;
  acceptMisses: number;
  deliverMisses: number;
  escalated: number;
};
export type ReportSummary = {
  requests: number;
  guests: number;
  escalated: number;
  judged: number;
  onTimeCount: number;
  breaches: number;
  onTimeRate: number | null;
  avgAccept: number | null;
  avgDeliver: number | null;
  avgAcceptSla: number | null;
  avgDeliverSla: number | null;
};

const mean = (values: number[]): number | null => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const isNum = (n: number | null): n is number => n != null;

export const aggregateStaff = (rows: RequestRow[]): StaffStat[] => {
  const byName = new Map<string, { onTime: number; late: number; total: number }>();
  for (const row of rows) {
    if (row.perf.onTime == null) continue;
    const name = row.acceptedByStaff || 'Unassigned';
    const stat = byName.get(name) ?? { onTime: 0, late: 0, total: 0 };
    stat.total += 1;
    if (row.perf.onTime) stat.onTime += 1;
    else stat.late += 1;
    byName.set(name, stat);
  }
  return [...byName.entries()]
    .map(([name, s]) => ({ name, ...s, pct: s.total ? (s.onTime / s.total) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);
};

export const aggregateServices = (rows: RequestRow[]): ServiceStat[] => {
  const byService = new Map<string, { sum: number; total: number; sla: number }>();
  for (const row of rows) {
    if (row.perf.totalActual == null) continue;
    const service = row.serviceRequested || '—';
    const stat = byService.get(service) ?? { sum: 0, total: 0, sla: row.perf.totalSla };
    stat.sum += row.perf.totalActual;
    stat.total += 1;
    if (row.perf.totalSla > 0) stat.sla = row.perf.totalSla;
    byService.set(service, stat);
  }
  // Sort by how far each service runs OVER its SLA (worst first).
  return [...byService.entries()]
    .map(([service, s]) => ({ service, avgMins: s.sum / s.total, slaMins: s.sla, total: s.total }))
    .sort((a, b) => b.avgMins - b.slaMins - (a.avgMins - a.slaMins));
};

export const computeDonut = (rows: RequestRow[]): DonutStat => {
  const judged = rows.filter((r) => r.perf.onTime !== null);
  const onTime = judged.filter((r) => r.perf.onTime).length;
  return {
    onTime,
    missed: judged.length - onTime,
    pct: judged.length ? Math.round((onTime / judged.length) * 100) : null,
    acceptMisses: rows.filter((r) => r.perf.acceptDelta != null && r.perf.acceptDelta < 0).length,
    deliverMisses: rows.filter((r) => r.perf.deliverDelta != null && r.perf.deliverDelta < 0).length,
    escalated: rows.filter((r) => r.escalated).length,
  };
};

export const summarize = (rows: RequestRow[]): ReportSummary => {
  const judged = rows.filter((r) => r.perf.onTime !== null);
  const onTimeCount = judged.filter((r) => r.perf.onTime).length;
  return {
    requests: rows.length,
    guests: new Set(rows.map((r) => r.guestPhone).filter(Boolean)).size,
    escalated: rows.filter((r) => r.escalated).length,
    judged: judged.length,
    onTimeCount,
    breaches: judged.length - onTimeCount,
    onTimeRate: judged.length ? Math.round((onTimeCount / judged.length) * 100) : null,
    avgAccept: mean(rows.map((r) => r.perf.acceptMins).filter(isNum)),
    avgDeliver: mean(rows.map((r) => r.perf.deliverMins).filter(isNum)),
    avgAcceptSla: mean(rows.map((r) => r.perf.acceptSla).filter((n) => n > 0)),
    avgDeliverSla: mean(rows.map((r) => r.perf.deliverSla).filter((n) => n > 0)),
  };
};

export type GuestRow = {
  name: string;
  phone: string;
  visits: number;
  avgRating: number | null;
  companions: number;
  requests: number;
};

/** Unique guests (by phone) with their standing, satisfaction and party size. */
export const aggregateGuests = (rows: RequestRow[]): GuestRow[] => {
  const byGuest = new Map<string, GuestRow>();
  for (const row of rows) {
    const id = row.guestPhone || row.guestName;
    const existing = byGuest.get(id);
    if (existing) {
      existing.requests += 1;
      existing.companions = Math.max(existing.companions, row.companions.length);
    } else {
      byGuest.set(id, {
        name: row.guestName,
        phone: row.guestPhone,
        visits: row.importance.visits,
        avgRating: row.importance.avgRating,
        companions: row.companions.length,
        requests: 1,
      });
    }
  }
  return [...byGuest.values()].sort((a, b) => b.visits - a.visits || b.requests - a.requests);
};

// ── search + sort ─────────────────────────────────────────────────────────

export const matchesSearch = (row: RequestRow, needle: string): boolean =>
  [
    row.guestName,
    row.guestPhone,
    row.roomNo,
    row.serviceRequested,
    row.acceptedByStaff,
    row.deliveredByStaff,
    ...row.companions.map((c) => `${c.name} ${c.phone}`),
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);

export const sortValue = (row: RequestRow, key: RequestSortKey): string | number => {
  switch (key) {
    case 'guest':
      return row.guestName;
    case 'room':
      return row.roomNo;
    case 'service':
      return row.serviceRequested;
    case 'acceptedBy':
      return row.acceptedByStaff;
    case 'deliveredBy':
      return row.deliveredByStaff;
    case 'acceptMins':
      return row.perf.acceptMins ?? Number.POSITIVE_INFINITY;
    case 'acceptDelta':
      return row.perf.acceptDelta ?? Number.POSITIVE_INFINITY;
    case 'deliverMins':
      return row.perf.deliverMins ?? Number.POSITIVE_INFINITY;
    case 'deliverDelta':
      return row.perf.deliverDelta ?? Number.POSITIVE_INFINITY;
    case 'verdict':
      return row.perf.verdict ?? Number.POSITIVE_INFINITY;
    case 'escalation':
      return row.escalated ? row.escalationLevel ?? 0 : -1;
    case 'rating':
      return row.rating ?? -1;
  }
};
