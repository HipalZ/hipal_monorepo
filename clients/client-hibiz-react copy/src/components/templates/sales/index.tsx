import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import Bills from '@/components/atom/accordion';
import DownloadBills from '@/components/atom/downloadBill';
import PopUp from '@/components/atom/popUp';
import SalesDiscount from '@/components/atom/salesDiscount';
import SalesDues from '@/components/atom/salesDues';
import SalesTips from '@/components/atom/salesTips';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import SalesComponent, { type ISalesResponse } from '@/components/organisms/sales';
import { usePaymentMethodsStore } from '@/components/store/usePaymentStore';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { BillsData, IModes, SaleDuesResponse } from '@/components/types/businessData';
import { exportToExcel } from '@/components/utils/helper';
import { PAGE_TYPES, routePathsWithId } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { AiOutlinePercentage } from 'react-icons/ai';
import { BiDownload, BiSolidReceipt } from 'react-icons/bi';
import { BsChevronLeft, BsPostcardHeart } from 'react-icons/bs';
import { GiReceiveMoney } from 'react-icons/gi';
import { LuSettings } from 'react-icons/lu';
import { MdSpaceDashboard } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const buttons = [
  {
    text: 'Dashboard',
    Icon: MdSpaceDashboard,
  },
  {
    text: 'Bills',
    Icon: BiSolidReceipt,
  },
  {
    text: 'Tips',
    Icon: BsPostcardHeart,
  },
  {
    text: 'Discount',
    Icon: AiOutlinePercentage,
  },
  {
    text: 'Dues',
    Icon: GiReceiveMoney,
  },
];
interface ICost {
  totalCost: number;
}
const Sales = memo(() => {
  const { setSelectedIcon } = useSelectedIcon();
  const location = useLocation();
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const [pageNumber, setPageNumber] = useState(1);
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billsData, setBillsData] = useState<BillsData | null>(null);
  const [filteredData, setFilteredData] = useState<BillsData | null>(null);
  const [selectedMode, setSelectedMode] = useState('mode');

  const { inTime, outTime, selectedRange } = useTimings();

  const { lastUpdated, paymentMethods, setPaymentMethods } = usePaymentMethodsStore();

  const pageNumberFunction = (newPage: number) => {
    setPageNumber(newPage);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const setting = () => {
    startTransition(() => {
      navigate(routePathsWithId[PAGE_TYPES.ALERT_SETTING](businessId || ''));
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab === 'home') {
      setSelectedButton('Dashboard');
    } else {
      const key = tab || 'Dashboard';
      setSelectedButton(key);
    }
  }, [location.search]);

  // bills page
  const fetchBillsData = async () => {
    console.log('triggered', businessId, pageNumber, selectedMode, inTime, outTime);
    let url = `/v1/payments/Sale/Bill?businessId=${businessId}&pageNumber=${pageNumber}`;
    if (selectedMode && selectedMode !== 'mode') {
      url += `&mode=${selectedMode}`;
    }
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);
      setBillsData(res.data.data);
      setFilteredData(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  // sales report
  const getSalesReport = async () => {
    let url = `/v1/payments/:id/saleDashboard?businessId=${businessId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  // sales dues
  const getSalesDues = async () => {
    try {
      const response = await axios.get(`/v1/payments/Sale/Dues?businessId=${businessId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function openModes(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedMode(e.target.value);
    if (billsData) {
      return;
    }
    refetchBillsData();
  }
  const getRunningTableCost = async () => {
    try {
      const response = await axios(`/v1/kitchens/:id/runningTablesCost?businessId=${businessId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const {
    isLoading,
    error,
    data: runCost,
  } = useQuery<ICost>({
    queryKey: ['runningTableCost', businessId],
    queryFn: getRunningTableCost,
    enabled: !!businessId && !!selectedRange,
  });

  const {
    isLoading: isLoadingSales,
    error: salesError,
    data: salesData,
  } = useQuery<ISalesResponse | null>({
    queryKey: ['salesReport', businessId, inTime, outTime],
    queryFn: getSalesReport,
    enabled: !!businessId && !!inTime && !!outTime,
  });

  const {
    isLoading: isLoadingDues,
    error: duesError,
    data: dues,
  } = useQuery<SaleDuesResponse | null>({
    queryKey: ['salesDues', businessId, selectedButton === 'Dues'],
    queryFn: getSalesDues,
    enabled: !!businessId && selectedButton === 'Dues',
  });

  const {
    isLoading: isLoadingBills,
    error: billsError,
    data: bill,
    refetch: refetchBillsData,
  } = useQuery({
    queryKey: ['billsData', businessId, inTime, outTime, selectedButton === 'Bills', pageNumber],
    queryFn: fetchBillsData,
    enabled: !!businessId && !!inTime && !!outTime && selectedButton === 'Bills' && !!pageNumber,
  });

  const fetchPaymentMethods = async () => {
    if (!(lastUpdated === null || Date.now() - lastUpdated > 3 * 60000)) {
      return;
    }
    try {
      const response = await axios.get(`/v1/payments/Get/Modes?businessId=${businessId}`);
      const data: IModes[] = response?.data.data;
      setPaymentMethods(data);
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
    }
  };

  useEffect(() => {
    let filtered: BillsData | any = [];
    if (selectedMode?.toLowerCase() !== 'mode' && selectedMode?.toLowerCase() === 'multiple') {
      filtered = billsData?.filter((item) => item?.mode === selectedMode.toLowerCase());
      setFilteredData(filtered);
    } else if (selectedMode?.toLowerCase() !== 'mode' && selectedMode?.toLowerCase() !== 'multiple') {
      filtered = billsData?.filter((item) => {
        return (
          item?.mode?.toLowerCase() === selectedMode?.toLowerCase() ||
          (item?.mode?.toLowerCase() === 'multiple' && item?.modeBreakDown?.[selectedMode?.toLowerCase()])
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(billsData);
    }
  }, [selectedMode, billsData]);

  // if (isLoading) return <LoadingSpinner />
  // if(isLoadingBills && selectedButton==="Bills")return <>loading..</>
  // if(isLoadingDues && selectedButton === "Dues") return <>Loading ..</>
  // if (selectedButton === "Dashboard" && salesError) {
  // 	if (salesError) return <div>Error: {salesError.message}</div>
  // }
  // if (error) return <div>Error: {error.message}</div>

  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    params.delete('tab', '');
    startTransition(() => {
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    });
    setSelectedIcon('');
  };

  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 linear_gradient_background">
        <Header title="Sales" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <SubheaderButtonList buttons={buttons} />
        <div className="flex justify-between px-6 pb-4 mt-2">
          <div className="text-2xl font-medium">{selectedButton}</div>
          {selectedButton === 'Bills' && (
            <div className="flex space-x-4">
              <div onKeyDown={fetchPaymentMethods} onClick={fetchPaymentMethods}>
                <select
                  onChange={openModes}
                  className="flex items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm capitalize focus:border-[#cacaca] focus:outline-none focus:ring-0"
                >
                  <option value="mode">Mode</option>
                  {paymentMethods.length > 0 && <option value="multiple">Split</option>}
                  {paymentMethods.map((mode, index) => {
                    return (
                      <option className="capitalize" key={index.toString()} value={mode.mode}>
                        {mode.mode}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="on_active_bounce flex items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm">
                <BiDownload />
                <button type="button" onClick={openModal}>
                  CSV
                </button>
              </div>
            </div>
          )}
          {selectedButton === 'Dashboard' && (
            <div
              onKeyDown={() => exportToExcel(salesData)}
              onClick={() => exportToExcel(salesData)}
              className="on_active_bounce flex items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm"
            >
              <BiDownload />
              <button type="button">CSV</button>
            </div>
          )}
          {selectedButton === 'Alert' && (
            <div
              onKeyDown={setting}
              onClick={setting}
              className="on_active_bounce flex items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm"
            >
              <LuSettings />
            </div>
          )}
        </div>
      </div>

      {selectedButton === 'Dashboard' || selectedButton === 'Bills' || selectedButton === 'Discount' ? <DateRangePicker /> : ''}
      {selectedButton === 'Dashboard' ? (
        <SalesComponent isLoadingSales={isLoadingSales} salesData={salesData ? salesData : null} runCost={runCost?.totalCost || 0} />
      ) : selectedButton === 'Bills' ? (
        <Bills isLoadingBills={isLoadingBills} pageNumberFunction={pageNumberFunction} billsData={filteredData} fetchBillsData={fetchBillsData} />
      ) : selectedButton === 'Dues' ? (
        <>{dues && <SalesDues initialData={dues} isLoadingDues={isLoadingDues} />}</>
      ) : selectedButton === 'Tips' ? (
        <SalesTips />
      ) : selectedButton === 'Discount' ? (
        <SalesDiscount />
      ) : (
        <div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 left-1/2 top-1/2">
          Something is wrong Please Go Back
        </div>
      )}

      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <DownloadBills inTime={inTime} outTime={outTime} closeModal={closeModal} billsData={billsData || []} />
        </PopUp>
      )}
    </div>
  );
});

export default Sales;
