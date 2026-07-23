// Unified service report — one row model that both guest requests and checkout
// turnover jobs map into. The two live in separate collections (hotelalerts vs
// hotelcheckouttasks); they are merged here at read time, never in storage.

export type Source = 'GUEST' | 'CHECKOUT';

/** Who raised the request — a guest, a front-office staffer, or nobody named. */
export type RequesterKind = 'GUEST' | 'FRONT_OFFICE' | 'AUTOMATIC';

export type UnifiedRow = {
  id: string;
  source: Source;
  room: string;
  floor: string;
  service: string;
  /** The requester — a guest for GUEST rows, front-office for CHECKOUT rows. */
  requesterName: string;
  requesterPhone: string;
  requesterKind: RequesterKind;
  /** Lifetime visit count for a guest, shown beside the name. Null for staff. */
  visits: number | null;
  /** The guest who stayed. For guest rows this equals the requester; for a
   *  checkout row it's the departed guest, so we don't lose who was there. */
  guestName: string;
  guestPhone: string;
  /** Companions who stayed alongside the primary guest — never the primary. */
  companions: Array<{ name: string; phone: string }>;
  /** The staff member who did the work (completer, else accepter) — for filters/aggregates. */
  servicedBy: string;
  // Accepter and completer can differ, so both are captured.
  acceptedByName: string;
  completedByName: string;
  /** Front-office staff who raised a guest request on the guest's behalf. */
  operatorName: string;
  raisedAt: number;
  // SLA spine shared by both types. For a guest, "total" is created→delivered;
  // for a checkout job it's created→completed. Same shape, comparable numbers.
  acceptMins: number | null;
  acceptSla: number;
  totalMins: number | null;
  totalSla: number;
  /** totalSla − totalMins. Positive = finished ahead of SLA. */
  verdict: number | null;
  onTime: boolean | null;
  escalated: boolean;
  /** Only guest rows carry a delivery leg; null for checkout. */
  deliverMins: number | null;
  deliverSla: number;
  open: boolean;
};
