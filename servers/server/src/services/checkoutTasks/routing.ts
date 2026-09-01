import { HotelRoom, User } from "@hi/db-models";

/**
 * Who a checkout task should be offered to.
 *
 * Floors are zones, and there is no staff→zone link in the schema — staff
 * attach to *rooms* via `room.staffIds`. So a floor's staff is the union of the
 * staff assigned to its rooms, which means the existing room-staff linking
 * screen already drives this with no migration and no new assignment UI.
 *
 * Managers are excluded: they are the escalation target, not the first
 * responder. Only staff whose role actually covers the service are included.
 */
const staffForRooms = async (
  businessId: string,
  serviceId: string,
  roomStaffIds: string[],
): Promise<string[]> => {
  if (!roomStaffIds.length) return [];
  const staff = await User.find({
    _id: { $in: roomStaffIds },
    customRole: {
      $elemMatch: {
        businessId,
        serviceIds: { $in: [serviceId] },
        role: { $ne: "MANAGER" },
        isDeleted: { $ne: true },
      },
    },
  })
    .select("_id")
    .lean();
  return staff.map((s) => String(s._id));
};

const uniq = (ids: string[]): string[] => [...new Set(ids)];

/**
 * Front office see every request by default — that is how every business runs
 * the desk. Business-wide and not filtered by service or room assignment, so a
 * task can never end up with nobody watching it.
 */
export const frontOfficeFor = async (businessId: string): Promise<string[]> => {
  const staff = await User.find({
    customRole: {
      $elemMatch: { businessId, role: "FRONT_OFFICE", isDeleted: { $ne: true } },
    },
  })
    .select("_id")
    .lean();
  return staff.map((s) => String(s._id));
};

/** Front office (always) + staff on this floor who can perform this service. */
export const floorStaffFor = async (
  businessId: string,
  zoneId: string | undefined,
  serviceId: string,
): Promise<string[]> => {
  const frontOffice = await frontOfficeFor(businessId);
  if (!zoneId) return uniq(frontOffice);
  const rooms = await HotelRoom.find({ businessId, zoneId })
    .select("staffIds")
    .lean();
  const ids = uniq(rooms.flatMap((r) => (r.staffIds ?? []).map(String)));
  const housekeeping = await staffForRooms(businessId, serviceId, ids);
  return uniq([...frontOffice, ...housekeeping]);
};

/**
 * Widened past one floor. Additive on purpose: the original floor's staff keep
 * the task and every other floor is brought in alongside them, because the
 * people nearest the room are still the most likely to do it. Front office stay
 * on the task at every rung.
 */
export const allFloorStaffFor = async (
  businessId: string,
  serviceId: string,
): Promise<string[]> => {
  const frontOffice = await frontOfficeFor(businessId);
  const rooms = await HotelRoom.find({ businessId }).select("staffIds").lean();
  const ids = uniq(rooms.flatMap((r) => (r.staffIds ?? []).map(String)));
  const housekeeping = await staffForRooms(businessId, serviceId, ids);
  return uniq([...frontOffice, ...housekeeping]);
};

/** Managers to escalate to, business-wide. */
export const managersFor = async (
  businessId: string,
): Promise<Array<{ _id: string; name?: string; phone?: string }>> => {
  const managers = await User.find({
    customRole: {
      $elemMatch: { businessId, role: "MANAGER", isDeleted: { $ne: true } },
    },
  })
    .select("_id name phone")
    .lean();
  return managers.map((m) => ({
    _id: String(m._id),
    name: m.name,
    phone: m.phone,
  }));
};
