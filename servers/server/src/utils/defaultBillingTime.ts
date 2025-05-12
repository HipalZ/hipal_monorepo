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
