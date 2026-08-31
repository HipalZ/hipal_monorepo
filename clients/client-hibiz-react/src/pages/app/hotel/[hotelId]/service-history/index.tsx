import PopUp from '@/components/atom/popUp';
import { useHotelStore } from '@/components/hooks/useHotelStore';
import { useFormatTimes } from '@/components/hotel/helpers';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCartItemLineTotal, getCartItemUnitPrice } from '@/components/utils/cartPricing';
import { ChevronDown, ChevronUp, Clock, Download, Home, Package, Search, User } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const MemoHistoryHotel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const { historyData } = useHistoryAlerts();
  const { formatTimestamp } = useFormatTimes();
  const { setCartData, setOpenCartModal } = useHotelStore();
  const [showCartWarningModal, setShowCartWarningModal] = useState(false);
  const navigate = useNavigate();
  const { businessId } = useParams();

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredHistory = useMemo(() => {
    if (!historyData) return [];
    const term = searchTerm?.toLowerCase();

    return historyData.filter(
      (item) =>
        item?.roomId?.name?.toLowerCase().includes(term) ||
        getServiceRequested(item).toLowerCase().includes(term) ||
        buildOrderItems(item?.cart).toLowerCase().includes(term) ||
        item?.createdBy?.name?.toLowerCase().includes(term),
    );
  }, [historyData, searchTerm]);

  const getTimeDifference = (start?: number, end?: number) => {
    if (!start || !end) return '-';

    const seconds = Math.max(0, Math.round((end - start) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
  };

  const getTimeDifferenceInMinutes = (start?: number, end?: number) => {
    if (!start || !end) return '';
    const minutes = (end - start) / 1000 / 60;
    if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
    const rounded = Math.round(minutes * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} min`;
  };

  const formatExcelTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  function buildOrderItems(cart?: any[]) {
    if (!cart || cart.length === 0) return '';

    return cart
      .map((item) => {
        const dishName = item?.dish?.name || '';
        const quantity = item?.quantity ?? 1;
        const portionName = item?.portion?.name ? ` - ${item.portion.name}` : '';
        const extrasLabel =
          item?.extras
            ?.map((extra) => `${extra?.name}${extra?.quantity > 1 ? ` x${extra.quantity}` : ''}`)
            .filter(Boolean)
            .join(', ') || '';
        const unitPrice = getCartItemUnitPrice(item);
        const lineTotal = getCartItemLineTotal(item);

        if (unitPrice !== undefined && unitPrice !== null) {
          return `${dishName}${portionName}${extrasLabel ? ` + ${extrasLabel}` : ''} x${quantity} @ ₹${unitPrice} = ₹${lineTotal}`;
        }

        return `${dishName}${portionName}${extrasLabel ? ` + ${extrasLabel}` : ''} x${quantity}`;
      })
      .join(' | ');
  }

  function getServiceRequested(item: any) {
    const serviceNames =
      item?.serviceIds
        ?.map((service) => service?.name)
        .filter(Boolean)
        .join(', ') || '';

    if (serviceNames) return serviceNames;
    return item?.cart?.length ? 'Food Order' : '';
  }

  const escapeCsvValue = (value: unknown) => {
    const str = String(value ?? '');
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadCsv = (filename: string, summaryLines: string[], rows: Record<string, unknown>[]) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const summarySection = summaryLines.join('\n');

    const tableSection = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ].join('\n');

    const csvContent = `${summarySection}\n\n${tableSection}`;

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);

      const sourceData = filteredHistory?.length ? filteredHistory : historyData || [];

      if (!sourceData.length) {
        alert('No service history available to download.');
        return;
      }

      const curatedServiceRows = sourceData.map((item) => ({
        'Requested At': formatExcelTimestamp(item?.createdAt),
        'Guest Name': item?.createdBy?.name || '',
        'Room No': item?.roomId?.name || '',
        'Service Requested': getServiceRequested(item),
        'Order Items': buildOrderItems(item?.cart),
        'Request Status': item?.alertProgress || '',
        Escalated: item?.isEscalated ? 'Yes' : 'No',
        'Escalation Level': item?.isEscalated ? (item?.level ?? 0) : 0,
        'Accepted By': item?.acceptedBy?.name || '',
        'Accepted At': formatExcelTimestamp(item?.acceptedAt),
        'Acceptance Time': getTimeDifferenceInMinutes(item?.createdAt, item?.acceptedAt),
        'Completed By': item?.deliveredBy?.name || '',
        'Completed At': formatExcelTimestamp(item?.deliveredAt),
        'Completion Time After Acceptance': getTimeDifferenceInMinutes(item?.acceptedAt, item?.deliveredAt),
        'Total Time': getTimeDifferenceInMinutes(item?.createdAt, item?.deliveredAt),
      }));

      const uniqueGuests = new Set(curatedServiceRows.map((row) => row['Guest Name']).filter(Boolean)).size;

      const uniqueRooms = new Set(curatedServiceRows.map((row) => row['Room No']).filter(Boolean)).size;

      const rawRequestTimestamps = sourceData
        .map((item) => item?.createdAt)
        .filter((ts): ts is number => Boolean(ts))
        .sort((a, b) => a - b);

      const minDate = rawRequestTimestamps.length ? formatExcelTimestamp(rawRequestTimestamps[0]) : '';

      const maxDate = rawRequestTimestamps.length ? formatExcelTimestamp(rawRequestTimestamps[rawRequestTimestamps.length - 1]) : '';

      const summaryLines = [
        'HOTEL SERVICE MANAGEMENT REPORT',
        `Total Service Requests: ${curatedServiceRows.length}`,
        `Total Unique Guests: ${uniqueGuests}`,
        `Total Rooms Covered: ${uniqueRooms}`,
        `Date Range: ${minDate} to ${maxDate}`,
        `Generated At: ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}`,
        '--------------------------------------------',
      ];

      const filename = `hotel_service_report_${Date.now()}.csv`;

      downloadCsv(filename, summaryLines, curatedServiceRows);
    } catch (error) {
      console.error('Failed to download service report:', error);
      alert('Failed to download service report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const viewCart = (cart) => {
    setCartData(cart);
    setOpenCartModal(true);
  };

  const keepCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  const clearCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  return (
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Service History" leftIcon={<FaArrowLeft />} />
      </header>

      <div className="mx-auto px-4 py-6">
        <DateRangePicker />

        <div className="mb-6 mt-2 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold">Service History</h1>

            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search room, service..."
                  className="border-blue-200 pl-9 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                onClick={handleDownloadReport}
                disabled={isDownloading || !(historyData?.length || filteredHistory?.length)}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Preparing Report...' : 'Download Report'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredHistory?.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-lg transition-all duration-200">
              <section
                className="flex cursor-pointer items-center justify-between border bg-gray-100 p-3"
                onClick={() => toggleItem(item._id)}
                onKeyDown={(e) => e.key === 'Enter' && toggleItem(item._id)}
              >
                <article className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Room:- {item?.roomId?.name}</div>
                  </div>
                </article>

                <article className="flex items-center gap-2">
                  <h1 className="font-medium">{getServiceRequested(item) || '—'}</h1>
                  {expandedItems.has(item._id) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </article>
              </section>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.has(item._id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <h1>{getServiceRequested(item) || '—'}</h1>
                        {item?.cart?.length ? (
                          <p className="mt-1 max-w-[18rem] truncate text-xs text-gray-500" title={buildOrderItems(item?.cart)}>
                            {buildOrderItems(item?.cart)}
                          </p>
                        ) : null}
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3.5 w-3.5" />
                          Requested by {item?.createdBy?.name}
                        </div>
                      </div>
                    </div>

                    {item?.cart && item?.cart?.length > 0 && (
                      <Button onClick={() => viewCart(item?.cart)} variant="outline" className="mt-1 text-sm">
                        View Cart
                      </Button>
                    )}
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute bottom-0 left-[9px] top-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-green-300" />

                    <div className="group relative mb-4">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-blue-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Request Created</div>
                        <div className="text-xs text-gray-600">{formatTimestamp(item?.createdAt)}</div>
                      </div>
                    </div>

                    <div className="group relative mb-4">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-indigo-400 to-indigo-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Request Accepted</div>
                        <div className="text-xs text-gray-600">
                          {formatTimestamp(item?.acceptedAt || item?.createdAt)} •
                          <span className="ml-1">{getTimeDifference(item?.createdAt, item?.acceptedAt)} after request</span>
                        </div>
                        <div className="text-xs text-gray-600">by {item?.acceptedBy?.name}</div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-green-400 to-green-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Service Delivered</div>
                        <div className="text-xs text-gray-600">
                          {formatTimestamp(item?.deliveredAt || item?.createdAt)} •
                          <span className="ml-1">{getTimeDifference(item?.acceptedAt, item?.deliveredAt)} after acceptance</span>
                        </div>
                        <div className="text-xs text-gray-600">by {item?.deliveredBy?.name}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-y p-3 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Time to complete:</span> {getTimeDifference(item?.createdAt, item?.deliveredAt)}
                  </div>
                  <Badge variant="outline" className="border-blue-200 bg-white">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {filteredHistory?.length === 0 && (
            <div className="rounded-lg border bg-white py-12 text-center shadow-sm md:col-span-2 xl:col-span-3 2xl:col-span-4">
              <Clock className="mx-auto mb-3 h-16 w-16 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-700">No history found</h3>
              <p className="mx-auto mt-1 max-w-md text-gray-500">
                {searchTerm
                  ? `No results found for "${searchTerm}". Try a different search term.`
                  : 'No service history available for the selected filters.'}
              </p>
              {searchTerm && (
                <Button variant="outline" className="mt-4 border-blue-200" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showCartWarningModal && (
        <PopUp height="300px" show={showCartWarningModal} onClose={() => setShowCartWarningModal(false)} hide={false}>
          <div className="flex h-full flex-col p-6">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h2 className="mb-4 text-2xl font-bold">Clear Cart?</h2>
              <p className="mb-6 text-gray-600">You will lose all items inside the cart if you proceed. Are you sure you want to continue?</p>
              <div className="flex w-full max-w-xs gap-4">
                <Button variant="outline" onClick={keepCart} className="flex-1">
                  No, Keep Cart
                </Button>
                <Button onClick={clearCart} className="flex-1 bg-red-600 text-white hover:bg-red-700">
                  Yes, Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </PopUp>
      )}
    </main>
  );
};

const HistoryHotel = memo(MemoHistoryHotel);
export default HistoryHotel;
