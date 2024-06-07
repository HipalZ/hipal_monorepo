import axios from '@/axios';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import LoyaltyHistoryAccordion from '@/components/molecules/loyaltyHistoryAccordion';
import useBusinessData from '@/components/store/useBusinessData';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import { paths } from '@/components/utils/paths';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';

const LoyaltyCoins = () => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { inTime, outTime } = useTimings();
  const data = useBusinessData((s) => s.existingLoyalty);
  const [pageNumber, setPageNumber] = useState(1);
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const pageNumberFunction = (newPage: number) => {
    setPageNumber(newPage);
  };
  const fetchRewardHistory = async () => {
    try {
      const endpoint = paths.getRewardHistory(businessId, data.loyaltyId, pageNumber, inTime, outTime);
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching reward history:', error);
    }
  };

  const {
    isLoading,
    error,
    data: itemsData,
    refetch,
  } = useQuery({
    queryKey: ['rewardHistory', businessId, data.loyaltyId, pageNumber, inTime, outTime],
    queryFn: fetchRewardHistory,
    enabled: !!businessId && !!data.loyaltyId && !!pageNumber && !!inTime && !!outTime,
  });

  const uploadCsvPage = () => {
    setSelectedSubIcon('uploadCSV');
  };

  useEffect(() => {
    router.query.tab = 'Coins';
    router.push(router);
  }, []);

  if (error) return <ErrorComponent refetch={refetch} />;

  const LoyaltyCoinsData = () => {
    return (
      <div className="pb-12">
        <LoyaltyHistoryAccordion isLoading={isLoading} itemsData={itemsData || []} pageNumber={pageNumber} pageNumberFunction={pageNumberFunction} />
        <div onKeyDown={uploadCsvPage} onClick={uploadCsvPage} className="fixed bottom-6 flex w-full items-center justify-center px-6">
          <button type="button" className="on_active_bounce mt-4 w-full rounded-lg border bg-[#2B354D] px-4 py-2 font-semibold text-white">
            <div className="flex items-center justify-center">
              <MdAdd className="mr-2" />
              Add credits
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <DateRangePicker />
      <LoyaltyCoinsData />
    </>
  );
};

export default memo(LoyaltyCoins);
