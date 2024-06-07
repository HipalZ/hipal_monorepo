import HiPalLogo from '@/assets/svg/hipalLogoNew.svg';
import axios from '@/axios';
import Loader from '@/components/atoms/loader';
import MiddlePopUp from '@/components/atoms/middlePopUp';
import SalesComponent from '@/components/molecules/sales';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useQuery } from '@tanstack/react-query';
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdMenuOpen } from 'react-icons/md';
import { toast } from 'react-toastify';

interface ICost {
  totalCost: number;
}

function SalesReport({ setCurrentView }) {
  const router = useRouter();
  const businessData = useBusinessStore((s) => s.businessData);
  // const [salesData, setSalesData] = useState<ISalesResponse | null>(null);
  const [selectedRange, setSelectedRange] = useState('today');
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isCustomDate, setIsCustomDate] = useState(false);
  const { businessId } = router.query as {
    businessId: string;
  };
  const today = new Date();
  const yesterday = subDays(new Date(), 1);
  const startOfThisMonth = startOfMonth(new Date());
  const endOfThisMonth = endOfMonth(new Date());

  const formatDate = (date) => {
    const day = String(date?.getDate()).padStart(2, '0');
    const month = String(date?.getMonth() + 1).padStart(2, '0');
    const year = date?.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchReportForRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleTodayClick = () => {
    setSelectedRange('today');
    fetchReportForRange(startOfDay(today), endOfDay(today));
  };

  const handleYesterdayClick = () => {
    setSelectedRange('yesterday');
    fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
  };

  const handleThisMonthClick = () => {
    setSelectedRange('thisMonth');
    fetchReportForRange(startOfThisMonth, endOfThisMonth);
  };

  const handleCustomDatesClick = () => {
    setSelectedRange('custom');
    setIsCustomDate(!isCustomDate);
  };

  const getSalesReport = async () => {
    if (!startDate || !endDate) {
      return;
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    let url = `/v1/payments/:id/saleDashboard?businessId=${businessId}`;
    if (formattedStartDate && formattedEndDate) {
      url += `&from=${formattedStartDate}&to=${formattedEndDate}`;
    }
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      toast.error('Error fetching bills report');
    }
  };

  const getRunningTableCost = async () => {
    try {
      const response = await axios(`/v1/kitchens/:id/runningTablesCost?businessId=${businessId}`);
      return response.data;
    } catch (error) {
      toast.error('Error fetching running table cost');
    }
  };

  const {
    isLoading,
    error,
    data: runCost,
  } = useQuery({
    queryKey: ['runningTableCost', businessId],
    queryFn: getRunningTableCost,
    enabled: !!businessId,
  });

  const {
    isLoading: salesPending,
    error: salesError,
    data: salesData,
  } = useQuery({
    queryKey: ['salesReport', businessId, startDate, endDate],
    queryFn: getSalesReport,
    enabled: !!businessId && !!startDate && !!endDate,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (salesPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || salesError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>{`Error message: ${error?.message || salesError?.message}`}</div>
      </div>
    );
  }

  return (
    <div className="bg-secondary relative min-h-screen pb-6">
      <div className="bg-secondary sticky top-0 z-20">
        <div className="ml-[1.5rem] flex justify-between pt-[2rem]">
          <Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />

          <MdMenuOpen onClick={() => setCurrentView('setting')} className="mr-[1.5rem] text-2xl" />
        </div>
        <div className="ml-6 mt-4 font-bold">{businessData?.businessName}</div>
        <div className="mx-6 py-4">
          <div className="flex flex-wrap items-center justify-start space-x-2">
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'today' ? 'bg-primary text-base-100' : 'bg-base-100'}`}
              onClick={handleTodayClick}
            >
              Today
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'yesterday' ? 'bg-primary text-base-100' : 'bg-base-100'}`}
              onClick={handleYesterdayClick}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'thisMonth' ? 'bg-primary text-base-100' : 'bg-base-100'}`}
              onClick={handleThisMonthClick}
            >
              This Month
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'custom' ? 'bg-primary text-base-100' : 'bg-base-100'}`}
              onClick={handleCustomDatesClick}
            >
              Custom dates
            </button>
          </div>
        </div>
        <div className="ml-6 text-xl font-bold">Sales {`${formatDate(startDate).slice(0, 5)} to ${formatDate(endDate).slice(0, 5)}`}</div>
      </div>
      <div className="date-picker-container mx-6">
        {isCustomDate && (
          <MiddlePopUp show={isCustomDate} onClose={() => setIsCustomDate(false)}>
            <div className="date-picker-container item-center flex justify-center p-2">
              <DatePicker
                selected={startDate}
                onChange={(dates) => {
                  if (Array.isArray(dates) && dates.length === 2) {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                  } else {
                    setStartDate(dates);
                    setEndDate(dates);
                  }
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
              />
            </div>
          </MiddlePopUp>
        )}
      </div>
      <SalesComponent salesData={salesData} runCost={runCost?.totalCost || 0} />
    </div>
  );
}

export default SalesReport;
