import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import { routeToDashboard } from '@/components/utils/routes';
import { memo, startTransition, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const reportObject = [
  { id: 1, name: 'Sales report' },
  { id: 2, name: 'Dues report' },
  { id: 3, name: 'Discount report' },
  { id: 4, name: 'Complimentory report' },
];

const Reports = memo(() => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectReportName, setSelectReportName] = useState('');
  const { setSelectedIcon } = useSelectedIcon();
  const [loading, setLoading] = useState(false);
  const inTime = useTimings((s) => s.inTime);
  const outTime = useTimings((s) => s.outTime);
  const { businessId } = useParams<{ businessId: string }>();
  const [apiData, setApiData] = useState({});
  const fetchReportData = async (reportId: number) => {
    setLoading(true);
    let url = '';
    switch (reportId) {
      case 1:
        url = `/v1/payments/:id/saleReport?businessId=${businessId}&from=${inTime}&to=${outTime}`;
        break;
      case 2:
        url = `/v1/payments/:id/duesReport?businessId=${businessId}&from=${inTime}&to=${outTime}`;
        break;
      case 3:
        url = `/v1/payments/:id/discountReport?businessId=${businessId}&from=${inTime}&to=${outTime}`;
        break;
      case 4:
        url = `/v1/payments/:id/complimentaryReport?businessId=${businessId}&from=${inTime}&to=${outTime}`;
        break;
      default:
    }

    try {
      const response = await axios.get(url);
      setApiData((prevData) => ({ ...prevData, [reportId]: response.data.data }));
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (item: any) => {
    setSelectReportName(item.name);
    setSelectedReport(item._id);
    fetchReportData(item._id);
  };

  const downloadSelectedReportExcel = () => {
    if (selectedReport == null) {
      toast.error('Please select a report first.');
      return;
    }
    setLoading(true);
    let reportData = apiData[selectedReport];

    if (!reportData || reportData?.length === 0) {
      toast.error('No data available for the selected report.');
      setLoading(false);
      return;
    }
    if (selectedReport === 1) {
      const allCategories = Array.from(new Set(reportData?.flatMap((report: any) => Object.keys(report.categories))));

      const propertyOrder = [
        'date',
        'time',
        'orderId',
        'tableNumber',
        'orderType',
        'paymentType',
        'customerName',
        'customerPhone',
        'closedBy',
        ...allCategories,
        'subTotal',
        'discount',
        'discountReason',
        'cgst',
        'sgst',
        'serviceCharge',
        'packingCharges',
        'RxPayableGST',
        'swiggyPayableGST',
        'tips',
        'total',
      ];

      const transformedData = reportData.map((report: any) => {
        const transformedRow = {};
        propertyOrder.forEach((property: any) => {
          if (
            property === 'date' ||
            property === 'time' ||
            property === 'orderId' ||
            property === 'tableNumber' ||
            property === 'orderType' ||
            property === 'paymentType' ||
            property === 'customerName' ||
            property === 'customerPhone' ||
            property === 'closedBy'
          ) {
            if ((property === 'customerName' || property === 'customerPhone') && (report[property] === '' || report[property] === undefined)) {
              transformedRow[property] = 'NA';
            } else {
              transformedRow[property] = report[property];
            }
          } else if (
            property === 'subTotal' ||
            property === 'discount' ||
            property === 'discountReason' ||
            property === 'cgst' ||
            property === 'sgst' ||
            property === 'serviceCharge' ||
            property === 'packingCharges' ||
            property === 'RxPayableGST' ||
            property === 'swiggyPayableGST' ||
            property === 'tips' ||
            property === 'total'
          ) {
            transformedRow[property] = report[property];
          } else {
            transformedRow[property] = report.categories[property] || 0;
          }
        });

        return transformedRow;
      });
      reportData = transformedData;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    const fileName = `${selectReportName}_${inTime}_to_${outTime}.xlsx`;
    XLSX.utils.book_append_sheet(wb, ws, `${selectReportName}`);
    XLSX.writeFile(wb, fileName);
    setLoading(false);
  };

  useEffect(() => {
    setSelectReportName('');
    setSelectedReport(null);
  }, [inTime, outTime]);

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };

  return (
    <div>
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Reports" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <div className="flex items-center justify-between px-6 pb-4 mt-6">
          <div className="flex text-2xl">
            <span>Reports</span>
          </div>
        </div>
      </div>
      <DateRangePicker />
      <div className="mx-6 mt-6 space-y-4">
        {reportObject.map((item) => (
          <div
            onClick={() => handleCheckboxChange(item)}
            key={item._id}
            className="flex items-center rounded-md border border-[#cacaca] px-6 py-4 focus:outline-none"
          >
            <input
              type="radio"
              onChange={(event) => {
                event.stopPropagation();
                handleCheckboxChange(item);
              }}
              checked={selectedReport === item._id}
              className="mr-2"
            />
            {item.name}
          </div>
        ))}
      </div>
      <div onClick={downloadSelectedReportExcel} className="fixed bottom-0 w-full p-4 bg-white outline-none cursor-pointer">
        <button
          type="button"
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#000000] py-2 text-white`}
        >
          {loading ? 'Loading...' : 'download'}
        </button>
      </div>
    </div>
  );
});

export default Reports;
