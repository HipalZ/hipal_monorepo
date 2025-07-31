// Function to adjust timestamp to 4 AM
function adjustTimestampTo4AM(timestamp: number): number {
  const date = new Date(timestamp);

  // Set the time to 4:00 AM
  date.setHours(4, 0, 0, 0);

  return date.getTime(); // Return the adjusted timestamp in milliseconds
}

// Helper function to check if the date is today
const isToday = (timestamp: number) => {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};

// Function to adjust `from` and `to` timestamps based on whether they are today or not
export function adjustFromToTimestamps(from: number, to: number) {
  let adjustedFrom = from;
  let adjustedTo = to;

  // Check if both from and to are today
  if (isToday(from) && isToday(to)) {
    // Adjust `from` and `to` to 4 AM if both are today
    adjustedFrom = adjustTimestampTo4AM(from);
    adjustedTo = adjustTimestampTo4AM(to);
  }

  return { adjustedFrom, adjustedTo };
}

// Function to get the default 4 AM and next 4 AM in IST (if you want to use this elsewhere)
const getDefault4AMToNext4AM = () => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (UTC + 5:30)
  const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Get the current date in UTC
  const nowUTC = new Date();

  // Convert to IST
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);

  // Start of today in IST (midnight)
  const startOfTodayIST = new Date(
    nowIST.getFullYear(),
    nowIST.getMonth(),
    nowIST.getDate(),
  ).getTime();

  // Calculate 4 AM of today in IST
  const fourAMTodayIST = startOfTodayIST + FOUR_HOURS_IN_MS;

  // Calculate 4 AM of tomorrow in IST
  const fourAMTomorrowIST = fourAMTodayIST + ONE_DAY_IN_MS;

  return { fromDate: fourAMTodayIST, toDate: fourAMTomorrowIST };
};

export default getDefault4AMToNext4AM;
