import PopUp from '@/components/atom/popUp';
import { useHotelStore } from '@/components/hooks/useHotelStore';
import { useFormatTimes } from '@/components/hotel/helpers';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import useTimings from '@/components/store/useTimings';
import { useHistoryAlerts, type HistoryStatusFilter } from '@/components/store/hotel/useHotelApis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCartItemLineTotal, getCartItemUnitPrice } from '@/components/utils/cartPricing';
import { apiRpc } from '@hi/common';
import {
  AlarmClock,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Package,
  Search,
  SlidersHorizontal,
  SprayCan,
  User,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const PAGE_SIZE = 20;

const CATEGORY_META = {
  food: {
    label: 'Food',
    Icon: Utensils,
    className: 'border-[#F2D4A7] bg-[#FFF6E8] text-slate-950',
    accentClass: 'border-l-[#E7A84B]',
    headerClass: 'bg-[#FFF8EE]',
    serviceClass: 'text-slate-950',
    borderColor: '#F2D4A7',
    backgroundColor: '#FFF6E8',
    accentColor: '#E7A84B',
    headerBackgroundColor: '#FFF8EE',
  },
  housekeeping: {
    label: 'Housekeeping',
    Icon: SprayCan,
    className: 'border-[#BFDCD3] bg-[#F0FAF7] text-slate-950',
    accentClass: 'border-l-[#54A58D]',
    headerClass: 'bg-[#F6FCFA]',
    serviceClass: 'text-slate-950',
    borderColor: '#BFDCD3',
    backgroundColor: '#F0FAF7',
    accentColor: '#54A58D',
    headerBackgroundColor: '#F6FCFA',
  },
  frontOffice: {
    label: 'Front Office',
    Icon: BriefcaseBusiness,
    className: 'border-[#C8DAF3] bg-[#F3F8FF] text-slate-950',
    accentClass: 'border-l-[#6F9EDB]',
    headerClass: 'bg-[#F7FAFF]',
    serviceClass: 'text-slate-950',
    borderColor: '#C8DAF3',
    backgroundColor: '#F3F8FF',
    accentColor: '#6F9EDB',
    headerBackgroundColor: '#F7FAFF',
  },
  maintenance: {
    label: 'Maintenance',
    Icon: Wrench,
    className: 'border-[#D5CEE9] bg-[#F8F5FF] text-slate-950',
    accentClass: 'border-l-[#8A78C7]',
    headerClass: 'bg-[#FAF8FF]',
    serviceClass: 'text-slate-950',
    borderColor: '#D5CEE9',
    backgroundColor: '#F8F5FF',
    accentColor: '#8A78C7',
    headerBackgroundColor: '#FAF8FF',
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

const MemoHistoryHotel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryKey>('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCartWarningModal, setShowCartWarningModal] = useState(false);

  const { historyData, historyTotal, historyTotalPages, historySummary, historyRoomSummary, historyFilterOptions } = useHistoryAlerts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearchTerm,
    category: categoryFilter,
    room: roomFilter,
    service: serviceFilter,
    status: statusFilter,
    staff: staffFilter,
  });
  const { formatTimestamp } = useFormatTimes();
  const { setCartData, setOpenCartModal } = useHotelStore();
  const navigate = useNavigate();
  const { businessId: routeBusinessId } = useParams();
  const businessDataId = useBusinessData((s) => s.outletInfo?.businessId);
  const ownerUserId = useOwnerLogin((s) => s.user?._id);
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, roomFilter, searchTerm, serviceFilter, staffFilter, statusFilter]);

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

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

  function hasFoodCartItems(cart?: any[]) {
    return Boolean(cart?.some((item) => item?.dish || item?.dishId || item?.name || item?.dishName));
  }

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
    if (!hasFoodCartItems(cart)) return '';

    return cart
      .map((item) => {
        const dishName = item?.dish?.name || item?.name || item?.dishName || '';
        const quantity = item?.quantity ?? 1;
        const portionName = item?.portion?.name ? ` - ${item.portion.name}` : '';
        const extrasLabel =
          item?.extras
            ?.map((extra) => `${extra?.name || ''}${extra?.quantity > 1 ? ` x${extra.quantity}` : ''}`)
            .filter(Boolean)
            .join(', ') || '';
        const unitPrice = getCartItemUnitPrice(item);
        const lineTotal = getCartItemLineTotal(item);

        if (!dishName) return '';
        if (unitPrice !== undefined && unitPrice !== null) {
          return `${dishName}${portionName}${extrasLabel ? ` + ${extrasLabel}` : ''} x${quantity} @ ₹${unitPrice} = ₹${lineTotal}`;
        }

        return `${dishName}${portionName}${extrasLabel ? ` + ${extrasLabel}` : ''} x${quantity}`;
      })
      .filter(Boolean)
      .join(' | ');
  }

  function getServiceLabel(item: any, isWakeUpCallAlert = false) {
    if (isWakeUpCallAlert) return 'Wake-up Call';
    const serviceNames =
      item?.serviceIds
        ?.map((service) => service?.name || '')
        .filter(Boolean)
        .join(', ') || '';
    if (serviceNames) return serviceNames;
    return hasFoodCartItems(item?.cart) ? 'Food Order' : '—';
  }

  function getServiceQuantityBadges(item: any) {
    const serviceBadges =
      item?.serviceIds
        ?.map((service) => {
          if (!service?._id || !service?.name) return null;
          const requestedItem = item?.serviceRequestItems?.find((requestItem) => {
            const requestServiceId =
              typeof requestItem?.serviceId === 'object' ? requestItem?.serviceId?._id?.toString() : requestItem?.serviceId?.toString();
            return requestServiceId === service._id.toString();
          });
          const quantity = Number(requestedItem?.quantity || 1);
          if (quantity <= 1) return null;
          return item?.serviceIds?.length > 1 ? `${service.name}: ${quantity}` : `Qty: ${quantity}`;
        })
        .filter(Boolean) || [];

    if (serviceBadges.length) return serviceBadges;

    const cartQuantity = hasFoodCartItems(item?.cart)
      ? item.cart.reduce((total, cartItem) => total + Number(cartItem?.quantity || 0), 0)
      : 0;
    return cartQuantity > 0 ? [`Items: ${cartQuantity}`] : [];
  }

  function getCategory(item: any, isWakeUpCallAlert = false): CategoryKey {
    if (hasFoodCartItems(item?.cart)) return 'food';
    if (isWakeUpCallAlert) return 'frontOffice';

    const label = getServiceLabel(item).toLowerCase();
    if (/front|office|reception|checkout|check out|check-in|check in|wake|key|luggage|bill|billing/i.test(label)) return 'frontOffice';
    if (/maintenance|repair|ac|a\/c|tv|wifi|internet|light|fan|electric|plumb|leak|flush|geyser|tap|shower repair/i.test(label)) {
      return 'maintenance';
    }
    return 'housekeeping';
  }

  function getStatusLabel(status?: string) {
    if (status === 'NOT_DELIVERED') return 'Not delivered';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'RESOLVED') return 'Resolved';
    if (status === 'DELIVERED') return 'Delivered';
    return status || 'Unknown';
  }

  function getSlaStatus(item: any) {
    const createdAt = Number(item?.createdAt || item?.date || 0);
    const acceptedAt = Number(item?.acceptedAt || 0);
    const completedAt = Number(item?.deliveredAt || item?.rejectedAt || 0);
    const services = item?.serviceIds || [];
    const serviceAcceptMins = services.reduce((max, service) => Math.max(max, Number(service?.avgAcceptanceTime || 0)), 0);
    const serviceDeliverMins = services.reduce(
      (max, service) => Math.max(max, Number(service?.avgDeliveryTime ?? service?.avgCompletionTime ?? 0)),
      0,
    );
    const foodPrepMins = hasFoodCartItems(item?.cart)
      ? item.cart.reduce((max, cartItem) => Math.max(max, Number(cartItem?.dish?.avgPrepTime || 0)), 0)
      : 0;
    const acceptMs = (serviceAcceptMins || (hasFoodCartItems(item?.cart) ? 2 : 0)) * 60_000;
    const deliverMs = (hasFoodCartItems(item?.cart) ? foodPrepMins || 30 : serviceDeliverMins) * 60_000;
    const progress = String(item?.alertProgress || '');
    const now = Date.now();
    const activeOrCompletedAt = completedAt || now;

    const acceptanceLate = Boolean(
      createdAt && acceptMs > 0 && (acceptedAt ? acceptedAt - createdAt > acceptMs : activeOrCompletedAt - createdAt > acceptMs),
    );
    const deliveryLate = Boolean(
      createdAt &&
        deliverMs > 0 &&
        (acceptedAt
          ? (completedAt ? completedAt - acceptedAt : now - acceptedAt) > deliverMs
          : completedAt > 0 && completedAt - createdAt > acceptMs + deliverMs),
    );
    const escalated = Boolean(item?.isEscalated || progress.includes('ESCALATION'));

    return {
      acceptanceLate,
      deliveryLate,
      isBreached: escalated || acceptanceLate || deliveryLate,
    };
  }

  const sortedHistory = useMemo(
    () => [...(historyData ?? [])].sort((a, b) => Number(b?.createdAt ?? b?.date ?? 0) - Number(a?.createdAt ?? a?.date ?? 0)),
    [historyData],
  );

  const enrichedHistory = useMemo(
    () =>
      sortedHistory.map((item) => {
        const isWakeUpCallAlert = item?.message?.startsWith('WAKE_UP_CALL::');
        const serviceLabel = getServiceLabel(item, isWakeUpCallAlert);
        const serviceQuantityBadges = getServiceQuantityBadges(item);
        const orderItems = buildOrderItems(item?.cart);
        const category = getCategory(item, isWakeUpCallAlert);
        const slaStatus = getSlaStatus(item);

        return {
          item,
          isWakeUpCallAlert,
          displayMessage: isWakeUpCallAlert ? item?.message?.replace('WAKE_UP_CALL::', '') : item?.message,
          serviceLabel,
          serviceQuantityBadges,
          serviceInstruction: item?.serviceInstructionSnapshot?.message || '',
          orderItems,
          category,
          slaStatus,
          status: item?.alertProgress || 'UNKNOWN',
        };
      }),
    [sortedHistory],
  );

  const categoryCounts = historySummary;
  const roomCountsByName = useMemo(() => new Map((historyRoomSummary ?? []).map((room) => [room.name, room.count])), [historyRoomSummary]);
  const totalPages = Math.max(1, historyTotalPages);
  const currentPage = Math.min(page, totalPages);
  const rangeStart = historyTotal ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, historyTotal);
  const selectedRoomCount = roomFilter !== 'all' ? roomCountsByName.get(roomFilter) : undefined;
  const activeFilterCount = [
    searchTerm,
    categoryFilter !== 'all',
    roomFilter !== 'all',
    serviceFilter !== 'all',
    statusFilter !== 'all',
    staffFilter !== 'all',
  ].filter(Boolean).length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setRoomFilter('all');
    setServiceFilter('all');
    setStatusFilter('all');
    setStaffFilter('all');
  };

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

      const exportRows: any[] = [];
      const exportLimit = 100;
      const baseQuery = {
        businessId: businessDataId,
        from: String(timeStampStart),
        to: String(timeStampEnd),
        userId: ownerUserId,
        limit: String(exportLimit),
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
        ...(roomFilter !== 'all' ? { room: roomFilter } : {}),
        ...(serviceFilter !== 'all' ? { service: serviceFilter } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(staffFilter !== 'all' ? { staff: staffFilter } : {}),
      };

      if (businessDataId && ownerUserId && timeStampStart && timeStampEnd) {
        let exportPage = 1;
        let exportTotalPages = 1;

        do {
          const response = await (apiRpc.hotel.alert as any).fetch_alert_history_page.$get({
            query: {
              ...baseQuery,
              page: String(exportPage),
            },
          });
          const res = await response.json();
          if (response.status !== 200 && response.status !== 201) break;

          exportRows.push(...(res?.data?.rows ?? []));
          exportTotalPages = Math.max(1, Number(res?.data?.totalPages ?? 1));
          exportPage += 1;
        } while (exportPage <= exportTotalPages);
      }

      const exportHistory = exportRows.length
        ? exportRows
            .sort((a, b) => Number(b?.createdAt ?? b?.date ?? 0) - Number(a?.createdAt ?? a?.date ?? 0))
            .map((item) => {
              const isWakeUpCallAlert = item?.message?.startsWith('WAKE_UP_CALL::');
              return {
                item,
                serviceLabel: getServiceLabel(item, isWakeUpCallAlert),
                serviceQuantityBadges: getServiceQuantityBadges(item),
                serviceInstruction: item?.serviceInstructionSnapshot?.message || '',
                orderItems: buildOrderItems(item?.cart),
                status: item?.alertProgress || 'UNKNOWN',
              };
            })
        : enrichedHistory;

      if (!exportHistory.length) {
        alert('No service history available to download.');
        return;
      }

      const curatedServiceRows = exportHistory.map(({ item, serviceLabel, serviceQuantityBadges, orderItems, status }) => ({
        'Requested At': formatExcelTimestamp(item?.createdAt),
        'Guest Name': item?.createdBy?.name || '',
        'Room No': item?.roomId?.name || '',
        'Service Requested': serviceLabel,
        Quantity: serviceQuantityBadges.join(', '),
        'Customer Instruction': item?.serviceInstructionSnapshot?.message || '',
        'Order Items': orderItems,
        'Request Status': getStatusLabel(status),
        Escalated: item?.isEscalated ? 'Yes' : 'No',
        'Escalation Level': item?.isEscalated ? (item?.level ?? 0) : 0,
        'Accepted By': item?.acceptedBy?.name || '',
        'Accepted At': formatExcelTimestamp(item?.acceptedAt),
        'Acceptance Time': getTimeDifferenceInMinutes(item?.createdAt, item?.acceptedAt),
        'Completed By': item?.deliveredBy?.name || '',
        'Completed At': formatExcelTimestamp(item?.deliveredAt || item?.rejectedAt),
        'Completion Time After Acceptance': getTimeDifferenceInMinutes(item?.acceptedAt, item?.deliveredAt || item?.rejectedAt),
        'Total Time': getTimeDifferenceInMinutes(item?.createdAt, item?.deliveredAt || item?.rejectedAt),
      }));

      const uniqueGuests = new Set(curatedServiceRows.map((row) => row['Guest Name']).filter(Boolean)).size;
      const uniqueRooms = new Set(curatedServiceRows.map((row) => row['Room No']).filter(Boolean)).size;
      const rawRequestTimestamps = exportHistory
        .map(({ item }) => item?.createdAt)
        .filter((ts): ts is number => Boolean(ts))
        .sort((a, b) => a - b);
      const minDate = rawRequestTimestamps.length ? formatExcelTimestamp(rawRequestTimestamps[0]) : '';
      const maxDate = rawRequestTimestamps.length ? formatExcelTimestamp(rawRequestTimestamps[rawRequestTimestamps.length - 1]) : '';
      const summaryLines = [
        'HOTEL SERVICE MANAGEMENT REPORT',
        `Exported Service Requests: ${curatedServiceRows.length}`,
        `Total Matching Requests: ${historyTotal}`,
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

      downloadCsv(`hotel_service_report_${Date.now()}.csv`, summaryLines, curatedServiceRows);
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
    navigate(`/${routeBusinessId}/alerts`);
  }, [routeBusinessId, navigate]);

  const clearCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${routeBusinessId}/alerts`);
  }, [routeBusinessId, navigate]);

  return (
    <main className="pb-32">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Service History" leftIcon={<FaArrowLeft />} />
      </header>

      <div className="mx-auto px-3 pb-28 pt-3 sm:px-4 lg:pb-24 lg:pt-4">
        <DateRangePicker />

        <div className="mb-3 mt-2 rounded-lg border bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">Service History</h1>
              <p className="mt-0.5 text-sm text-gray-500">Latest requests are shown first</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-9 gap-2 px-3" onClick={() => setShowFilters((value) => !value)}>
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Filters</span>
                {activeFilterCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>}
              </Button>
              <Button
                onClick={handleDownloadReport}
                disabled={isDownloading || !enrichedHistory.length}
                size="sm"
                className="hidden h-9 items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:inline-flex"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Preparing...' : 'Download'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Filter service history</div>
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-500 hover:bg-white hover:text-gray-900"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search room, service, guest..."
                    className="border-blue-200 pl-9 focus-visible:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger className="h-10 border-blue-100 bg-white">
                    <SelectValue placeholder="All rooms" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All rooms</SelectItem>
                    {historyFilterOptions.rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        <span className="flex w-full items-center justify-between gap-3">
                          <span>Room {room}</span>
                          <span className="text-xs text-gray-500">{roomCountsByName.get(room) ?? 0}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="h-10 border-blue-100 bg-white">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All services</SelectItem>
                    {historyFilterOptions.services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as HistoryStatusFilter)}>
                  <SelectTrigger className="h-10 border-blue-100 bg-white">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="NOT_DELIVERED">Not delivered</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={staffFilter} onValueChange={setStaffFilter}>
                  <SelectTrigger className="h-10 border-blue-100 bg-white">
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All staff</SelectItem>
                    {historyFilterOptions.staff.map((staff) => (
                      <SelectItem key={staff} value={staff}>
                        {staff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0}>
                  Clear filters
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={isDownloading || !enrichedHistory.length}
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 sm:hidden"
                >
                  {isDownloading ? 'Preparing...' : 'Download'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(Object.keys(CATEGORY_META) as CategoryKey[]).map((key) => {
            const meta = CATEGORY_META[key];
            const Icon = meta.Icon;
            const active = categoryFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategoryFilter((value) => (value === key ? 'all' : key))}
                className={`min-h-[86px] rounded-lg border p-3 text-left shadow-sm transition sm:min-h-[76px] ${meta.className} ${
                  active ? 'ring-2 ring-slate-900/10' : 'hover:shadow-md'
                }`}
                style={{ backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{meta.label}</span>
                  <Icon className="h-4 w-4 text-slate-700" />
                </div>
                <div className="mt-1.5 text-2xl font-bold leading-none tabular-nums">{categoryCounts[key]}</div>
              </button>
            );
          })}
        </div>

        <div className="mb-3 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
          <div>
            Showing page rows{' '}
            <span className="font-semibold text-gray-900">
              {rangeStart}-{rangeEnd}
            </span>{' '}
            of <span className="font-semibold text-gray-900">{historyTotal}</span> matching requests
            {roomFilter !== 'all' && typeof selectedRoomCount === 'number' && (
              <span className="mt-1 block text-xs text-gray-500">
                Room {roomFilter} raised {selectedRoomCount} request{selectedRoomCount === 1 ? '' : 's'} in this selection
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enrichedHistory.map(({ item, isWakeUpCallAlert, displayMessage, serviceLabel, serviceQuantityBadges, serviceInstruction, orderItems, category, slaStatus, status }) => {
            const completedAt = item?.deliveredAt || item?.rejectedAt || item?.createdAt;
            const categoryMeta = CATEGORY_META[category];
            const cardBackgroundColor = slaStatus.isBreached ? '#FFF1F2' : '#FFFFFF';
            const cardBorderColor = slaStatus.isBreached ? '#F3C7CD' : undefined;
            const cardAccentColor = slaStatus.isBreached ? '#DC2626' : categoryMeta.accentColor;
            const cardHeaderBackgroundColor = slaStatus.isBreached ? '#FFF7F7' : categoryMeta.headerBackgroundColor;

            return (
              <div
                key={item._id}
                className={`self-start overflow-hidden rounded-lg border border-l-4 shadow-sm transition-all duration-200 ${
                  slaStatus.isBreached ? 'shadow-[0_10px_24px_rgba(220,38,38,0.08)]' : categoryMeta.accentClass
                }`}
                style={{ backgroundColor: cardBackgroundColor, borderColor: cardBorderColor, borderLeftColor: cardAccentColor }}
              >
                <section
                  className={`flex min-h-[52px] cursor-pointer items-center justify-between gap-3 border-b p-3 ${categoryMeta.headerClass}`}
                  style={{ backgroundColor: cardHeaderBackgroundColor }}
                  onClick={() => toggleItem(item._id)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleItem(item._id)}
                >
                  <article className="min-w-0 shrink-0">
                    <div className="font-medium">Room:- {item?.roomId?.name}</div>
                  </article>

                  <article className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                    <h1 className={`flex min-w-0 items-center justify-end gap-1.5 font-semibold ${categoryMeta.serviceClass}`}>
                      <span className="min-w-0 truncate">{serviceLabel}</span>
                      {serviceQuantityBadges.length > 0
                        ? serviceQuantityBadges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-bold leading-none text-violet-700"
                            >
                              {badge}
                            </span>
                          ))
                        : null}
                    </h1>
                    {expandedItems.has(item._id) ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
                    )}
                  </article>
                </section>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedItems.has(item._id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full p-2 text-white ${
                            isWakeUpCallAlert ? 'bg-violet-700' : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                          }`}
                        >
                          {isWakeUpCallAlert ? <AlarmClock className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <h1 className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span>{serviceLabel}</span>
                            {serviceQuantityBadges.length > 0
                              ? serviceQuantityBadges.map((badge) => (
                                  <span
                                    key={badge}
                                    className="inline-flex shrink-0 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-bold leading-none text-violet-700"
                                  >
                                    {badge}
                                  </span>
                                ))
                              : null}
                          </h1>
                          {orderItems ? (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500" title={orderItems}>
                              {orderItems}
                            </p>
                          ) : null}
                          {isWakeUpCallAlert && <p className="mt-1 text-sm text-violet-900">{displayMessage}</p>}
                          {serviceInstruction ? <p className="mt-2 rounded-md border border-blue-100 bg-blue-50 p-2 text-xs font-medium text-blue-950">{serviceInstruction}</p> : null}
                          <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-3.5 w-3.5" />
                            Requested by {item?.createdBy?.name}
                          </div>
                        </div>
                      </div>
                      {hasFoodCartItems(item?.cart) && (
                        <Button onClick={() => viewCart(item?.cart)} variant="outline" className="w-fit shrink-0 text-sm">
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

                      {!isWakeUpCallAlert && (
                        <div className="group relative mb-4">
                          <div
                            className={`absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white transition-transform group-hover:scale-110 ${
                              slaStatus.acceptanceLate ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                            }`}
                          />
                          <div className="pl-4 transition-transform group-hover:translate-x-1">
                            <div className={`text-sm font-medium ${slaStatus.acceptanceLate ? 'text-red-700' : ''}`}>Request Accepted</div>
                            <div className={`text-xs ${slaStatus.acceptanceLate ? 'font-semibold text-red-700' : 'text-gray-600'}`}>
                              {formatTimestamp(item?.acceptedAt || item?.createdAt)} -
                              <span className="ml-1">{getTimeDifference(item?.createdAt, item?.acceptedAt)} after request</span>
                            </div>
                            <div className="text-xs text-gray-600">by {item?.acceptedBy?.name}</div>
                          </div>
                        </div>
                      )}

                      <div className="group relative">
                        <div
                          className={`absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white transition-transform group-hover:scale-110 ${
                            slaStatus.deliveryLate ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-green-500'
                          }`}
                        />
                        <div className="pl-4 transition-transform group-hover:translate-x-1">
                          <div className={`text-sm font-medium ${slaStatus.deliveryLate ? 'text-red-700' : ''}`}>
                            {isWakeUpCallAlert ? 'Wake-up Call Removed' : getStatusLabel(status)}
                          </div>
                          <div className={`text-xs ${slaStatus.deliveryLate ? 'font-semibold text-red-700' : 'text-gray-600'}`}>
                            {formatTimestamp(completedAt)} -
                            <span className="ml-1">
                              {isWakeUpCallAlert
                                ? `${getTimeDifference(item?.createdAt, completedAt)} after request`
                                : `${getTimeDifference(item?.acceptedAt, item?.deliveredAt || item?.rejectedAt)} after acceptance`}
                            </span>
                          </div>
                          {item?.deliveredBy?.name && <div className="text-xs text-gray-600">by {item?.deliveredBy?.name}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-y p-3 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">Time to complete:</span> {getTimeDifference(item?.createdAt, completedAt)}
                    </div>
                    <Badge variant="outline" className="border-blue-200 bg-white">
                      ID: {item._id.slice(-6)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}

          {historyTotal === 0 && (
            <div className="rounded-lg border bg-white py-10 text-center shadow-sm md:col-span-2 xl:col-span-3">
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

        {historyTotal > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-3 py-2 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mx-auto flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                className="h-9 w-9 rounded-full bg-white"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                className="h-9 w-9 rounded-full bg-white"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
