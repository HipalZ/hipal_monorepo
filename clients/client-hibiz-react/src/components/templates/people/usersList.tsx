import NoData from '@/assets/nodata.jpg';
import BottomButton from '@/components/atom/bottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useHiPeopleStore from '@/components/store/useHipeopleStore';
import type { ICustomerRecord } from '@/components/types/businessData';
import { useGetAllPeoples } from '@/hooks/usePeopleData';
import { CloudDownload, Filter } from 'lucide-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FaMoneyBills } from 'react-icons/fa6';
import { MdArrowOutward } from 'react-icons/md';
import { SlLocationPin } from 'react-icons/sl';
import { Link } from 'react-router-dom';

import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton.tsx';
import PopUp from '@/components/atom/popUp';
import { usePeopleFiltersStore } from '@/components/store/useUserFilter.ts';
import { Button } from '@/components/ui/button';
import { useUploadCustomers } from '@/hooks/useHipeople';
import { cn } from '@/lib/utils.ts';
import { FiltersPanel } from './UserFilterPanel';
import BulkUpload from './bulkUpload';
import PopupBulkUpload from './popupBulkUpload';

type UploadPreview = {
  name: string;
  phone: string;
  dob?: number;
};

const MemoUsersList = ({ hide }: { hide?: boolean }) => {
  const toggleUserSelection = useHiPeopleStore((s) => s.toggleUserSelection);
  const { isPending } = useUploadCustomers();
  const selectAllUsers = useHiPeopleStore((s) => s.selectAllUsers);
  const clearAllUsers = useHiPeopleStore((s) => s.clearAllUsers);
  const selectedUserIds = useHiPeopleStore((s) => s.selectedUserIds);
  const setAddGroupPage = useHiPeopleStore((s) => s.setAddGroupPage);
  const setAddGroupModal = useHiPeopleStore((s) => s.setAddGroupModal);
  const setFetchGroupData = useHiPeopleStore((s) => s.setFetchGroupData);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview[]>([]);

  const clearFilters = usePeopleFiltersStore((s) => s.clearFilters);
  const filters = usePeopleFiltersStore((s) => s.filters);

  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { isLoading, peopleData } = useGetAllPeoples();

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

  const allSelected = selectedUserIds.length === peopleData?.length;
  const hasSelection = selectedUserIds.length > 0;

  const alphabetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSelectUser = useCallback(
    (id: string) => {
      toggleUserSelection(id);
    },
    [toggleUserSelection],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clearAllUsers();
    } else {
      selectAllUsers(peopleData?.map((u) => u?.userId?._id));
    }
  }, [allSelected, peopleData, selectAllUsers, clearAllUsers]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!peopleData) return [];
    return peopleData.filter((user) => {
      const { userId, visitCount, avgSpend, totalSpend, dateOfJoining } = user;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!userId?.name?.toLowerCase().includes(term) && !userId?.phone?.includes(term)) return false;
      }
      if (filters.spendMin && avgSpend < filters.spendMin) return false;
      if (filters.spendMax && avgSpend > filters.spendMax) return false;
      if (filters.totalSpendMin && totalSpend < filters.totalSpendMin) return false;
      if (filters.totalSpendMax && totalSpend > filters.totalSpendMax) return false;
      if (filters.visitsMin && visitCount < filters.visitsMin) return false;
      if (filters.visitsMax && visitCount > filters.visitsMax) return false;
      if (filters.dateFrom && dateOfJoining < filters.dateFrom) return false;
      if (filters.dateTo && dateOfJoining > filters.dateTo) return false;
      return true;
    });
  }, [peopleData, filters]);

  const downloadSubscribers = () => {
    if (!filteredData || filteredData.length === 0) return;
    const csvData = filteredData.map((user) => {
      const dobRaw = user?.userId?.dob;
      let dobFormatted = '0';
      if (dobRaw) {
        const date = new Date(dobRaw);
        if (!Number.isNaN(date.getTime())) dobFormatted = date.toLocaleDateString();
      }
      return {
        name: user?.userId?.name || 'N/A',
        phone: user?.userId?.phone || 'N/A',
        dob: dobFormatted,
      };
    });
    const csvRows = [['Name', 'Phone', 'DOB'], ...csvData.map((row) => [row.name, row.phone, row.dob])].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group by alphabet
  const groupedData = useMemo(() => {
    const groups: Record<string, ICustomerRecord[]> = {};
    for (const user of filteredData) {
      const letter = user?.userId?.name?.[0]?.toUpperCase() || '#';
      groups[letter] = groups[letter] || [];
      groups[letter].push(user);
    }
    return groups;
  }, [filteredData]);

  const alphabet = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((L) => groupedData[L] && groupedData[L].length > 0), [groupedData]);

  const scrollToLetter = (letter: string) => {
    const el = alphabetRefs.current[letter];
    if (el) {
      el.style.scrollMarginTop = '200px';
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ************ FIX: Memoized, non-mutating, with remount key ************
  const bottomButtons = useMemo(() => {
    const downloadBtn = {
      id: 'download',
      text: hasSelection ? '' : 'Download',
      icon: <CloudDownload />,
      onClick: downloadSubscribers,
      type: 'button' as const,
      disable: filteredData.length === 0,
      className: cn(hasSelection && '!flex-none pl-6 pr-5'),
    };
    const filterBtn = {
      id: 'filter',
      text: hasSelection ? '' : 'Filter',
      icon: <Filter />,
      onClick: () => setFilterModalOpen(true),
      type: 'button' as const,
      className: cn(hasSelection && '!bg-purple-600 !flex-none pl-6 pr-5'),
    };
    const addBtn = hasSelection
      ? [
          {
            id: 'add-group',
            text: 'Add to group',
            onClick: openGroup,
            type: 'button' as const,
            className: '!bg-blue-600 px-4 !w-[5rem]',
          },
        ]
      : [];

    // return a brand-new array every time (no push / mutation)
    return [downloadBtn, filterBtn, ...addBtn];
  }, [hasSelection, filteredData.length, downloadSubscribers, openGroup]);

  // When switching 2↔3 buttons, re-mount the bar to avoid any internal accumulation
  const bottomBarKey = hasSelection ? 'with-add' : 'no-add';

  return (
    <>
      {isLoading || isPending ? (
        <LoadingSpinner />
      ) : (
        <main className="relative grid grid-cols-[1fr_auto] gap-4">
          {/* LEFT: Main Content */}
          <div className="flex-1">
            {/* Card for sample template download and upload */}
            <BulkUpload setShowConfirmPopup={setShowConfirmPopup} setUploadPreview={setUploadPreview} />

            {/* Top bar */}
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
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </article>
            </section>

            {/* People list grouped by alphabet */}
            <div className="pl-4">
              {alphabet.length > 0 ? (
                alphabet.map((letter) => (
                  <div key={letter} ref={(el) => (alphabetRefs.current[letter] = el)} className="mb-6" style={{ scrollMarginTop: '200px' }}>
                    <h3 className="sticky top-0 bg-white py-1 text-lg font-bold">{letter}</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      {groupedData[letter].map((user) => (
                        <article key={user._id} className="relative flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-lg">
                          <section className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user?.userId?._id)}
                              onChange={() => handleSelectUser(user?.userId?._id)}
                              className="mr-3 h-5 w-5 rounded text-black"
                            />
                            <div>
                              <h3 className="line-clamp-2 font-semibold">{user?.userId?.name}</h3>
                              <p>
                                {user?.userId?.phone?.slice(0, 2)}******
                                {user?.userId?.phone?.slice(-2)}
                              </p>
                            </div>
                          </section>
                          <div className="flex items-center gap-2 text-[#6F649B]">
                            <SlLocationPin />
                            {user?.visitCount} visits
                            <FaMoneyBills />
                            {user?.avgSpend}
                          </div>
                          {!hide && (
                            <Link to={`/app/business/${user?.businessId}/people/${user?.userId?._id}`} className="absolute right-1 top-1">
                              <MdArrowOutward size={24} />
                            </Link>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-[70dvh] flex-col items-center justify-center">
                  <img src={NoData} alt="No Data Found" className="h-auto w-1/2" />
                  <h3 className="mt-4 text-[#6F649B]">No Data Found</h3>
                </div>
              )}
            </div>

            {hide && selectedUserIds.length ? (
              <BottomButton
                buttons={[
                  {
                    text: 'Save',
                    onClick: () => setAddGroupPage('CREATE GROUP'),
                    type: 'button',
                  },
                ]}
              />
            ) : null}
          </div>

          {/* RIGHT: Sticky alphabet nav */}
          <aside className="sticky top-[20dvh] self-start pr-2">
            <div className="flex flex-col space-y-1">
              {alphabet.map((letter) => (
                <button type="button" key={letter} onClick={() => scrollToLetter(letter)} className="text-xs text-gray-600 hover:text-purple-600">
                  {letter}
                </button>
              ))}
            </div>
          </aside>

          {/* Filters modal */}
          {filterModalOpen && (
            <PopUp
              show={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              rightTopBack
              width="w-full max-w-md"
              height="h-[100dvh] lg:h-[90dvh]"
              hide
            >
              <div className="h-full overflow-y-auto p-4">
                <FiltersPanel />
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="w-1/2" onClick={() => setFilterModalOpen(false)}>
                    Clear
                  </Button>
                  <Button className="w-1/2" onClick={() => setFilterModalOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopUp>
          )}

          <AdvancedBottomButton key={bottomBarKey} fixed={true} maxWidth="30rem" position="mid" buttons={bottomButtons} />
        </main>
      )}
      {showConfirmPopup && (
        <PopupBulkUpload showConfirmPopup={showConfirmPopup} setShowConfirmPopup={setShowConfirmPopup} uploadPreview={uploadPreview} />
      )}
    </>
  );
};

const UsersList = memo(MemoUsersList);
export default UsersList;
