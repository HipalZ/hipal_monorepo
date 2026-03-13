import { type CampaignAnalytics, useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useAddGroup } from '@/hooks/useTemplates';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useCallback } from 'react';
import toast from 'react-hot-toast';

const MemoPhoneBottomButtons = ({ currentData }: { currentData: CampaignAnalytics[] }) => {
  const { addGroupMutation } = useAddGroup();
  const { selectedCampaign, pageNumber, setPageNumber, selectedPhones, clearSelectedPhones } = useWhatsappTempStore((s) => ({
    selectedCampaign: s.selectedCampaign,
    pageNumber: s.pageNumber,
    setPageNumber: s.setPageNumber,
    selectedPhones: s.selectedPhones,
    clearSelectedPhones: s.clearSelectedPhones,
  }));
  const handleNextData = useCallback(async () => {
    const newPageNumber = pageNumber + 1;
    setPageNumber(newPageNumber);
  }, [pageNumber, setPageNumber]);

  const handlePreviousData = useCallback(async () => {
    const newPageNumber = pageNumber - 1;
    setPageNumber(newPageNumber);
  }, [pageNumber, setPageNumber]);

  const handleAddGroup = () => {
    if (selectedPhones.length === 0) {
      toast.error('Please select at least one phone number.');
      return;
    }

    const payload = {
      usersArray: selectedPhones.map((phone) => ({ phone })),
      campaignName: selectedCampaign?.campaignName + status || 'Campaign',
      businessId: selectedCampaign?.businessId,
    };

    addGroupMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Group added successfully.');
        clearSelectedPhones();
      },
      onError: () => {
        toast.error('Failed to add group.');
      },
    });
  };
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center">
        <span className="font-medium">Overall Summary</span>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          type="button"
          onClick={handlePreviousData}
          disabled={pageNumber === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={handleNextData}
          disabled={currentData.length === 0}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          disabled={currentData.length === 0}
          onClick={handleAddGroup}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Group
        </button>
      </div>
    </div>
  );
};

const PhoneBottomButtons = memo(MemoPhoneBottomButtons);
export default PhoneBottomButtons;
