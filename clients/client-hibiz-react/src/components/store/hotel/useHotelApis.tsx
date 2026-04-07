import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import useTimings from '@/components/store/useTimings';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';

export const useHistoryAlerts = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useOwnerLogin((s) => s.user._id);

  const historyAlerts = async () => {
    const response = await apiRpc.hotel.alert.fetch_alert_history.$get({
      query: {
        businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
        userId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data as any[];
    }
  };
  const { data: historyData, isPending } = useQuery({
    queryKey: ['historyAlerts', businessId, userId, timeStampStart, timeStampEnd],
    queryFn: historyAlerts,
    enabled: !!businessId && !!userId && !!timeStampStart && !!timeStampEnd,
  });

  return { historyData, isPending };
};
