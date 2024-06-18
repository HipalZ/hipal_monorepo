import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import { CustomerzList } from '@/components/atom/customerzList';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSearch } from '@/components/store/useSearch';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { ICustomer, ICustomerzDashboard } from '@/components/types/businessData';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight, BiDownload } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';
import { MdAccountCircle, MdOutlineArticle, MdSpaceDashboard } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const buttons = [
  {
    text: 'Dashboard',
    Icon: MdSpaceDashboard,
  },
  {
    text: 'Customerz',
    Icon: MdOutlineArticle,
  },
];

const Customerz = memo(() => {
  const navigate = useNavigate();
  const { setSelectedIcon } = useSelectedIcon();
  const { timeStampStart, timeStampEnd } = useTimings();
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const [pageNumber, setPageNumber] = useState(1);
  const [customerzDashboard, setCustomerzDashboard] = useState<ICustomerzDashboard>({});
  const customerzInfo = [
    {
      title: 'Avg Ticket value',
      count: customerzDashboard.avgTicketValue || '',
    },
    {
      title: 'visits per day',
      count: customerzDashboard.visitPerDay || '',
    },
    {
      title: 'Repeat users',
      count: customerzDashboard.repeatCustomers || '',
    },
    {
      title: 'New Sign ups',
      count: customerzDashboard.newCustomers || '',
    },
  ];
  const [allCustomerzDetails, setAllCustomerzDetails] = useState<ICustomer[]>([]);
  const [newCustomerzDetails, setNewCustomerzDetails] = useState<ICustomer[]>([]);
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const setSearchText = useSearch((s) => s.setSearchText);
  const { inTime, outTime, selectedRange } = useTimings();

  const handleClick = (page: number) => {
    setPageNumber(page);
  };
  useEffect(() => {
    setSearchText('');
    setSelectedButton('Dashboard');
  }, []);

  const fetchCustomerzDetails = async () => {
    if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) {
      return;
    }
    try {
      const response = await axios.get(
        `/v1/payments/:id/userDashboard?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`,
      );
      setCustomerzDashboard(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllCustomerz = async () => {
    if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) {
      return;
    }
    try {
      const response = await axios.get(
        `v1/payments/:id/customers?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`,
      );
      setAllCustomerzDetails(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNewCustomerz = async () => {
    if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) {
      return;
    }
    try {
      const response = await axios.get(`v1/payments/:id/newCustomer?businessId=${businessId}&pageNumber=${pageNumber}`);
      setNewCustomerzDetails(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const {
    isLoading,
    error,
    data: customerData,
    refetch,
  } = useQuery({
    queryKey: ['customerData', businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: fetchCustomerzDetails,
    enabled: !!businessId && selectedButton === 'Dashboard' && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  const {
    isLoading: isLoadingAll,
    error: errorAll,
    data: allCustomerData,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['allCustomerData', businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: fetchAllCustomerz,
    enabled: !!businessId && selectedButton === 'Customerz' && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  const {
    isLoading: isLoadingNew,
    error: errorNew,
    data: newCustomerData,
    refetch: refetchNew,
  } = useQuery({
    queryKey: ['newCustomerData', businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: fetchNewCustomerz,
    enabled: !!businessId && selectedSubIcon === 'NewSignUps' && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  const viewAll = () => {
    setSelectedButton('Customerz');
  };
  const exportToExcel = async (sheetName: string, data: any) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    // Define columns
    worksheet.columns = [
      { header: 'Last Visited', key: 'date', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
    ];
    worksheet.getRow(1).font = { bold: true };
    // Add rows
    data?.forEach((d) => {
      const date = new Date(d.date);
      const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
      worksheet.addRow({ date: formattedDate, name: d.name, phone: d.phone });
    });
    // Write to a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    triggerDownload(buffer, sheetName);
  };
  const triggerDownload = (buffer: any, sheetName: string) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName}_${inTime}_to_${outTime}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getUserByNumber = async (phone: string) => {
    if (timeStampStart === 0 || timeStampEnd === 0 || businessId === undefined) {
      return;
    }
    try {
      const response = await axios.get(`v1/payments/:id/customers?businessId=${businessId}&findUser=${phone}`);
      setAllCustomerzDetails([response.data]);
    } catch (err) {
      console.log(err);
    }
  };
  const handleSearchChange = async (e: any) => {
    const value = e.target.value;
    console.log(typeof value);
    if (value.length === 10) {
      getUserByNumber(value);
    }
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };

  if (error) return <ErrorComponent refetch={refetch} />;
  if (errorAll) return <ErrorComponent refetch={refetchAll} />;
  if (errorNew) return <ErrorComponent refetch={refetchNew} />;

  const TabsContent = () => {
    return (
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Customerz" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <SubheaderButtonList buttons={buttons} />
        <div className="mt-4  pb-4">
          <div className="flex items-center justify-between">
            <div style={{ width: '100%' }} className="flex items-center  justify-between text-2xl">
              <span className="ml-6 mr-4">{selectedButton}</span>
              {selectedButton === 'Customerz' && (
                <div className="flex items-center justify-end">
                  <div
                    onClick={() => exportToExcel('CustomerzDetails', allCustomerzDetails)}
                    className="on_active_bounce flex h-[2rem] items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm"
                  >
                    <BiDownload />
                    <button type="button">CSV</button>
                  </div>
                  <div className="relative mx-4">
                    <HiSearch
                      size={16}
                      className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 left-2 top-[0.625rem] flex items-center"
                    />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Search by number"
                      onChange={handleSearchChange}
                      className="border-primary w-full rounded-lg border py-2 pl-8 pr-2 text-sm text-[#8E92A1]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {selectedButton === 'Dashboard' && <TotalCustomersCard />}
        </div>
      </div>
    );
  };

  const handleTabsBack = () => {
    const params = new URLSearchParams(location.search);
    params.delete('tab', '');
    startTransition(() => {
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    });
    setSelectedSubIcon('');
  };

  const NoTabsContent = () => {
    return (
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Customerz" onBack={handleTabsBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mt-6  pb-4">
          <div className="flex items-center justify-between">
            <div style={{ width: '100%' }} className="mx-6 flex items-center  justify-between text-2xl">
              <span>{selectedSubIcon}</span>
              <div className="flex items-center justify-end">
                <div
                  onClick={() => exportToExcel('NewCustomers', newCustomerzDetails)}
                  className="on_active_bounce flex h-[2rem] items-center justify-center space-x-2 rounded-lg border border-[#cacaca] bg-white px-2 text-sm"
                >
                  <BiDownload />
                  <button type="button">CSV</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TotalCustomersCard = () => {
    return (
      <div className="mx-6 mt-4">
        <div className="rounded-lg bg-[#2F80ED] px-4 py-4 text-white">
          <div className="text-sm">Total Customerz</div>
          <div className="mt-4 flex items-center justify-start text-3xl">
            <MdAccountCircle className="" />
            <span className="ml-2">{customerzDashboard.totalCustomers}</span>
          </div>
        </div>
      </div>
    );
  };

  const Analytics = () => {
    return (
      <div className="mx-6 mt-4">
        <div className="mt-4 grid grid-cols-2 gap-4">
          {customerzInfo.map((item, index) => (
            <div
              onClick={() => {
                if (item.title === 'New Sign ups' && selectedRange === 'today') {
                  setSelectedSubIcon('NewSignUps');
                }
              }}
              key={index}
              className="space-y-4 rounded-lg border border-[#cacaca] px-4 py-4"
            >
              <div className="text-sm">{item?.title}</div>
              <div className="font-semibold">
                {Number(item?.count).toLocaleString('en-IN')}
                {item?.title === 'Usage percentage' ? '%' : ''}
                {item.title === 'New Sign ups' && Number(item?.count) > 0 && selectedRange === 'today' && (
                  <span style={{ float: 'right' }}>View</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const LatestCustomerz = () => {
    return (
      <section className="mx-6 my-4">
        <article className="flex justify-between">
          <h1 className="text-2xl text-[#000000]">Latest Customerz</h1>
          <button
            type="button"
            onClick={viewAll}
            className="on_active_bounce scale-105 rounded-xl bg-[#000000] px-4 py-2 text-base font-medium text-white focus:outline-none"
          >
            View All
          </button>
        </article>
      </section>
    );
  };
  interface Props {
    items: ICustomer[];
  }
  const Pagination: React.FC<Props> = ({ items }) => {
    return (
      <div className="fixed bottom-[4rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {items && items.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-black">{pageNumber}</p>
        {items && items.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    );
  };

  const renderCustomerContent = () => {
    switch (selectedSubIcon) {
      case 'NewSignUps':
        return (
          <>
            <NoTabsContent />
            <CustomerzList customerData={newCustomerzDetails} />
            <Pagination items={newCustomerzDetails} />
          </>
        );
      default:
        return (
          <>
            {selectedButton === 'Dashboard' ? (
              <>
                <TabsContent />
                <DateRangePicker />
                <Analytics />
                <br />
                <LatestCustomerz />
                <CustomerzList customerData={customerzDashboard?.Customers} />
              </>
            ) : selectedButton === 'Customerz' ? (
              <>
                <TabsContent />
                <DateRangePicker />
                <CustomerzList customerData={allCustomerzDetails} />
                <Pagination items={allCustomerzDetails} />
              </>
            ) : (
              <>
                <TabsContent />
                <DateRangePicker />
              </>
            )}
          </>
        );
    }
  };
  return <>{renderCustomerContent()}</>;
});

export default Customerz;

// takes a date object and returns a formatted date string
export function formatDate(date: Date): string {
  const day: number = date.getDate();
  const month: string = date.toLocaleString('default', { month: 'long' });
  const year: number = date.getFullYear();

  function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}
