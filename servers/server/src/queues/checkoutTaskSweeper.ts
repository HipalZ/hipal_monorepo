import { HotelCheckoutGroup, HotelCheckoutTask } from '@hi/db-models';
import { pushToManagers, pushToStaff, whatsAppManagers } from '../services/checkoutTasks/notify';
import { allFloorStaffFor } from '../services/checkoutTasks/routing';

/**
 * Advances checkout tasks past their deadlines.
 *
 * Deliberately a database sweep rather than per-task timers. The guest alert
 * flow schedules in-memory `node-cron` jobs, which are lost on restart and are
 * never cancelled; a cleaning SLA should not inherit that. One interval reads
 * whatever is actually overdue, so a restart mid-window loses nothing and the
 * cost does not grow with the number of open tasks.
 */

const TICK_MS = 5_000;
let timer: ReturnType<typeof setInterval> | null = null;

type PopulatedTask = {
  _id: unknown;
  businessId: string;
  groupId: string;
  serviceId: { _id: string; name?: string } | string;
  roomId: { name?: string } | string;
  zoneId?: string;
  stage: string;
  status: string;
  acceptDueAt: number;
  completeDueAt?: number;
  overdueNotifiedAt?: number;
};

const nameOf = (ref: { name?: string } | string | undefined, fallback: string) => (typeof ref === 'object' && ref?.name ? ref.name : fallback);
const idOf = (ref: { _id: string } | string) => (typeof ref === 'object' ? String(ref._id) : String(ref));

/** Unclaimed past its window: widen to other floors, or hand to the manager. */
const advanceUnaccepted = async (task: PopulatedTask, now: number) => {
  const group = await HotelCheckoutGroup.findById(task.groupId).lean();
  const roomName = nameOf(task.roomId, 'Room');
  const serviceName = nameOf(task.serviceId, 'cleaning');
  const serviceId = idOf(task.serviceId);

  if (task.stage === 'FLOOR' && group?.widenToOtherFloors) {
    // Every floor, including the room's own — widening adds staff, never drops
    // the ones already holding it.
    const audience = await allFloorStaffFor(task.businessId, serviceId);
    await HotelCheckoutTask.findByIdAndUpdate(task._id, {
      $set: {
        stage: 'ALL_FLOORS',
        audienceStaffIds: audience,
        acceptDueAt: now + (group.otherFloorsWindowMins ?? 2) * 60_000,
      },
    });
    await pushToStaff(task.businessId, audience, roomName, serviceName, true);
    return;
  }

  // FLOOR with widening off, or ALL_FLOORS already exhausted → manager.
  await HotelCheckoutTask.findByIdAndUpdate(task._id, {
    $set: { stage: 'MANAGER', escalatedAt: now },
  });
  await pushToManagers(task.businessId, roomName, serviceName);
  if (group?.notifyManager !== false) {
    await whatsAppManagers(task.businessId, roomName, serviceName, 'Not accepted within the allowed time');
  }
};

/** Accepted but running past its cleaning window — tell the manager once. */
const flagOverrun = async (task: PopulatedTask, now: number) => {
  const roomName = nameOf(task.roomId, 'Room');
  const serviceName = nameOf(task.serviceId, 'cleaning');
  await HotelCheckoutTask.findByIdAndUpdate(task._id, {
    $set: { overdueNotifiedAt: now },
  });
  await pushToManagers(task.businessId, roomName, serviceName);
  const group = await HotelCheckoutGroup.findById(task.groupId).lean();
  if (group?.notifyManager !== false) {
    await whatsAppManagers(task.businessId, roomName, serviceName, 'Accepted but not completed within the allowed time');
  }
};

export const sweepCheckoutTasks = async (): Promise<void> => {
  const now = Date.now();

  const unaccepted = (await HotelCheckoutTask.find({
    status: 'PENDING',
    stage: { $in: ['FLOOR', 'ALL_FLOORS'] },
    acceptDueAt: { $lte: now },
  })
    .populate({ path: 'roomId', select: 'name' })
    .populate({ path: 'serviceId', select: 'name' })
    .lean()) as unknown as PopulatedTask[];

  for (const task of unaccepted) {
    try {
      await advanceUnaccepted(task, now);
    } catch (error) {
      // One bad task must not stop the sweep for every other hotel.
      console.error('[checkoutSweeper] escalate failed', task._id, error);
    }
  }

  const overrunning = (await HotelCheckoutTask.find({
    status: 'ACCEPTED',
    completeDueAt: { $lte: now },
    overdueNotifiedAt: { $exists: false },
  })
    .populate({ path: 'roomId', select: 'name' })
    .populate({ path: 'serviceId', select: 'name' })
    .lean()) as unknown as PopulatedTask[];

  for (const task of overrunning) {
    try {
      await flagOverrun(task, now);
    } catch (error) {
      console.error('[checkoutSweeper] overrun failed', task._id, error);
    }
  }
};

export const startCheckoutTaskSweeper = (): void => {
  if (timer) return; // hot reload must not stack sweepers
  timer = setInterval(() => {
    sweepCheckoutTasks().catch((error) => console.error('[checkoutSweeper] tick failed', error));
  }, TICK_MS);
  console.log(`[checkoutSweeper] started (every ${TICK_MS / 1000}s)`);
};

export const stopCheckoutTaskSweeper = (): void => {
  if (timer) clearInterval(timer);
  timer = null;
};
