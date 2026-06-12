import NoData from '@/assets/nodata.jpg';
import BottomButton from '@/components/atom/bottomButton';
import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton.tsx';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import useHiPeopleStore from '@/components/store/useHipeopleStore';
import { usePeopleFiltersStore } from '@/components/store/useUserFilter.ts';
import type { ICustomerRecord } from '@/components/types/businessData';
import { Button } from '@/components/ui/button';
import { useUploadCustomers } from '@/hooks/useHipeople';
import { type FilterUserAnalyticsPayload, useFilterUserAnalytics, useGetAllTodayPeople } from '@/hooks/usePeopleData';
import { apiRpc } from '@hi/common';
import { CalendarDays, CloudDownload, Filter, Phone, Star } from 'lucide-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaMoneyBills } from 'react-icons/fa6';
import { MdArrowOutward } from 'react-icons/md';
import { SlLocationPin } from 'react-icons/sl';
import { Link } from 'react-router-dom';
import useBusinessData from '../../store/useBusinessData';
import { FiltersPanel } from './UserFilterPanel';
import BulkUpload from './bulkUpload';
import PopupBulkUpload from './popupBulkUpload';

type UploadPreview = { name: string; phone: string; dob?: number };

const THREE_MONTH_EXPORT_WINDOW_MS = 92 * 24 * 60 * 60 * 1000;
const FILTER_PAGE_SIZE = 5000;

const getCsvDateRangeError = (dateFrom?: number, dateTo?: number) => {
  if (!Number.isFinite(Number(dateFrom)) || !Number.isFinite(Number(dateTo))) {
    return 'Please apply date filters in 3-month batches for faster downloads.';
  }

  if (Number(dateFrom) > Number(dateTo)) {
    return 'From date should be before To date.';
  }

  if (Number(dateTo) - Number(dateFrom) > THREE_MONTH_EXPORT_WINDOW_MS) {
    return 'Please apply date filters in 3-month batches for faster downloads.';
  }

  return null;
};

const mapCustomersData = (data: any[]): ICustomerRecord[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const u = item.userId || {};
    return {
      _id: item._id,
      businessId: item.businessId,
      userId: {
        _id: u._id,
        name: u.name || 'N/A',
        phone: u.phone || 'N/A',
        email: u.email || '',
        nickName: u?.customRole?.[0]?.nickName || '',
      },
      visitCount: item.visitCount || 0,
      totalSpend: item.totalSpend || 0,
      avgSpend: item.avgSpend || 0,
      coinzIssued: item.coinzIssued || 0,
      coinzUsed: item.coinzUsed || 0,
      currentCoins: item.currentCoins || 0,
      couponCount: item.couponCount || 0,
      dateOfJoining: item.dateOfJoining ? Number(item.dateOfJoining) : 0,
    } as unknown as ICustomerRecord;
  });
};

const getInitials = (name?: string) => {
  if (!name || name === 'N/A') return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const maskPhone = (phone?: string) => {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length < 4) return 'Phone not available';
  return `${cleanPhone.slice(0, 2)}******${cleanPhone.slice(-2)}`;
};

const formatJoiningDate = (dateOfJoining?: number) => {
  if (!dateOfJoining || dateOfJoining <= 0) return 'Date not available';
  return new Date(dateOfJoining).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
};

const MemoUsersList = ({ hide }: { hide?: boolean }) => {
  const toggleUserSelection = useHiPeopleStore((s) => s.toggleUserSelection);
  const selectAllUsers = useHiPeopleStore((s) => s.selectAllUsers);
  const clearAllUsers = useHiPeopleStore((s) => s.clearAllUsers);
  const selectedUserIds = useHiPeopleStore((s) => s.selectedUserIds);
  const setAddGroupPage = useHiPeopleStore((s) => s.setAddGroupPage);
  const setAddGroupModal = useHiPeopleStore((s) => s.setAddGroupModal);
  const setFetchGroupData = useHiPeopleStore((s) => s.setFetchGroupData);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filteredApiData, setFilteredApiData] = useState<ICustomerRecord[] | null>(null);
  const [filterPage, setFilterPage] = useState(1);
  const [filterTotalCount, setFilterTotalCount] = useState(0);
  const [filterLoadingPage, setFilterLoadingPage] = useState(false);

  const clearFilters = usePeopleFiltersStore((s) => s.clearFilters);
  const filters = usePeopleFiltersStore((s) => s.filters);

  const { isPending } = useUploadCustomers();
  const { filterUserAnalytics } = useFilterUserAnalytics();
  const { isLoading, todayPeopleData: rawTodayPeopleData } = useGetAllTodayPeople();

  const todayPeopleData = useMemo(() => mapCustomersData(rawTodayPeopleData || []), [rawTodayPeopleData]);
  const activeData = filteredApiData ?? todayPeopleData;
  const hasFilteredData = filteredApiData !== null;
  const filterTotalPages = Math.max(1, Math.ceil(filterTotalCount / FILTER_PAGE_SIZE));

  const filterActive = useMemo(
    () =>
      (filters.search && filters.search.trim() !== '') ||
      filters.spendMin !== undefined ||
      filters.spendMax !== undefined ||
      filters.totalSpendMin !== undefined ||
      filters.totalSpendMax !== undefined ||
      filters.visitsMin !== undefined ||
      filters.visitsMax !== undefined ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined,
    [filters],
  );

  const openGroup = useCallback(() => {
    setAddGroupModal(true);
    setFetchGroupData(true);
    setAddGroupPage('ADD TO GROUP');
  }, [setAddGroupModal, setFetchGroupData, setAddGroupPage]);

  const allSelected = selectedUserIds.length === activeData?.length;
  const hasSelection = selectedUserIds.length > 0;

  const alphabetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSelectUser = useCallback((id: string) => toggleUserSelection(id), [toggleUserSelection]);

  const handleSelectAll = useCallback(() => {
    if (allSelected) clearAllUsers();
    else selectAllUsers(activeData?.map((u) => u?.userId?._id));
  }, [allSelected, activeData, selectAllUsers, clearAllUsers]);

  const groupedData = useMemo(() => {
    const groups: Record<string, ICustomerRecord[]> = {};
    for (const user of activeData || []) {
      const letter = user?.userId?.name?.[0]?.toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(user);
    }
    return groups;
  }, [activeData]);

  const alphabet = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((L) => groupedData[L]?.length), [groupedData]);

  const scrollToLetter = (letter: string) => {
    const el = alphabetRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Only include params that hold a real value — sending NaN/undefined
  // dates previously crashed the filter. Visits/spend-only filters are
  // valid on their own (server searches the full customer base).
  const buildFilterPayload = useCallback((): FilterUserAnalyticsPayload => {
    const payload: FilterUserAnalyticsPayload = { businessId: businessId ?? '' };
    if (filters.search?.trim()) payload.search = filters.search.trim();
    if (filters.spendMin !== undefined) payload.spendMin = String(filters.spendMin);
    if (filters.spendMax !== undefined) payload.spendMax = String(filters.spendMax);
    if (filters.totalSpendMin !== undefined) payload.totalSpendMin = String(filters.totalSpendMin);
    if (filters.totalSpendMax !== undefined) payload.totalSpendMax = String(filters.totalSpendMax);
    if (filters.visitsMin !== undefined) payload.visitsMin = String(filters.visitsMin);
    if (filters.visitsMax !== undefined) payload.visitsMax = String(filters.visitsMax);
    const dateFrom = Number(filters.dateFrom);
    const dateTo = Number(filters.dateTo);
    if (Number.isFinite(dateFrom)) payload.dateFrom = String(dateFrom);
    if (Number.isFinite(dateTo)) payload.dateTo = String(dateTo);
    return payload;
  }, [businessId, filters]);

  const loadFilteredPage = useCallback(
    async (page: number) => {
      const result = await filterUserAnalytics({
        ...buildFilterPayload(),
        pageNumber: String(page),
      });
      setFilteredApiData(mapCustomersData(result.data));
      setFilterTotalCount(result.totalCount);
      setFilterPage(page);
      clearAllUsers();
      return result;
    },
    [buildFilterPayload, clearAllUsers, filterUserAnalytics],
  );

  // Server-side export — downloads the COMPLETE result (no 5000 cap).
  // With filters active it exports exactly the filtered set; otherwise
  // it exports the full customer base.
  const downloadSubscribers = useCallback(async () => {
    if (!businessId) {
      toast.error('Business not loaded yet — please retry');
      return;
    }
    const toastId = toast.loading('Preparing your download…');
    const dateRangeError = getCsvDateRangeError(filters.dateFrom, filters.dateTo);
    if (dateRangeError) {
      toast.error(dateRangeError, { id: toastId });
      setFilterModalOpen(true);
      return;
    }

    try {
      const query = buildFilterPayload();

      const response = await apiRpc.payments.users.Analytics.download_csv.$get({ query });
      if (!response.ok) throw new Error('Download failed — please try again');

      const exportCount = response.headers.get('X-Export-Count');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        exportCount
          ? `Downloaded ${Number(exportCount).toLocaleString('en-IN')} customers`
          : filterActive
            ? 'Filtered customers downloaded'
            : 'All customers downloaded',
        { id: toastId },
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Download failed', { id: toastId });
    }
  }, [businessId, buildFilterPayload, filterActive, filters.dateFrom, filters.dateTo]);

  const bottomButtons = useMemo(() => {
    const downloadBtn = {
      id: 'download',
      text: hasSelection ? '' : 'Download',
      icon: <CloudDownload />,
      onClick: downloadSubscribers,
      type: 'button' as const,
      disable: activeData.length === 0,
    };
    const filterBtn = {
      id: 'filter',
      text: hasSelection ? '' : 'Filter',
      icon: <Filter />,
      onClick: () => setFilterModalOpen(true),
      type: 'button' as const,
    };
    const addBtn = hasSelection ? [{ id: 'add-group', text: 'Add to group', onClick: openGroup, type: 'button' as const }] : [];
    return [downloadBtn, filterBtn, ...addBtn];
  }, [hasSelection, activeData.length, openGroup, downloadSubscribers]);

  const bottomBarKey = hasSelection ? 'with-add' : 'no-add';

  const onApplyFilters = async () => {
    let loadingToastId: string | undefined;
    try {
      if (filters.dateFrom !== undefined || filters.dateTo !== undefined) {
        const dateFrom = filters.dateFrom ?? 0;
        const dateTo = filters.dateTo ?? Date.now();
        if (dateFrom > dateTo) {
          toast.error('From date should be before To date.');
          return;
        }
      }

      const toastId = toast.loading('Loading customers...');
      loadingToastId = toastId;
      const first = await loadFilteredPage(1);
      setFilterModalOpen(false);
      toast.success(
        `Showing ${first.data.length.toLocaleString('en-IN')} of ${first.totalCount.toLocaleString('en-IN')} customers. Download exports the full selected range.`,
        { id: toastId },
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to apply filters',
        loadingToastId ? { id: loadingToastId } : undefined,
      );
    }
  };

  const onClearFilters = () => {
    clearFilters();
    setFilteredApiData(null);
    setFilterPage(1);
    setFilterTotalCount(0);
    clearAllUsers();
  };

  const goToFilterPage = async (page: number) => {
    if (page < 1 || page > filterTotalPages || filterLoadingPage) return;
    setFilterLoadingPage(true);
    try {
      await loadFilteredPage(page);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setFilterLoadingPage(false);
    }
  };

  if (isLoading || isPending) return <LoadingSpinner />;

  return (
    <>
      <main className="relative grid grid-cols-[1fr_auto] gap-4">
        <div className="flex-1">
          <BulkUpload setShowConfirmPopup={setShowConfirmPopup} setUploadPreview={setUploadPreview} />

          <section className="mb-4 ml-4 flex items-center justify-between">
            <article>
              <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="mr-2 rounded-md text-black" />
              <span className="text-[#6F649B]">Select {selectedUserIds.length}</span>
            </article>
            <article className="inline-flex gap-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="relative" onClick={() => setFilterModalOpen(true)}>
                  <Filter className="mr-1 h-4 w-4" />
                  Filters
                  {filterActive && <span className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full bg-red-600" />}
                </Button>
                {filterActive && (
                  <Button variant="outline" onClick={onClearFilters}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </article>
          </section>

          <div className="pl-4">
            {alphabet.length > 0 ? (
              alphabet.map((letter) => (
                <div key={letter} ref={(el) => (alphabetRefs.current[letter] = el)} className="mb-6">
                  <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 bg-white/95 py-2 backdrop-blur">
                    <h3 className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{letter}</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {groupedData[letter].length} {groupedData[letter].length === 1 ? 'customer' : 'customers'}
                    </span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedData[letter].map((user) => {
                      const visits = user?.visitCount ?? 0;
                      const isRegular = visits >= 5;
                      const isNew =
                        user?.dateOfJoining > 0 && Date.now() - user.dateOfJoining < 30 * 24 * 60 * 60 * 1000 && visits <= 1;
                      return (
                        <article
                          key={user._id}
                          className="group relative w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                        >
                          <section className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user?.userId?._id)}
                              onChange={() => handleSelectUser(user?.userId?._id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 accent-gray-950"
                            />
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-xs font-semibold text-white shadow-sm">
                              {getInitials(user?.userId?.name)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="flex items-center gap-2 truncate text-base font-semibold text-gray-950">
                                <span className="truncate">{user?.userId?.name}</span>
                                {isRegular && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                                    Regular
                                  </span>
                                )}
                                {isNew && (
                                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">New</span>
                                )}
                              </h3>
                              <div className="mt-2 grid gap-1.5 text-xs text-gray-600">
                                <span className="flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="font-medium text-gray-800">{maskPhone(user?.userId?.phone)}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                                  First seen {formatJoiningDate(user?.dateOfJoining)}
                                </span>
                              </div>
                            </div>
                          </section>
                          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs">
                            <span className="rounded-xl bg-gray-50 px-3 py-2 text-gray-600">
                              <span className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                                <SlLocationPin />
                                Visits
                              </span>
                              <span className="text-sm font-semibold text-gray-950">
                                {visits} {visits === 1 ? 'visit' : 'visits'}
                              </span>
                            </span>
                            {(user?.totalSpend ?? 0) > 0 && (
                              <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                                <span className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-emerald-500">
                                  <FaMoneyBills />
                                  Spend
                                </span>
                                <span className="text-sm font-semibold text-emerald-900 tabular-nums">Rs. {(user?.totalSpend ?? 0).toLocaleString('en-IN')}</span>
                              </span>
                            )}
                            {(user?.currentCoins ?? 0) > 0 && (
                              <span className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                                <span className="mb-1 block text-[11px] uppercase tracking-wide text-amber-500">Coinz</span>
                                <span className="text-sm font-semibold text-amber-900 tabular-nums">{user.currentCoins}</span>
                              </span>
                            )}
                          </div>
                          {!hide && (
                            <Link
                              to={`/app/business/${user?.businessId}/people/${user?.userId?._id}`}
                              className="absolute right-3 top-3 rounded-full bg-gray-50 p-1.5 text-gray-400 transition-colors hover:bg-gray-950 hover:text-white"
                              aria-label={`Open ${user?.userId?.name || 'customer'} profile`}
                            >
                              <MdArrowOutward size={18} />
                            </Link>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-[50dvh] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8 text-center">
                <div className="relative mt-8">
                  <img src={NoData} alt="No Data Found" className="mx-auto h-auto w-1/2 max-w-sm drop-shadow-lg" />
                </div>

                <h3 className="mb-2 mt-6 text-xl font-bold text-gray-800">{filterActive ? 'No matches yet' : 'No clients today'}</h3>

                <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
                  {filterActive
                    ? "Let's tweak those filters. Try broadening the date range, spend thresholds, or visit counts to uncover more insights."
                    : 'Kick things off by uploading your client list or explore historical data with filters for spending trends and more.'}
                </p>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 text-white shadow-lg hover:from-purple-700 hover:to-blue-700"
                    onClick={() => setFilterModalOpen(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {filterActive ? 'Adjust Filters' : 'Explore with Filters'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {hasFilteredData && filterTotalCount > FILTER_PAGE_SIZE && (
            <div className="mx-4 mt-4 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing page {filterPage} of {filterTotalPages} · {filterTotalCount.toLocaleString('en-IN')} customers
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filterPage <= 1 || filterLoadingPage}
                  onClick={() => goToFilterPage(filterPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filterPage >= filterTotalPages || filterLoadingPage}
                  onClick={() => goToFilterPage(filterPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {hide && selectedUserIds.length ? (
            <BottomButton buttons={[{ text: 'Save', onClick: () => setAddGroupPage('CREATE GROUP'), type: 'button' }]} />
          ) : null}
        </div>

        <aside className="sticky top-[20dvh] self-start pr-2">
          <div className="flex flex-col space-y-1">
            {alphabet.map((letter) => (
              <button type="button" key={letter} onClick={() => scrollToLetter(letter)} className="text-xs text-gray-600 hover:text-purple-600">
                {letter}
              </button>
            ))}
          </div>
        </aside>

        {filterModalOpen && (
          <PopUp show={filterModalOpen} onClose={() => setFilterModalOpen(false)} rightTopBack width="w-full max-w-md" height="h-[90dvh]" hide>
            <div className="h-full overflow-y-auto p-4">
              <FiltersPanel />
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="w-1/2" onClick={() => setFilterModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={onApplyFilters} className="w-1/2">
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopUp>
        )}

        <AdvancedBottomButton key={bottomBarKey} fixed maxWidth="30rem" position="mid" buttons={bottomButtons} />
      </main>

      {showConfirmPopup && (
        <PopupBulkUpload showConfirmPopup={showConfirmPopup} setShowConfirmPopup={setShowConfirmPopup} uploadPreview={uploadPreview} />
      )}
    </>
  );
};

const UsersList = memo(MemoUsersList);
export default UsersList;
