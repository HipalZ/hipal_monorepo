export const getRoleColor = (role?: string) => {
  if (!role) return "bg-gray-100 text-gray-800 border-gray-200";
  const map: Record<string, string> = {
    MANAGER: "bg-emerald-100 text-emerald-800 border-emerald-200",
    FRONT_OFFICE: "bg-blue-100 text-blue-800 border-blue-200",
    HOUSEKEEPING: "bg-purple-100 text-purple-800 border-purple-200",
    KITCHEN: "bg-orange-100 text-orange-800 border-orange-200",
    CLEANER: "bg-green-100 text-green-800 border-green-200",
    PLUMBER: "bg-yellow-100 text-yellow-800 border-yellow-200",
    LAUNDRY: "bg-pink-100 text-pink-800 border-pink-200",
    SECURITY: "bg-red-100 text-red-800 border-red-200",
  };
  return map[role] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getRoomTypeName = (
  roomTypeId: string | undefined,
  roomTypes: any[],
) => {
  if (!Array.isArray(roomTypes)) return "Unknown";
  const rt = roomTypes.find((t: any) => t?._id === roomTypeId);
  return rt?.roomType || "Unknown";
};
