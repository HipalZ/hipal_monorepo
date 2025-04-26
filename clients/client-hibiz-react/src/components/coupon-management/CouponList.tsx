import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { Coupon, CouponCreatePayload, CouponUpdatePayload } from '@/hooks/useBusinessCoupons';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Plus, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton';

// Import smaller components
import CouponCard from './CouponCard';
import CouponDetailsModal from './CouponDetailsModal.tsx';
import CouponFilterControls from './CouponFilterControls';
import CouponFormModal from './CouponFormModal';
import EmptyCouponState from './EmptyCouponState';

type CouponListProps = {
  coupons: Coupon[];
  businessId: string;
  isLoading: boolean;
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>;
  onUpdateCoupon: (couponId: string, payload: CouponUpdatePayload) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
};

// Add a helper function to count active filters
const countActiveFilters = (searchTerm: string, filterType: string, filterHasAllocations: string) => {
  let count = 0;

  // Count search term if not empty
  if (searchTerm.trim() !== '') {
    count += 1;
  }

  // Count filter type if not "all"
  if (filterType !== 'all') {
    count += 1;
  }

  // Count allocation filter if not "all"
  if (filterHasAllocations !== 'all') {
    count += 1;
  }

  return count;
};
interface CouponFilterControlsProps {
  searchTerm: string;
  filterType: 'all' | 'percentage' | 'amount';
  filterHasAllocations: 'all' | 'yes' | 'no';
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterTypeChange: (value: string) => void;
  onAllocationFilterChange: (value: string) => void;
}

// Add a component to display active filters
const ActiveFilters = ({
  searchTerm,
  filterType,
  filterHasAllocations,
  onSearchChange,
  onFilterTypeChange,
  onAllocationFilterChange,
}: CouponFilterControlsProps) => {
  const hasActiveFilters = searchTerm.trim() !== '' || filterType !== 'all' || filterHasAllocations !== 'all';

  const handleClearAll = useCallback(() => {
    onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    onFilterTypeChange('all');
    onAllocationFilterChange('all');
  }, []);

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-nowrap gap-2 !text-nowrap px-2 pt-2 lg:px-0 overflow-auto hide-scrollbar">
      {/* Search filter */}
      {searchTerm.trim() !== '' && (
        <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <span>Search: {searchTerm}</span>
          <button
            type="button"
            onClick={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            className="hover:bg-primary/20 ml-1 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Type filter */}
      {filterType !== 'all' && (
        <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <span>{filterType === 'percentage' ? 'Percentage' : 'Fixed Amount'}</span>
          <button type="button" onClick={() => onFilterTypeChange('all')} className="hover:bg-primary/20 ml-1 rounded-full p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Allocation filter */}
      {filterHasAllocations !== 'all' && (
        <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <span>{filterHasAllocations === 'yes' ? 'Allocated' : 'Unallocated'}</span>
          <button type="button" onClick={() => onAllocationFilterChange('all')} className="hover:bg-primary/20 ml-1 rounded-full p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clear all button */}
      <Button type="button" onClick={handleClearAll} variant="outline" size="sm">
        Clear all
        <X />
      </Button>
    </div>
  );
};

const CouponList = ({ coupons, businessId, isLoading, onCreateCoupon, onUpdateCoupon, isCreating, isUpdating }: CouponListProps) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'amount'>('all');
  const [filterHasAllocations, setFilterHasAllocations] = useState<'all' | 'yes' | 'no'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Hooks
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Memoized callbacks
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterTypeChange = useCallback((value: string) => {
    setFilterType(value as 'all' | 'percentage' | 'amount');
  }, []);

  const handleAllocationFilterChange = useCallback((value: string) => {
    setFilterHasAllocations(value as 'all' | 'yes' | 'no');
  }, []);

  const handleCreateCoupon = useCallback(
    async (formData: CouponCreatePayload) => {
      await onCreateCoupon(formData);
      setIsCreateModalOpen(false);
    },
    [onCreateCoupon],
  );

  const handleEditCoupon = useCallback(
    async (couponId: string, formData: CouponUpdatePayload) => {
      if (editingCoupon) {
        await onUpdateCoupon(couponId, formData);
        setEditingCoupon(null);
      }
    },
    [editingCoupon, onUpdateCoupon],
  );

  const startEditingCoupon = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
  }, []);

  const viewCouponDetails = useCallback((coupon: Coupon) => {
    setDetailCoupon(coupon);
  }, []);

  const toggleFilter = useCallback(() => {
    setIsFilterCollapsed((prev) => !prev);
  }, []);

  // Memoized filtered coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'percentage' && coupon.config.discountType === 'PERCENTAGE') ||
      (filterType === 'amount' && coupon.config.discountType === 'AMOUNT');

    // Check if coupon has allocations
    const hasAllocations = coupon.isActive; // Replace with actual allocation check
    const matchesAllocation =
      filterHasAllocations === 'all' || (filterHasAllocations === 'yes' && hasAllocations) || (filterHasAllocations === 'no' && !hasAllocations);

    return matchesSearch && matchesType && matchesAllocation;
  });

  // Check if any filters are applied
  const hasFilters = searchTerm !== '' || filterType !== 'all' || filterHasAllocations !== 'all';

  return (
    <div className="space-y-6">
      {/* Filters - Desktop with collapsible functionality */}
      <div className="hidden sm:block">
        <div className="sticky top-[4.8rem] z-50 mb-4 rounded-2xl bg-[#00000010] p-2 backdrop-blur-xl">
          <Card className="overflow-hidden shadow-sm">
            <div
              onKeyDown={toggleFilter}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center justify-between bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              onClick={toggleFilter}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={16} className="text-primary" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-800">Filter Coupons</h3>
                  {countActiveFilters(searchTerm, filterType, filterHasAllocations) > 0 && (
                    <span className="bg-primary rounded-full px-2 py-0.5 text-xs text-white">
                      {countActiveFilters(searchTerm, filterType, filterHasAllocations)}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <motion.div animate={{ rotate: isFilterCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {!isFilterCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="border-t border-gray-100 px-4 pb-4">
                    <CouponFilterControls
                      searchTerm={searchTerm}
                      filterType={filterType}
                      filterHasAllocations={filterHasAllocations}
                      onSearchChange={handleSearchChange}
                      onFilterTypeChange={handleFilterTypeChange}
                      onAllocationFilterChange={handleAllocationFilterChange}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show active filters when collapsed */}
            {isFilterCollapsed && countActiveFilters(searchTerm, filterType, filterHasAllocations) > 0 && (
              <div className="border-t border-gray-100 px-4 py-2">
                <ActiveFilters
                  searchTerm={searchTerm}
                  filterType={filterType}
                  filterHasAllocations={filterHasAllocations}
                  onSearchChange={handleSearchChange}
                  onFilterTypeChange={handleFilterTypeChange}
                  onAllocationFilterChange={handleAllocationFilterChange}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Filters - Mobile */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-40 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative">
                <Button size="icon" className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full shadow-lg">
                  <Filter size={20} />
                </Button>
                {countActiveFilters(searchTerm, filterType, filterHasAllocations) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {countActiveFilters(searchTerm, filterType, filterHasAllocations)}
                  </span>
                )}
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh] rounded-t-xl pt-4">
              <div className="flex h-full flex-col">
                <div className="px-1 pb-2 text-sm font-medium">Filter Coupons</div>
                <div className="-mr-4 flex-1 pb-16 pr-4">
                  <CouponFilterControls
                    searchTerm={searchTerm}
                    filterType={filterType}
                    filterHasAllocations={filterHasAllocations}
                    onSearchChange={handleSearchChange}
                    onFilterTypeChange={handleFilterTypeChange}
                    onAllocationFilterChange={handleAllocationFilterChange}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile active filters indicator */}
          {countActiveFilters(searchTerm, filterType, filterHasAllocations) > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom fixed bottom-[4.5rem] left-4 right-4 z-30 w-[80%] rounded-lg bg-white p-2 shadow-lg duration-300">
              <ActiveFilters
                searchTerm={searchTerm}
                filterType={filterType}
                filterHasAllocations={filterHasAllocations}
                onSearchChange={handleSearchChange}
                onFilterTypeChange={handleFilterTypeChange}
                onAllocationFilterChange={handleAllocationFilterChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Coupon list */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <EmptyCouponState hasFilters={hasFilters} onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {filteredCoupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CouponCard coupon={coupon} onEdit={startEditingCoupon} onView={viewCouponDetails} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit coupon modal */}
      <CouponFormModal
        isOpen={isCreateModalOpen || !!editingCoupon}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCoupon(null);
        }}
        onSubmit={(data) => {
          if (editingCoupon) {
            // For edit mode, we need the coupon ID
            return handleEditCoupon(editingCoupon._id, data);
          } else {
            // For create mode
            return handleCreateCoupon(data);
          }
        }}
        isSubmitting={editingCoupon ? isUpdating : isCreating}
        editingCoupon={editingCoupon}
        mode={editingCoupon ? 'edit' : 'create'}
      />

      {/* Coupon detail modal */}
      <CouponDetailsModal coupon={detailCoupon} onClose={() => setDetailCoupon(null)} onEdit={startEditingCoupon} />

      {/* Mobile create button - using AdvancedBottomButton */}
      {!isCreateModalOpen && !editingCoupon && !detailCoupon && (
        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: 'Create New Coupon',
              onClick: () => setIsCreateModalOpen(true),
              disable: isCreating || isUpdating,
              className: 'w-full rounded-md',
              icon: <Plus size={16} />,
            },
          ]}
        />
      )}
    </div>
  );
};

export default memo(CouponList);
