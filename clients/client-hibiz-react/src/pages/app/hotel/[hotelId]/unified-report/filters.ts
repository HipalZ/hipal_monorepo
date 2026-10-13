// Pure filter logic. Same predicate narrows the log AND the KPIs above it.

import type { Source, UnifiedRow } from './model';

export type UnifiedFilters = {
  source: Source | 'ALL';
  outcome: 'all' | 'ontime' | 'late' | 'open' | 'escalated';
  rating: 'all' | '5' | '4' | '3' | '2' | '1' | 'unrated';
  /** Guest and front-office are kept as separate filters, never one blurred list. */
  guest: string[];
  frontOffice: string[];
  staff: string[];
  service: string[];
  floor: string[];
  rooms: string[];
  q: string;
};

/** Internal value used by multi-select filters to distinguish "none" from the default "all" state. */
export const NO_FILTER_OPTIONS_SELECTED = '__NO_FILTER_OPTIONS_SELECTED__';

export const blankFilters = (): UnifiedFilters => ({
  source: 'ALL',
  outcome: 'all',
  rating: 'all',
  guest: [],
  frontOffice: [],
  staff: [],
  service: [],
  floor: [],
  rooms: [],
  q: '',
});

const hasSelected = (values: string[]) => values.length > 0;
const hasNoOptionsSelected = (values: string[]) => values.includes(NO_FILTER_OPTIONS_SELECTED);

export const matches = (r: UnifiedRow, f: UnifiedFilters): boolean => {
  if (f.source !== 'ALL' && r.source !== f.source) return false;
  if (f.outcome === 'ontime' && r.onTime !== true) return false;
  if (f.outcome === 'late' && r.onTime !== false) return false;
  if (f.outcome === 'open' && !r.open) return false;
  if (f.outcome === 'escalated' && !r.escalated) return false;
  if (f.rating === 'unrated' && r.rating != null) return false;
  if (f.rating !== 'all' && f.rating !== 'unrated' && r.rating !== Number(f.rating)) return false;
  // Guest filter only matches guest-raised rows; front-office only front-office.
  if (hasSelected(f.rooms) && !f.rooms.includes(r.room)) return false;
  if (hasSelected(f.guest) && !(r.requesterKind === 'GUEST' && f.guest.includes(r.requesterName))) return false;
  if (hasSelected(f.frontOffice) && !(r.requesterKind === 'FRONT_OFFICE' && f.frontOffice.includes(r.requesterName))) return false;
  if (hasSelected(f.staff) && !f.staff.includes(r.servicedBy)) return false;
  if (hasSelected(f.service) && !f.service.includes(r.service)) return false;
  if (hasSelected(f.floor) && !f.floor.includes(r.floor)) return false;
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
  if (hasNoOptionsSelected(f.rooms)) tags.push({ key: 'rooms', label: 'No rooms selected' });
  else if (hasSelected(f.rooms)) tags.push({ key: 'rooms', label: f.rooms.length === 1 ? `Room: ${f.rooms[0]}` : `Rooms: ${f.rooms.length} selected` });
  if (hasNoOptionsSelected(f.guest)) tags.push({ key: 'guest', label: 'No guests selected' });
  else if (hasSelected(f.guest)) tags.push({ key: 'guest', label: f.guest.length === 1 ? `Guest: ${f.guest[0]}` : `Guests: ${f.guest.length} selected` });
  if (hasNoOptionsSelected(f.frontOffice)) tags.push({ key: 'frontOffice', label: 'No front office selected' });
  else if (hasSelected(f.frontOffice)) tags.push({ key: 'frontOffice', label: f.frontOffice.length === 1 ? `Front office: ${f.frontOffice[0]}` : `Front office: ${f.frontOffice.length} selected` });
  if (hasNoOptionsSelected(f.staff)) tags.push({ key: 'staff', label: 'No staff selected' });
  else if (hasSelected(f.staff)) tags.push({ key: 'staff', label: f.staff.length === 1 ? `Served by ${f.staff[0]}` : `Staff: ${f.staff.length} selected` });
  if (hasNoOptionsSelected(f.service)) tags.push({ key: 'service', label: 'No services selected' });
  else if (hasSelected(f.service)) tags.push({ key: 'service', label: f.service.length === 1 ? f.service[0] : `Services: ${f.service.length} selected` });
  if (hasNoOptionsSelected(f.floor)) tags.push({ key: 'floor', label: 'No floors selected' });
  else if (hasSelected(f.floor)) tags.push({ key: 'floor', label: f.floor.length === 1 ? f.floor[0] : `Floors: ${f.floor.length} selected` });
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
    services: uniq(rows.map((r) => r.service).filter((service) => service !== '—' && service !== 'Service details unavailable')),
    floors: uniq(rows.map((r) => r.floor)),
    rooms: uniq(rows.map((r) => r.room)),
  };
};
