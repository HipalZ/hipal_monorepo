import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useCleaningRoomIds } from '@/hooks/useCheckoutTasks';
import { useGetAllRooms } from '@/hooks/useHotelApis';
import { AlertCircle, BedDouble, BedSingle, Bell, BellRing, ChevronRight, Filter, Search, Users, X } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../atoms/loadingSpinner';
import { useAlertsStore } from '../store/useAlertStore';
import useBusinessData from '../store/useBusinessData';
import { useHiClientZ } from '../store/useHiClientzData';
import { useHotelStore } from '../store/useHotelStore';
import { NavItemsHotelEnum, type RoomData } from '../types/hotelData';
import { cn } from '../utils/helpers';
import { useAlertsColors } from '../utils/helpersHotel';

/** Room label shown while a checked-out room is being readied. */
const CLEANING_STATUS = 'CLEANING';
const OVERDUE_ALERT_STATUSES = new Set(['ESCALATION', 'NOT_DELIVERED', 'NON_ACCEPTED_AND_ESCALATION', 'IS_ACCEPTED_AND_ESCALATION']);

const isOverdueAlert = (status?: string) => Boolean(status && OVERDUE_ALERT_STATUSES.has(status));

function MemoRoomsHotel() {
  const { hid: urlBusinessId } = useParams();
  const { allRooms, isLoading } = useGetAllRooms();
  const { setRoomData, setOpenRoomModal, setSelectedNavItem } = useHotelStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const { getStatusStyles } = useAlertsColors();
  const captainData = useHiClientZ((s) => s.captainData);

  // Rooms with an open checkout task are shown as "Cleaning" without touching
  // their stored roomStatus (which stays AVAILABLE, so booking still works).
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const cleaningRoomIds = useCleaningRoomIds(businessId);
  const displayStatusOf = useCallback(
    (room: RoomData) => (room?._id && cleaningRoomIds.has(room._id) ? CLEANING_STATUS : room.roomStatus),
    [cleaningRoomIds],
  );

  // Active service requests per room, from the alert feed already polling in the
  // background. The feed only returns live alerts, so a count here means the
  // room has something open needing attention right now.
  const alerts = useAlertsStore((s) => s.alerts);
  const alertCountByRoom = useMemo(() => {
    const map = new Map<string, { pending: number; overdue: number }>();
    for (const alert of alerts ?? []) {
      const id = alert?.roomId?._id;
      if (!id) continue;
      const current = map.get(id) ?? { pending: 0, overdue: 0 };
      current.pending += 1;
      if (isOverdueAlert(alert?.alertProgress)) current.overdue += 1;
      map.set(id, current);
    }
    return map;
  }, [alerts]);
  const totalPendingAlerts = alerts?.length ?? 0;
  const totalOverdueAlerts = useMemo(() => (alerts ?? []).filter((alert) => isOverdueAlert(alert?.alertProgress)).length, [alerts]);
  const handleRoom = useCallback(
    (room: RoomData) => {
      // Check if any customRole matches the businessId and has the required role
      const hasAccess = captainData?.customRole?.some(
        (roleEntry) =>
          roleEntry.businessId?._id === urlBusinessId &&
          (roleEntry.role === 'FRONT_OFFICE' || roleEntry.role === 'HELP_DESK' || roleEntry.role === 'MANAGER'),
      );
      if (hasAccess) {
        setRoomData(room);
        setOpenRoomModal(true);
      } else {
        console.error('Access denied: Invalid role or business ID mismatch');
      }
    },
    [captainData, urlBusinessId, setRoomData, setOpenRoomModal],
  );

  const toggleStatusFilter = useCallback((status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilters([]);
  }, []);

  const filteredRooms = useMemo(() => {
    const filtered = allRooms?.filter((room) => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(displayStatusOf(room));

      return matchesSearch && matchesStatus;
    });

    return filtered?.sort((a, b) => Number.parseInt(a.name) - Number.parseInt(b.name));
  }, [allRooms, searchQuery, statusFilters, displayStatusOf]);

  const statusOptions = ['AVAILABLE', 'OCCUPIED', 'BOOKED', 'CLEANING', 'MAINTENANCE'];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="hide-scrollbar mx-auto min-h-screen px-4 py-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Rooms</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-slate-700">
                {filteredRooms?.length} {filteredRooms?.length === 1 ? 'room' : 'rooms'} found
              </span>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-2 font-medium text-orange-600">
                <Bell className="h-4 w-4" />
                {totalPendingAlerts} pending {totalPendingAlerts === 1 ? 'alert' : 'alerts'}
              </span>
              {totalOverdueAlerts > 0 && (
                <>
                  <span className="hidden h-5 w-px bg-slate-200 sm:block" />
                  <span className="inline-flex items-center gap-2 font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {totalOverdueAlerts} overdue
                  </span>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                className="hidden h-9 rounded-lg border-slate-200 bg-white px-4 text-slate-900 shadow-sm hover:bg-slate-50 md:flex"
                onClick={() => setSelectedNavItem(NavItemsHotelEnum.Alerts)}
              >
                View alerts
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search room, service..."
                className="border-blue-200 pl-9 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-200 bg-gray-50">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    {statusFilters.length > 0 && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs">{statusFilters.length}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {statusOptions?.map((status) => {
                    const styles = getStatusStyles(status);
                    return (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      >
                        <div className="flex items-center">
                          <div className={cn('mr-2 h-2 w-2 rounded-full', styles.dot)} />
                          <span className="capitalize">{status.toLowerCase()}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchQuery || statusFilters?.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} className="bg-gray-200 text-black hover:text-gray-700">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Active filters display */}
        {statusFilters?.length > 0 && (
          <section className="mt-3 flex flex-wrap gap-2">
            {statusFilters?.map((status) => {
              const styles = getStatusStyles(status);
              return (
                <article key={status} className={cn('flex items-center rounded-full px-2 py-1 text-xs font-medium', styles.badge, styles.text)}>
                  <span className="capitalize">{status.toLowerCase()}</span>
                  <button type="button" onClick={() => toggleStatusFilter(status)} className="ml-1 rounded-full p-0.5 hover:bg-gray-200">
                    <X className="h-3 w-3" />
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* Room cards grid */}
      <div className="grid grid-cols-2 gap-4 pb-[5rem] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredRooms?.map((room: RoomData) => {
          const displayStatus = displayStatusOf(room);
          const statusStyles = getStatusStyles(displayStatus);
          const roomAlertCounts = room?._id ? alertCountByRoom.get(room._id) : undefined;
          const alertCount = roomAlertCounts?.pending ?? 0;
          const overdueCount = roomAlertCounts?.overdue ?? 0;
          const hasOverdue = overdueCount > 0;
          return (
            <section
              onClick={() => handleRoom(room)}
              onKeyDown={() => handleRoom(room)}
              key={room?._id}
              className={cn(
                'relative min-h-[104px] cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                'border',
                statusStyles.border,
                hasOverdue && 'border-red-500 ring-1 ring-red-100',
                'overflow-hidden',
              )}
            >
              {/* Subtle gradient background based on status */}
              <article className={cn('absolute left-0 top-0 h-full w-full bg-gradient-to-br opacity-30', statusStyles.gradient)} />
              <article className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="truncate pr-2 text-base font-medium text-gray-900">{room?.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {alertCount > 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold shadow-sm',
                          hasOverdue ? 'border-red-200 bg-red-50 text-red-600' : 'border-orange-200 bg-orange-50 text-orange-600',
                        )}
                        title={`${alertCount} active service request${alertCount === 1 ? '' : 's'}`}
                      >
                        {hasOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
                        {alertCount}
                      </span>
                    )}
                    <div className={cn('h-2.5 w-2.5 rounded-full', statusStyles?.dot)} />
                  </div>
                </div>
                <article className="flex items-center justify-between">
                  <article className="flex items-center space-x-1.5">
                    <div className="rounded-md bg-gray-100 p-1.5 shadow-sm">
                      {room.roomType === 'SINGLE' ? (
                        <BedSingle className="h-3.5 w-3.5 text-gray-600" />
                      ) : (
                        <BedDouble className="h-3.5 w-3.5 text-gray-600" />
                      )}
                    </div>

                    <div className="rounded-md bg-gray-100 p-1.5 shadow-sm">
                      <Users className="h-3.5 w-3.5 text-gray-600" />
                      <span className="sr-only">{room?.capacity} capacity</span>
                    </div>
                  </article>
                  <article className={cn('rounded-full px-2 py-1 text-xs font-medium capitalize', 'bg-gray-100 shadow-sm', statusStyles?.text)}>
                    {displayStatus.toLowerCase()}
                  </article>
                </article>
              </article>
            </section>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredRooms?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-2 text-gray-400">
            <Search className="mx-auto h-12 w-12 opacity-50" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-black">No rooms found</h3>
          <p className="mb-4 text-gray-500">Try adjusting your search or filters</p>
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

const RoomsHotel = memo(MemoRoomsHotel);
export default RoomsHotel;
