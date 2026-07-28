// Pure filter logic. Same predicate narrows the log AND the KPIs above it.

import type { Source, UnifiedRow } from './model';

export const ANY = 'ALL';

export type UnifiedFilters = {
  source: Source | 'ALL';
  outcome: 'all' | 'ontime' | 'late' | 'open' | 'escalated';
  rating: 'all' | '5' | '4' | '3' | '2' | '1' | 'unrated';
  /** Guest and front-office are kept as separate filters, never one blurred list. */
  guest: string;
  frontOffice: string;
  staff: string;
  service: string;
  floor: string;
  q: string;
};

export const blankFilters = (): UnifiedFilters => ({
  source: 'ALL',
  outcome: 'all',
  rating: 'all',
  guest: ANY,
  frontOffice: ANY,
  staff: ANY,
  service: ANY,
  floor: ANY,
  q: '',
});

export const matches = (r: UnifiedRow, f: UnifiedFilters): boolean => {
  if (f.source !== 'ALL' && r.source !== f.source) return false;
  if (f.outcome === 'ontime' && r.onTime !== true) return false;
  if (f.outcome === 'late' && r.onTime !== false) return false;
  if (f.outcome === 'open' && !r.open) return false;
  if (f.outcome === 'escalated' && !r.escalated) return false;
  if (f.rating === 'unrated' && r.rating != null) return false;
  if (f.rating !== 'all' && f.rating !== 'unrated' && r.rating !== Number(f.rating)) return false;
  // Guest filter only matches guest-raised rows; front-office only front-office.
  if (f.guest !== ANY && !(r.requesterKind === 'GUEST' && r.requesterName === f.guest)) return false;
  if (f.frontOffice !== ANY && !(r.requesterKind === 'FRONT_OFFICE' && r.requesterName === f.frontOffice)) return false;
  if (f.staff !== ANY && r.servicedBy !== f.staff) return false;
  if (f.service !== ANY && r.service !== f.service) return false;
  if (f.floor !== ANY && r.floor !== f.floor) return false;
  if (f.q) {
    const hay = `${r.room} ${r.service} ${r.requesterName} ${r.servicedBy} ${r.floor}`.toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
};

export const applyFilters = (rows: UnifiedRow[], f: UnifiedFilters): UnifiedRow[] => rows.filter((r) => matches(r, f));

const OUTCOME_LABELS: Record<UnifiedFilters['outcome'], string> = {
  all: '',
  ontime: 'Within SLA',
  late: 'Missed SLA',
  open: 'Still open',
  escalated: 'Escalated',
};

const RATING_LABELS: Record<UnifiedFilters['rating'], string> = {
  all: '',
  '5': '5 star',
  '4': '4 star',
  '3': '3 star',
  '2': '2 star',
  '1': '1 star',
  unrated: 'No rating',
};

export type FilterTag = { key: keyof UnifiedFilters; label: string };

export const activeTags = (f: UnifiedFilters): FilterTag[] => {
  const tags: FilterTag[] = [];
  if (f.source !== 'ALL') tags.push({ key: 'source', label: f.source === 'GUEST' ? 'Guest requests' : 'Checkout turnover' });
  if (f.outcome !== 'all') tags.push({ key: 'outcome', label: OUTCOME_LABELS[f.outcome] });
  if (f.rating !== 'all') tags.push({ key: 'rating', label: RATING_LABELS[f.rating] });
  if (f.guest !== ANY) tags.push({ key: 'guest', label: `Guest: ${f.guest}` });
  if (f.frontOffice !== ANY) tags.push({ key: 'frontOffice', label: `Front office: ${f.frontOffice}` });
  if (f.staff !== ANY) tags.push({ key: 'staff', label: `Served by ${f.staff}` });
  if (f.service !== ANY) tags.push({ key: 'service', label: f.service });
  if (f.floor !== ANY) tags.push({ key: 'floor', label: f.floor });
  if (f.q) tags.push({ key: 'q', label: `“${f.q}”` });
  return tags;
};

export const clearFilter = (f: UnifiedFilters, key: keyof UnifiedFilters): UnifiedFilters => ({ ...f, [key]: blankFilters()[key] });

/** Options come from the UNFILTERED rows, split by requester kind. */
export const filterOptions = (rows: UnifiedRow[]) => {
  const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return {
    guests: uniq(rows.filter((r) => r.requesterKind === 'GUEST').map((r) => r.requesterName)),
    frontOffice: uniq(rows.filter((r) => r.requesterKind === 'FRONT_OFFICE').map((r) => r.requesterName)),
    staff: uniq(rows.map((r) => r.servicedBy)),
    services: uniq(rows.map((r) => r.service)),
    floors: uniq(rows.map((r) => r.floor)),
  };
};
