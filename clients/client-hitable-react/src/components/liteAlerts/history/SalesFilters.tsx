import CommonBottomButton from '@/components/atoms/bottomButton';
import { useAllModes } from '@/components/hooks/useTableData';
import { useSalesStore } from '@/components/store/useSalesStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

const SalesFilters = () => {
  const selectedPaymentModes = useSalesStore((s) => s.selectedPaymentModes);
  const selectedDiscountTypes = useSalesStore((s) => s.selectedDiscountTypes);
  const selectedWarnings = useSalesStore((s) => s.selectedWarnings);
  const setSelectedPaymentModes = useSalesStore((s) => s.setSelectedPaymentModes);
  const setSelectedDiscountTypes = useSalesStore((s) => s.setSelectedDiscountTypes);
  const setSelectedWarnings = useSalesStore((s) => s.setSelectedWarnings);
  const setOpenFilterModal = useSalesStore((s) => s.setOpenFilterModal);
  const setSelectedFilters = useSalesStore((s) => s.setSelectedFilters);
  const selectedFilters = useSalesStore((s) => s.selectedFilters);

  const { data: modesData } = useAllModes();

  const toggleSelection = useCallback((value: string, selected: string[], setSelected: (selected: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  }, []);

  const appliedFilters = useMemo(() => {
    const filters: { key: string; value: string[] }[] = [];

    if (selectedPaymentModes.length > 0) {
      filters.push({ key: 'mode', value: selectedPaymentModes });
    }
    if (selectedDiscountTypes.length > 0) {
      filters.push({ key: 'type', value: selectedDiscountTypes });
    }
    if (selectedWarnings.length > 0) {
      filters.push({ key: 'warnings', value: selectedWarnings });
    }
    return filters;
  }, [selectedPaymentModes, selectedDiscountTypes, selectedWarnings]);

  useEffect(() => {
    setSelectedPaymentModes(selectedFilters.find((f) => f.key === 'mode')?.value || []);
    setSelectedDiscountTypes(selectedFilters.find((f) => f.key === 'type')?.value || []);
    setSelectedWarnings(selectedFilters.find((f) => f.key === 'warnings')?.value || []);
  }, [selectedFilters, setSelectedPaymentModes, setSelectedDiscountTypes, setSelectedWarnings]);

  const handleApplyFilters = () => {
    if (appliedFilters.length === 0) {
      return toast.error('Please select at least one filter');
    }
    setSelectedFilters(appliedFilters);
    setOpenFilterModal(false);
  };

  const handleClearAll = () => {
    setSelectedPaymentModes([]);
    setSelectedDiscountTypes([]);
    setSelectedWarnings([]);
    setSelectedFilters([]);
  };

  const isOfflineSelected = useMemo(() => {
    if (!modesData) return false;
    return modesData.some((mode) => selectedPaymentModes.includes(mode.name));
  }, [modesData, selectedPaymentModes]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Payment Mode</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPaymentModes.includes('online') ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => toggleSelection('online', selectedPaymentModes, setSelectedPaymentModes)}
          >
            <span className="capitalize">Online</span>
            {selectedPaymentModes.includes('online') && <X className="ml-1 h-4 w-4" />}
          </Button>
          <Button
            variant={isOfflineSelected ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => {
              if (isOfflineSelected) {
                setSelectedPaymentModes(selectedPaymentModes.filter((mode) => mode === 'online'));
              } else {
                setSelectedPaymentModes([...selectedPaymentModes, ...(modesData?.map((mode) => mode.name) || [])]);
              }
            }}
          >
            <span className="capitalize">Offline</span>
            {isOfflineSelected && <X className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>

      {modesData && modesData.length > 0 ? (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Offline Modes</h2>
          <div className="flex flex-wrap gap-2">
            {modesData.map((mode) => (
              <Button
                key={mode._id}
                variant={selectedPaymentModes.includes(mode.name) ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => toggleSelection(mode.name, selectedPaymentModes, setSelectedPaymentModes)}
              >
                {mode.name}
                {selectedPaymentModes.includes(mode.name) && <X className="ml-1 h-4 w-4" />}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Discount Type</h2>
        <div className="flex flex-wrap gap-2">
          {['Coinz', 'Couponz', 'No Rewardz', 'Discount'].map((type) => (
            <Button
              key={type}
              variant={selectedDiscountTypes.includes(type) ? 'default' : 'outline'}
              className="flex items-center gap-2"
              onClick={() => toggleSelection(type, selectedDiscountTypes, setSelectedDiscountTypes)}
            >
              {type}
              {selectedDiscountTypes.includes(type) && <X className="ml-1 h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>

      <CommonBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: `${appliedFilters.length > 0 ? 'Clear All' : 'Close'}`,
            onClick: appliedFilters.length > 0 ? handleClearAll : () => setOpenFilterModal(false),
            className: 'rounded-md pl-3 w-full',
          },
          {
            text: `Apply Filters ${appliedFilters.length > 0 ? `(${appliedFilters.length})` : ''}`,
            onClick: handleApplyFilters,
            className: 'rounded-md w-full',
          },
        ]}
      />
    </div>
  );
};

export default SalesFilters;
