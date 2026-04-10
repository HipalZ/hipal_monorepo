import { format } from 'date-fns';
export const useFormatTimes = () => {
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, h:mm a");
  };

  // Format date only
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
  };

  return { formatTimestamp, formatDate };
};
