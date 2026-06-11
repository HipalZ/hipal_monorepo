import { UserAnalytic, VisitEvent, type VisitSource } from "@hi/db-models";

// Records a customer visit, deduped to one per (business, user, IST
// day). On the FIRST event of a day it also increments
// UserAnalytic.visitCount, so the existing hiPeople list and user
// dashboard show live, correct counts. Safe to call from any hot path:
// repeat calls the same day are absorbed by the unique index.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export function istDay(ts: number): string {
  return new Date(ts + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export async function recordVisit(params: {
  businessId: string;
  userId: string;
  source: VisitSource;
  tableName?: string;
  date?: number;
}): Promise<{ isNewVisitDay: boolean }> {
  const { businessId, userId, source, tableName } = params;
  const date = params.date ?? Date.now();
  try {
    const result = await VisitEvent.updateOne(
      { businessId, userId, day: istDay(date) },
      {
        $setOnInsert: { date, source, ...(tableName ? { tableName } : {}) },
      },
      { upsert: true },
    );

    const isNewVisitDay = result.upsertedCount > 0;

    if (isNewVisitDay && source !== "BACKFILL") {
      await UserAnalytic.updateOne(
        { userId, businessId },
        {
          $inc: { visitCount: 1 },
          $setOnInsert: {
            totalSpend: 0,
            avgSpend: 0,
            dateOfJoining: date,
          },
        },
        { upsert: true },
      );
    }

    return { isNewVisitDay };
  } catch (error) {
    // Duplicate-key races (two requests same day) are expected — any
    // other failure must never break the calling flow (webhook/login).
    if ((error as { code?: number })?.code !== 11000) {
      console.error("recordVisit error:", error);
    }
    return { isNewVisitDay: false };
  }
}
