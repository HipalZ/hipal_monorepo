import {
  type CampaignAnalytics,
  useWhatsappTempStore,
} from "@/components/store/useWhatsappTempStore";
import { useAddGroup } from "@/hooks/useTemplates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

const MemoPhoneBottomButtons = ({
  currentData,
}: { currentData: CampaignAnalytics[] }) => {
  const { addGroupMutation } = useAddGroup();
  const {
    selectedCampaign,
    pageNumber,
    setPageNumber,
    selectedPhones,
    clearSelectedPhones,
  } = useWhatsappTempStore((s) => ({
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
      toast.error("Please select at least one phone number.");
      return;
    }

    const payload = {
      usersArray: selectedPhones.map((phone) => ({ phone })),
      campaignName: selectedCampaign?.campaignName + status || "Campaign",
      businessId: selectedCampaign?.businessId,
    };

    addGroupMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Group added successfully.");
        clearSelectedPhones();
      },
      onError: () => {
        toast.error("Failed to add group.");
      },
    });
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center">
        <span className="font-medium">
          Showing {currentData.length} contacts
        </span>
      </div>
      <div className="flex justify-between flex-1 sm:justify-end">
        <button
          type="button"
          onClick={handlePreviousData}
          disabled={pageNumber === 1}
          className="relative inline-flex items-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={handleNextData}
          disabled={currentData.length === 0}
          className="relative inline-flex items-center ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          disabled={currentData.length === 0}
          onClick={handleAddGroup}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white bg-purple-500 border border-gray-300 rounded-md hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Group
        </button>
      </div>
    </div>
  );
};

const PhoneBottomButtons = memo(MemoPhoneBottomButtons);
export default PhoneBottomButtons;
