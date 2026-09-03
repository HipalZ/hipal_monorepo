import type { IService } from "@/components/hooks/useServicesHotel";

const timeToMinutes = (time?: string) => {
  const match = time?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const getIndiaClockMinutes = (timestamp: number) => {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
};

export const resolveServiceInstructionMessage = (
  service: IService,
  timestamp = Date.now()
) => {
  const behavior = service.serviceBehavior;
  if (!behavior?.instructionEnabled) return "";

  const baseInstruction = behavior.instruction?.trim() || "";
  const requestMinutes = getIndiaClockMinutes(timestamp);
  const rule = (behavior.instructionRules ?? []).find((item) => {
    const ruleMinutes = timeToMinutes(item.time);
    const message = item.message?.trim();
    if (ruleMinutes == null || !message) return false;
    if (item.condition === "BEFORE_TIME") return requestMinutes < ruleMinutes;
    if (item.condition === "AFTER_TIME") return requestMinutes >= ruleMinutes;
    return false;
  });
  const ruleMessage = rule?.message?.trim() || "";

  return [baseInstruction, ruleMessage].filter(Boolean).join(" ");
};

