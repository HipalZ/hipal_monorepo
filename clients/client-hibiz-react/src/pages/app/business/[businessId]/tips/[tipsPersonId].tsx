import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import TipsAccordion from '@/components/atom/tipsAccordion';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useStaff } from '@/components/store/useStaff';
import useTimings from '@/components/store/useTimings';
import type { Bill } from '@/components/types/businessData';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';

interface IProps extends Bill {
  totalDiscount: number;
  data: Bill[];
}
const Tips = memo(() => {
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const navigate = useNavigate();
  const { selectedWaiter } = useStaff();
  const { inTime, outTime } = useTimings();
  const [pageNumber, setPageNumber] = useState(1);
  const pageNumberFunction = (newPage: number) => {
    setPageNumber(newPage);
  };
  const [data, setData] = useState<IProps>({
    totalDiscount: 0,
    data: [],
  });

  const getTipsByWaiterName = async (waiterName: string) => {
    let url = `/v1/payments/:id/tipsByWaiterName?businessId=${businessId}&waiterName=${waiterName}&pageNumber=${pageNumber}`;

    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }

    try {
      const res = await axios.get(url);
      setData(res.data || {});
      return res.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/sales`);
    });
  };

  const {
    isLoading,
    error,
    data: staffTipsData,
  } = useQuery({
    queryKey: ['tips', businessId, inTime, outTime, pageNumber, selectedWaiter],
    queryFn: () => getTipsByWaiterName(selectedWaiter),
    enabled: !!inTime && !!outTime && !!pageNumber && !!businessId && !!selectedWaiter,
  });

  return (
    <div className="bg-white">
      <div className="border-b border-[#CACACA] bg-[#f5f5f5]">
        <Header title="Tips" leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} onBack={handleBack} />
        <div className="mx-6 mt-6 rounded-lg bg-[#204D42] py-4 text-white">
          <div className="flex items-center justify-start">
            <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#204D42]">{selectedWaiter?.[0]}</div>
            <div className="ml-2 text-xl font-normal">
              {decodeURIComponent(selectedWaiter).split('+')[0]}
              <div className="text-lg font-normal">₹ {data?.tips}</div>
            </div>
          </div>
        </div>
        <div className="ml-6 py-4 text-2xl font-normal">Tips</div>
      </div>
      <DateRangePicker />
      {isLoading ? (
        <LoadingSpinner />
      ) : data ? (
        <TipsAccordion tips={data.data} pageNumberFunction={pageNumberFunction} currentPage={pageNumber} />
      ) : (
        <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">Not Found</div>
      )}
    </div>
  );
});

export default Tips;
