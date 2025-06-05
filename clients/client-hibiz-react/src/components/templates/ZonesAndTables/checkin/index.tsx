import { memo, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import { useCheckInStore } from "@/components/store/useCheckInStore";
import { useGetCheckInQrs } from "@/hooks/useCheckIn";
import { useParams } from "react-router-dom";
import CheckInList from "./CheckinList";
import CheckInModals from "./CheckInModals";

const MemoCheckIn = () => {
  const businessId = useParams().businessId as string;

  const { setCheckInQrs, setBusinessId, openCreateModal, resetStore } =
    useCheckInStore();

  const { checkInQrs, isLoadingCheckInQrs, refetchCheckInQrs } =
    useGetCheckInQrs(businessId);

  // Set business ID when component mounts
  useEffect(() => {
    setBusinessId(businessId);
    return () => {
      resetStore(); // Clean up when component unmounts
    };
  }, [businessId, setBusinessId, resetStore]);

  // Update store when data changes
  useEffect(() => {
    if (checkInQrs) {
      setCheckInQrs(checkInQrs);
    }
  }, [checkInQrs, setCheckInQrs]);

  const handleCreateClick = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  const handleRefresh = useCallback(() => {
    refetchCheckInQrs();
  }, [refetchCheckInQrs]);

  if (isLoadingCheckInQrs) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading check-in QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check-in QR Codes</h1>
          <p className="text-muted-foreground">Manage your check-in QR codes</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* QR Code List */}
      <CheckInList />

      {/* Modals */}
      <CheckInModals />

      {/* Bottom Action Button */}
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Create Check-in QR Code",
            icon: <Plus className="h-4 w-4" />,
            className: "w-full px-4",
            onClick: handleCreateClick,
          },
        ]}
      />
    </div>
  );
};

const CheckIn = memo(MemoCheckIn);
export default CheckIn;
