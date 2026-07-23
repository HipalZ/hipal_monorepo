import {
  HotelCheckoutGroup,
  HotelCheckoutTask,
  HotelRoom,
  HotelService,
} from "@hi/db-models";
import { pushToManagers, pushToStaff, whatsAppManagers } from "./notify";
import { floorStaffFor } from "./routing";

export type RaiseCheckoutArgs = {
  businessId: string;
  roomId: string;
  triggeredBy?: string;
  guestName?: string;
  guestPhone?: string;
  /** Caller-supplied so a retry lands on the same idempotency key. */
  checkoutAt?: number;
};

/**
 * Raise the configured turnover tasks for a checked-out room.
 *
 * Shared by the standalone `/trigger` endpoint and by `check_out` itself, so the
 * whole thing can happen in one round-trip. Deliberately swallows a missing
 * config / empty floor / duplicate retry — the guest has already been checked
 * out, so this must never surface as a failure to the caller.
 */
export const raiseCheckoutTasks = async (
  args: RaiseCheckoutArgs,
): Promise<{ raised: number; tasks: unknown[] }> => {
  const { businessId, roomId, triggeredBy, guestName, guestPhone, checkoutAt } =
    args;

  const group = await HotelCheckoutGroup.findOne({ businessId, isActive: true });
  if (!group || !group.services?.length) return { raised: 0, tasks: [] };

  const room = await HotelRoom.findById(roomId).select("name zoneId").lean();
  if (!room) return { raised: 0, tasks: [] };

  const now = Date.now();
  const ref = `${roomId}:${checkoutAt ?? now}`;
  const raised: unknown[] = [];

  for (const entry of group.services) {
    const serviceId = String(entry.serviceId);
    const service = await HotelService.findById(serviceId)
      .select("name")
      .lean();
    const audience = await floorStaffFor(
      businessId,
      String(room.zoneId),
      serviceId,
    );

    try {
      const task = await HotelCheckoutTask.create({
        businessId,
        roomId,
        zoneId: room.zoneId,
        groupId: group._id,
        serviceId,
        checkoutRef: ref,
        acceptMins: entry.acceptMins,
        completeMins: entry.completeMins,
        guestName,
        guestPhone,
        status: "PENDING",
        stage: audience.length ? "FLOOR" : "MANAGER",
        audienceStaffIds: audience,
        createdAt: now,
        acceptDueAt: now + group.floorWindowMins * 60_000,
        triggeredBy,
      });
      raised.push(task);

      const roomName = room.name || "Room";
      const serviceName = service?.name || "cleaning";
      if (audience.length) {
        await pushToStaff(businessId, audience, roomName, serviceName);
      } else {
        // Nobody to offer it to — front office aren't configured either. The
        // task opens at MANAGER stage, which the sweeper never revisits, so it
        // has to be announced here or it would sit silently forever.
        await pushToManagers(businessId, roomName, serviceName);
        if (group.notifyManager !== false) {
          await whatsAppManagers(
            businessId,
            roomName,
            serviceName,
            "No staff available to accept this checkout task",
          );
        }
      }
    } catch (error: unknown) {
      // Duplicate key = this checkout already raised its tasks. Not an error.
      if ((error as { code?: number })?.code !== 11000) throw error;
    }
  }

  return { raised: raised.length, tasks: raised };
};
