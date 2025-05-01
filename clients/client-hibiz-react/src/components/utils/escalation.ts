import { format } from "date-fns";
import type { EscalationItem } from "../types/hotelTypes";

// Format timestamp to readable date
export const formatDate = (timestamp: number) =>
  format(new Date(timestamp), "MMM dd, yyyy HH:mm");

// Export data as CSV
export const exportToCSV = (data: EscalationItem[]) => {
  const headers = ["Date", "Service", "User", "Room", "Status"];
  const csvData = data.map((item) => [
    formatDate(item.createdAt),
    item.serviceIds.map((s) => s.name).join(", "),
    item.userId?.name || "-",
    item.roomId?.name || "-",
    item.alertProgress,
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `escalation-report-${format(new Date(), "yyyy-MM-dd")}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Extract unique service names from escalation data
export const extractServiceNames = (data: EscalationItem[]): string[] => {
  const names = new Set<string>();
  data.forEach((item) => {
    item.serviceIds.forEach((service) => {
      names.add(service.name);
    });
  });
  return Array.from(names);
};

// Extract unique room names from escalation data
export const extractRoomNames = (data: EscalationItem[]): string[] => {
  const names = new Set<string>();
  data.forEach((item) => {
    if (item.roomId?.name) {
      names.add(item.roomId.name);
    }
  });
  return Array.from(names);
};

// Process escalation data with both service and room filters
export const processEscalationData = (
  data: EscalationItem[],
  activeServiceFilter: string | null,
  activeRoomFilter: string | null,
) => {
  const serviceCount: Record<string, number> = {};
  const roomsSet = new Set<string>();
  const usersSet = new Set<string>();

  // Apply filtering
  const filtered = data.filter((item) => {
    // Service filter
    const matchesService =
      !activeServiceFilter ||
      item.serviceIds.some((service) => service.name === activeServiceFilter);

    // Room filter
    const matchesRoom =
      !activeRoomFilter || item.roomId?.name === activeRoomFilter;

    // Item must match both filters to be included
    return matchesService && matchesRoom;
  });

  filtered.forEach(({ serviceIds, roomId, userId }) => {
    serviceIds.forEach(({ name }) => {
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
    if (roomId?._id) roomsSet.add(roomId._id);
    if (userId?._id) usersSet.add(userId._id);
  });

  return {
    serviceData: Object.entries(serviceCount).map(([name, count]) => ({
      name,
      count,
    })),
    rooms: roomsSet,
    users: usersSet,
    totalEscalations: filtered.length,
    filteredData: filtered,
  };
};
