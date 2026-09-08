import type { IService } from "@/components/hooks/useServicesHotel";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_VALUES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TimingSlot = {
  day?: number;
  start?: number;
  end?: number;
};

const getIndiaClock = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value || "Sun";
  const day = WEEKDAY_VALUES.indexOf(weekday);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return {
    day: day >= 0 ? day : 0,
    minutes: hour * 60 + minute,
  };
};

const isSlotActive = (slot: TimingSlot, currentDay: number, currentMinutes: number) => {
  const day = Number(slot.day ?? -1);
  const start = Number(slot.start);
  const end = Number(slot.end);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;

  const dayMatches = day === -1 || day === currentDay;
  if (start <= end) {
    return dayMatches && currentMinutes >= start && currentMinutes < end;
  }

  const previousDay = (currentDay + 6) % 7;
  const isStartDay = day === -1 || day === currentDay;
  const isEndDay = day === -1 || day === previousDay;
  return (isStartDay && currentMinutes >= start) || (isEndDay && currentMinutes < end);
};

const formatTime = (minutes: number) => {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const getNextLabel = (timings: TimingSlot[], currentDay: number, currentMinutes: number) => {
  let best: { offset: number; start: number; day: number } | null = null;

  for (let offset = 0; offset < 8; offset += 1) {
    const candidateDay = (currentDay + offset) % 7;

    for (const slot of timings) {
      const day = Number(slot.day ?? -1);
      const start = Number(slot.start);
      if (!Number.isFinite(start)) continue;
      if (!(day === -1 || day === candidateDay)) continue;
      if (offset === 0 && start <= currentMinutes) continue;

      if (!best || offset < best.offset || (offset === best.offset && start < best.start)) {
        best = { offset, start, day: candidateDay };
      }
    }
  }

  if (!best) return "Available soon";

  const time = formatTime(best.start);
  if (best.offset === 0) return `Available at ${time}`;
  if (best.offset === 1) return `Available tomorrow at ${time}`;
  return `Available on ${DAY_NAMES[best.day]} at ${time}`;
};

export const getServiceTimingAvailability = (service: IService) => {
  if (service.availability === false) {
    return {
      available: false,
      restricted: false,
      label: "Unavailable",
    };
  }

  const groups = (service.availabilityGroups || []).filter((group) => group.active !== false && (group.timings || []).length > 0);
  if (!groups.length) {
    return {
      available: true,
      restricted: false,
      label: "",
    };
  }

  const timings = groups.flatMap((group) => group.timings || []);
  const clock = getIndiaClock();
  const available = timings.some((slot) => isSlotActive(slot, clock.day, clock.minutes));

  return {
    available,
    restricted: true,
    label: available ? "" : getNextLabel(timings, clock.day, clock.minutes),
  };
};
