const indianHoursInMinutes = () => {
  const now = new Date();
  const utcMillis = now.getTime(); // Current UTC in milliseconds
  const istMillis = utcMillis + 5.5 * 60 * 60000; // Add IST offset (5h30m)

  // Extract IST hours and minutes
  const istDate = new Date(istMillis);
  const hours = istDate.getUTCHours(); // Use UTC methods!
  const minutes = istDate.getUTCMinutes();

  // Get IST day of week (0=Sunday, 1=Monday, ...)
  let currentDay = istDate.getUTCDay();
  currentDay = currentDay === 0 ? 7 : currentDay; // Adjust Sunday to 7

  // Current time in minutes (IST)
  const currentTimeInMinutes = hours * 60 + minutes;

  return { currentDay, currentTimeInMinutes };
};

export default indianHoursInMinutes;
