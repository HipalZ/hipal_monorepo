// Domain model for the Guest Experience report.
// The CSV export is produced server-side, so the client models only what the
// on-screen report actually renders — in clean camelCase, not CSV headers.

export type StaffRef = { _id?: string; name?: string; phone?: string } | null | undefined;

export type ServiceRef = {
  _id?: string;
  name?: string;
  avgAcceptanceTime?: number;
  avgCompletionTime?: number;
  avgDeliveryTime?: number;
};

export type AlertItem = {
  _id?: string;
  createdAt?: number;
  acceptedAt?: number;
  deliveredAt?: number;
  isEscalated?: boolean;
  level?: number;
  serviceIds?: ServiceRef[];
  roomId?: { _id?: string; name?: string };
  createdBy?: { _id?: string; name?: string; phone?: string };
  acceptedBy?: StaffRef;
  deliveredBy?: StaffRef;
  cart?: Array<{
    quantity?: number;
    name?: string;
    dishId?: string;
    dishName?: string;
    avgPrepTime?: number;
    avgPreparationTime?: number;
    dish?: { name?: string; price?: number; avgPrepTime?: number; avgPreparationTime?: number };
    portion?: { name?: string; price?: number } | null;
    extras?: Array<{ name?: string; price?: number; quantity?: number }>;
  }>;
  foodOrderSlaSettings?: {
    avgAcceptanceTime?: number;
    avgDeliveryTime?: number;
    useItemPrepTime?: boolean;
  };
};

/**
 * SLA performance for a single request. Standards come from each service's
 * avgAcceptanceTime / avgDeliveryTime (minutes); actuals from the timestamps.
 * avgCompletionTime is kept as a fallback for older service records.
 * A positive delta means the stage finished AHEAD of its SLA (early / good).
 */
export type ServicePerf = {
  acceptMins: number | null; // actual: created → accepted
  deliverMins: number | null; // actual: accepted → delivered
  acceptSla: number;
  deliverSla: number;
  acceptDelta: number | null; // acceptSla − acceptMins
  deliverDelta: number | null; // deliverSla − deliverMins
  totalSla: number;
  totalActual: number | null; // created → delivered
  verdict: number | null; // totalSla − totalActual
  onTime: boolean | null; // null while the request is still in progress
};

/** Another guest present in the same room stay (scanned QR, keyed by phone). */
export type Companion = { name: string; phone: string };

/** Guest value signal — lifetime visit count and their average rating. */
export type GuestImportance = {
  visits: number;
  avgRating: number | null;
};

/** One row of the request log — only the fields the report renders. */
export type RequestRow = {
  guestName: string;
  guestPhone: string;
  roomNo: string;
  serviceRequested: string;
  orderItems: string;
  acceptedByStaff: string;
  acceptedAt: string; // formatted date-time
  deliveredByStaff: string;
  deliveredAt: string; // formatted date-time
  escalated: boolean;
  escalationLevel: number | null;
  crossedEscalationSla: boolean;
  rating: number | null; // guest's rating of this service, if reviewed
  feedback: string; // free-text review / improvement notes
  companions: Companion[]; // co-guests present in the same room stay (Guests tab)
  importance: GuestImportance; // lifetime visits + avg rating
  perf: ServicePerf;
};

export type RequestSortKey =
  | 'guest'
  | 'room'
  | 'service'
  | 'acceptedBy'
  | 'deliveredBy'
  | 'acceptMins'
  | 'acceptDelta'
  | 'deliverMins'
  | 'deliverDelta'
  | 'verdict'
  | 'escalation'
  | 'rating';
