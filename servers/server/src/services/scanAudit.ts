import { CheckInQrUser, User, WhatsAppAnalyticsUser } from "@hi/db-models";
import mongoose from "mongoose";

// Reconstructs historical scan/visit data from WhatsApp delivery-status
// receipts. Runs inside the BullMQ worker; results are persisted to the
// scanauditresult collection and served by /scan_audit/result.

// One visit per user per IST calendar day
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function istDay(ts: number): string {
  return new Date(ts + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// The wamid is base64 and (per Meta's current Cloud API format) embeds
// the recipient phone number as an ASCII digit-run.
function decodeWamidPhone(wamid: string): string | null {
  try {
    const b64 = wamid.replace(/^wamid\./, "");
    const decoded = Buffer.from(b64, "base64").toString("latin1");
    const match = decoded.match(/\d{10,15}/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

// WhatsApp gives 91XXXXXXXXXX; the DB may store the number with or
// without the country code (or with a leading +). Normalize everything
// to the last 10 digits for comparison.
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

// All stored variants a 10-digit number might appear under in User.phone
function phoneVariants(p10: string): string[] {
  return [p10, `91${p10}`, `+91${p10}`];
}

const scanAuditResultSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, index: true },
    status: { type: String, enum: ["QUEUED", "RUNNING", "DONE", "ERROR"] },
    error: String,
    startedAt: Number,
    finishedAt: Number,
    statusSummary: Array,
    totals: Object,
    sampleWamids: Array,
    customers: Array,
  },
  { strict: false },
);

export const ScanAuditResult =
  mongoose.models.scanauditresult ||
  mongoose.model("scanauditresult", scanAuditResultSchema);

type CustomerStat = {
  messages: number;
  days: Set<string>;
  first: number;
  last: number;
};

export async function runScanAudit(jobDocId: string, businessId: string) {
  await ScanAuditResult.updateOne(
    { _id: jobDocId },
    { $set: { status: "RUNNING" } },
  );

  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  const statusSummary = await WhatsAppAnalyticsUser.aggregate([
    { $match: { businessId: businessObjectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        firstDate: { $min: "$date" },
        lastDate: { $max: "$date" },
      },
    },
  ]).option({ allowDiskUse: true });

  const campaignMessageCount = await WhatsAppAnalyticsUser.aggregate([
    { $match: { businessId: businessObjectId, userId: { $ne: null } } },
    { $group: { _id: "$messageId" } },
    { $count: "count" },
  ]).option({ allowDiskUse: true });

  // Stream distinct outbound messages — userId is only populated for
  // campaign sends; scan-triggered welcome/auto-reply receipts have
  // userId null, which is exactly the set we want.
  const cursor = WhatsAppAnalyticsUser.aggregate([
    {
      $match: {
        businessId: businessObjectId,
        $or: [{ userId: null }, { userId: { $exists: false } }],
      },
    },
    { $group: { _id: "$messageId", firstDate: { $min: "$date" } } },
  ])
    .option({ allowDiskUse: true })
    .cursor();

  let distinctMessageCount = 0;
  let undecodedCount = 0;
  const sampleWamids: Array<{
    messageId: string;
    decodedPhone: string | null;
  }> = [];

  // Buffer decoded events so we can detect campaign blasts before
  // counting visits. Historical campaign receipts have userId null
  // (messageId capture for campaigns is recent), so they are
  // indistinguishable from scan-triggered welcomes row-by-row — but a
  // blast is a sustained burst of many messages per minute, while
  // organic scans are sparse.
  const events: Array<{ phone: string; date: number }> = [];

  for await (const msg of cursor) {
    distinctMessageCount++;
    const rawPhone = decodeWamidPhone(msg._id as string);
    if (sampleWamids.length < 5) {
      sampleWamids.push({
        messageId: msg._id as string,
        decodedPhone: rawPhone,
      });
    }
    if (!rawPhone) {
      undecodedCount++;
      continue;
    }
    events.push({
      phone: normalizePhone(rawPhone),
      date: msg.firstDate as number,
    });
  }

  // Blast detection: any minute with >= BLAST_PER_MINUTE outbound
  // messages is a campaign window, not organic scanning. (The campaign
  // worker is rate-limited to ~20 msgs/min, so blasts show up as
  // sustained ~20/min; a busy bar's organic scans stay well below 10
  // in any single minute.)
  const BLAST_PER_MINUTE = 10;
  const perMinute = new Map<number, number>();
  for (const e of events) {
    const minute = Math.floor(e.date / 60_000);
    perMinute.set(minute, (perMinute.get(minute) ?? 0) + 1);
  }
  const blastMinutes = new Set(
    [...perMinute.entries()]
      .filter(([, count]) => count >= BLAST_PER_MINUTE)
      .map(([minute]) => minute),
  );

  // Summarize blast windows (merge consecutive minutes) for transparency
  const sortedBlast = [...blastMinutes].sort((a, b) => a - b);
  const blastWindows: Array<{ start: string; end: string; messages: number }> =
    [];
  for (const minute of sortedBlast) {
    const last = blastWindows[blastWindows.length - 1];
    const count = perMinute.get(minute) ?? 0;
    if (last && new Date(last.end).getTime() / 60_000 + 1 >= minute) {
      last.end = new Date((minute + 1) * 60_000).toISOString();
      last.messages += count;
    } else {
      blastWindows.push({
        start: new Date(minute * 60_000).toISOString(),
        end: new Date((minute + 1) * 60_000).toISOString(),
        messages: count,
      });
    }
  }
  blastWindows.sort((a, b) => b.messages - a.messages);

  let excludedAsBlast = 0;
  const perPhone = new Map<string, CustomerStat>();
  for (const e of events) {
    if (blastMinutes.has(Math.floor(e.date / 60_000))) {
      excludedAsBlast++;
      continue;
    }
    const entry = perPhone.get(e.phone) ?? {
      messages: 0,
      days: new Set<string>(),
      first: e.date,
      last: e.date,
    };
    entry.messages++;
    entry.days.add(istDay(e.date));
    entry.first = Math.min(entry.first, e.date);
    entry.last = Math.max(entry.last, e.date);
    perPhone.set(e.phone, entry);
  }

  // Map phones -> users in chunks, querying every +91 variant and
  // keying the result by normalized 10-digit phone.
  const phones = [...perPhone.keys()];
  const userByPhone = new Map<string, { _id?: string; name?: string }>();
  for (let i = 0; i < phones.length; i += 500) {
    const chunk = phones.slice(i, i + 500);
    const variants = chunk.flatMap(phoneVariants);
    const users = await User.find({ phone: { $in: variants } })
      .select("name phone")
      .lean();
    for (const u of users) {
      if (u.phone) {
        userByPhone.set(normalizePhone(u.phone), {
          _id: u._id ? String(u._id) : undefined,
          name: u.name,
        });
      }
    }
  }

  const customers = [...perPhone.entries()]
    .map(([phone, v]) => {
      const user = userByPhone.get(phone);
      return {
        phone,
        userId: user?._id ?? null,
        name: user?.name ?? null,
        messagesReceived: v.messages,
        visitDays: v.days.size,
        visitDates: [...v.days].sort().join("|"),
        firstSeen: new Date(v.first).toISOString(),
        lastSeen: new Date(v.last).toISOString(),
      };
    })
    .sort((a, b) => b.visitDays - a.visitDays);

  const checkInSummary = await CheckInQrUser.aggregate([
    { $match: { businessId: businessObjectId } },
    { $group: { _id: "$userId" } },
    { $count: "uniqueCheckInUsers" },
  ]);

  await ScanAuditResult.updateOne(
    { _id: jobDocId },
    {
      $set: {
        status: "DONE",
        finishedAt: Date.now(),
        statusSummary,
        totals: {
          distinctScanTriggeredMessages: distinctMessageCount,
          campaignMessages: campaignMessageCount[0]?.count ?? 0,
          decodedMessages: distinctMessageCount - undecodedCount,
          undecodedMessages: undecodedCount,
          excludedAsCampaignBlast: excludedAsBlast,
          organicMessages: events.length - excludedAsBlast,
          blastWindowCount: blastWindows.length,
          uniqueCustomers: customers.length,
          matchedToUserRecords: customers.filter((cu) => cu.userId).length,
          uniqueCheckInUsers: checkInSummary[0]?.uniqueCheckInUsers ?? 0,
        },
        sampleWamids,
        blastWindows: blastWindows.slice(0, 25),
        customers,
      },
    },
  );
}
