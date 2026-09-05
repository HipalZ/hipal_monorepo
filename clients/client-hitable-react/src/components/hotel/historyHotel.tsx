import BottomPopUp from '@/components/atoms/bottomPopUp';
import DateRangePicker from '@/components/atoms/dateRangePicker';
import { useCartStore } from '@/components/store/useCartStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHistoryAlerts } from '@/hooks/useHotelApis';
import {
  AlarmClock,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
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
import { useNavigate, useParams } from 'react-router-dom';
import { useHotelStore } from '../store/useHotelStore';
import { useFormatTimes } from '../utils/helpersHotel';

const PAGE_SIZE = 20;

const CATEGORY_META = {
  food: {
    label: 'Food',
    Icon: Utensils,
    className: 'border-[#B66B00] bg-[#D97706] text-white shadow-[0_10px_22px_rgba(217,119,6,0.18)]',
    borderColor: '#B66B00',
    backgroundColor: '#D97706',
    iconClass: 'text-white/95',
  },
  housekeeping: {
    label: 'Housekeeping',
    Icon: SprayCan,
    className: 'border-[#08745F] bg-[#0F9F82] text-white shadow-[0_10px_22px_rgba(15,159,130,0.18)]',
    borderColor: '#08745F',
    backgroundColor: '#0F9F82',
    iconClass: 'text-white/95',
  },
  frontOffice: {
    label: 'Front Office',
    Icon: BriefcaseBusiness,
    className: 'border-[#245DA8] bg-[#3478D4] text-white shadow-[0_10px_22px_rgba(52,120,212,0.18)]',
    borderColor: '#245DA8',
    backgroundColor: '#3478D4',
    iconClass: 'text-white/95',
  },
  maintenance: {
    label: 'Maintenance',
    Icon: Wrench,
    className: 'border-[#5E4AB4] bg-[#7457D9] text-white shadow-[0_10px_22px_rgba(116,87,217,0.18)]',
    borderColor: '#5E4AB4',
    backgroundColor: '#7457D9',
    iconClass: 'text-white/95',
  },
} as const;

const HISTORY_OK_COLORS = {
  background: '#F1FBF6',
  border: '#B8E4C8',
  accent: '#2FB26F',
  header: '#F8FFFB',
  serviceClass: 'text-[#0F5132]',
  shadowClass: 'shadow-[0_8px_20px_rgba(47,178,111,0.08)]',
};

const HISTORY_BREACH_COLORS = {
  background: '#FFF1F2',
  border: '#F3C7CD',
  accent: '#DC2626',
  header: '#FFF7F7',
  serviceClass: 'text-[#8A1F2D]',
  shadowClass: 'shadow-[0_10px_24px_rgba(220,38,38,0.08)]',
};

type CategoryKey = keyof typeof CATEGORY_META;
type StatusFilter = 'all' | 'DELIVERED' | 'NOT_DELIVERED' | 'REJECTED' | 'RESOLVED';

const MemoHistoryHotel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryKey>('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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
  const [showCartWarningModal, setShowCartWarningModal] = useState(false);
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { setCartEmpty } = useCartStore();

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

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

  function hasFoodCartItems(cart?: any[]) {
    return Boolean(cart?.some((item) => item?.dish || item?.dishId || item?.name || item?.dishName));
  }

  function buildOrderItems(cart?: any[]) {
    if (!hasFoodCartItems(cart)) return '';
    return cart
      .map((item) => {
        const dishName = item?.dish?.name || item?.name || item?.dishName || '';
        const portionName = item?.portion?.name ? ` - ${item.portion.name}` : '';
        const extras =
          item?.extras
            ?.map((extra) => `${extra?.name || ''}${extra?.quantity > 1 ? ` x${extra.quantity}` : ''}`)
            .filter(Boolean)
            .join(', ') || '';
        if (!dishName) return '';
        return `${dishName}${portionName}${extras ? ` + ${extras}` : ''} x${item?.quantity ?? 1}`;
      })
      .filter(Boolean)
      .join(' | ');
  }

  function getServiceLabel(item: any, isWakeUpCallAlert = false) {
    if (isWakeUpCallAlert) return 'Wake-up Call';
    const serviceNames =
      item?.serviceIds
        ?.map((service) => {
          if (!service?.name) return '';
          return service.name;
        })
        .filter(Boolean)
        .join(', ') || '';
    if (serviceNames) return serviceNames;
    return hasFoodCartItems(item?.cart) ? 'Food Order' : '—';
  }

  function getServiceQuantityBadges(item: any) {
    return (
      item?.serviceIds
        ?.map((service) => {
          if (!service?._id || !service?.name) return null;
          const requestedItem = item?.serviceRequestItems?.find((requestItem) => requestItem?.serviceId?.toString() === service?._id);
          const quantity = Number(requestedItem?.quantity || 1);
          if (quantity <= 1) return null;
          return item?.serviceIds?.length > 1 ? `${service.name}: ${quantity}` : `Qty: ${quantity}`;
        })
        .filter(Boolean) || []
    );
  }

  function getCategory(item: any, isWakeUpCallAlert = false): CategoryKey {
    if (hasFoodCartItems(item?.cart)) return 'food';
    if (isWakeUpCallAlert) return 'frontOffice';

    const label = getServiceLabel(item).toLowerCase();
    if (/front|office|reception|checkout|check out|check-in|check in|wake|key|luggage|bill|billing/i.test(label)) return 'frontOffice';
    if (/maintenance|repair|ac|a\/c|tv|wifi|internet|light|fan|electric|plumb|leak|flush|geyser|tap|shower repair/i.test(label)) return 'maintenance';
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
        const staffName = item?.deliveredBy?.name || item?.acceptedBy?.name || '';
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
          staffName,
          slaStatus,
          status: item?.alertProgress || 'UNKNOWN',
        };
      }),
    [sortedHistory],
  );

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, roomFilter, searchTerm, serviceFilter, staffFilter, statusFilter]);

  const categoryCounts = historySummary;
  const roomCountsByName = useMemo(() => new Map((historyRoomSummary ?? []).map((room) => [room.name, room.count])), [historyRoomSummary]);
  const totalPages = Math.max(1, historyTotalPages);
  const currentPage = Math.min(page, totalPages);
  const pagedHistory = enrichedHistory;
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

  const viewCart = (cart) => {
    setCartData(cart);
    setOpenCartModal(true);
  };

  const keepCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  const clearCart = useCallback(() => {
    setCartEmpty();
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate, setCartEmpty]);

  return (
    <>
      <div className="mx-auto px-3 pb-40 pt-3 sm:px-4 lg:pb-24 lg:pt-4">
        <DateRangePicker />
        <div className="mb-3 mt-2 rounded-lg border bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">Service History</h1>
              <p className="mt-0.5 text-sm text-gray-500">Latest requests are shown first</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 gap-2 px-3" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {activeFilterCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>}
            </Button>
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
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
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
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0}>
                  Clear filters
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
                className={`min-h-[86px] rounded-lg border p-3 text-left transition sm:min-h-[76px] ${meta.className} ${active ? 'ring-2 ring-black/20' : 'hover:-translate-y-0.5 hover:shadow-lg'}`}
                style={{ backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white/95">{meta.label}</span>
                  <Icon className={`h-4 w-4 ${meta.iconClass}`} />
                </div>
                <div className="mt-1.5 text-2xl font-bold leading-none tabular-nums text-white">{categoryCounts[key]}</div>
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
          {pagedHistory?.map(({ item, isWakeUpCallAlert, displayMessage, serviceLabel, serviceQuantityBadges, serviceInstruction, orderItems, slaStatus, status }) => {
            const completedAt = item?.deliveredAt || item?.rejectedAt || item?.createdAt;
            const historyTone = slaStatus.isBreached ? HISTORY_BREACH_COLORS : HISTORY_OK_COLORS;
            const cardBackgroundColor = historyTone.background;
            const cardBorderColor = historyTone.border;
            const cardAccentColor = historyTone.accent;
            const cardHeaderBackgroundColor = historyTone.header;

            return (
              <div
                key={item._id}
                className={`self-start overflow-hidden rounded-lg border border-l-4 shadow-sm transition-all duration-200 ${
                  historyTone.shadowClass
                }`}
                style={{ backgroundColor: cardBackgroundColor, borderColor: cardBorderColor, borderLeftColor: cardAccentColor }}
              >
                <section
                  className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 border-b p-3"
                  style={{ backgroundColor: cardHeaderBackgroundColor }}
                  onClick={() => toggleItem(item._id)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleItem(item._id)}
                >
                  <article className="min-w-0 shrink-0">
                    <div>
                      <div className="font-medium">Room:- {item?.roomId?.name}</div>
                    </div>
                  </article>

                  <article className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                    <h1 className={`flex min-w-0 items-center justify-end gap-1.5 font-semibold ${historyTone.serviceClass}`}>
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
                  className={`overflow-hidden transition-all duration-300 ${expandedItems.has(item._id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
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
                                : `${getTimeDifference(item?.acceptedAt, item?.deliveredAt)} after acceptance`}
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
          <div className="fixed bottom-[4.5rem] left-0 right-0 z-40 border-t bg-white/95 px-3 py-2 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:bottom-0">
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
        <BottomPopUp height="300px" show={showCartWarningModal} onClose={() => setShowCartWarningModal(false)} hide={false}>
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
        </BottomPopUp>
      )}
    </>
  );
};

const HistoryHotel = memo(MemoHistoryHotel);
export default HistoryHotel;
