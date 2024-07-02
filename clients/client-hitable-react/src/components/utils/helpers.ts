import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function timestampToDateTime(timestamp: number): string {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const date = new Date(timestamp + IST_OFFSET);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const day = date.getUTCDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getUTCMonth()];

  // Determine the day suffix
  let daySuffix;
  switch (day) {
    case 1:
    case 21:
    case 31:
      daySuffix = 'st';
      break;
    case 2:
    case 22:
      daySuffix = 'nd';
      break;
    case 3:
    case 23:
      daySuffix = 'rd';
      break;
    default:
      daySuffix = 'th';
  }

  // Convert to 12-hour format
  const hourFormatted = hours % 12 || 12; // Converts 0 to 12 for midnight
  const minuteFormatted = minutes < 10 ? `0${minutes}` : minutes;
  const amPm = hours < 12 ? 'AM' : 'PM';

  return `${day}${daySuffix} ${month} ${hourFormatted}:${minuteFormatted} ${amPm}`;
}

//apply cn
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
