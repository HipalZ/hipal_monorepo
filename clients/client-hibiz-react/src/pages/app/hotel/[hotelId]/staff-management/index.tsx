import { memo, useCallback, lazy, Suspense } from "react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import MemoizedHeader from "@/components/molecules/header";
import { FileText, User } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import useStaffStore, {
  useStaffDataStore,
} from "@/components/store/hotel/useHotelStaff";
import StaffRepoComp from "@/components/hotel/Analytics/StaffMainComp.tsx";

const HotelStaffMain = lazy(() => import("@/components/hotel/HotelStaff"));
const AddStaffToHotel = lazy(
  () => import("@/components/hotel/HotelStaff/AddStaffToHotel"),
);

const MemoStaffManagementHotel = () => {
  const navigate = useNavigate();
  const staffModal = useStaffStore((s) => s.staffModal);
  const setStaffModal = useStaffStore((s) => s.setStaffModal);
  const showStaffReport = useStaffDataStore((s) => s.showStaffReport);
  const setShowStaffReport = useStaffDataStore((s) => s.setShowStaffReport);

  const goBack = useCallback(() => {
    return navigate(-1);
  }, [navigate]);

  const openShowStaffReport = useCallback(() => {
    setShowStaffReport(true);
  }, [setShowStaffReport]);

  const closeShowStaffReport = useCallback(() => {
    setShowStaffReport(false);
  }, [setShowStaffReport]);

  const toggleModal = () => {
    setStaffModal(!staffModal);
  };

  return (
    <main className="pb-[5rem]">
      <header className="linear_gradient_background">
        <MemoizedHeader
          title="Staff Management"
          leftIcon={<FaArrowLeft />}
          onBack={goBack}
        />
      </header>

      <Suspense fallback={<LoadingSpinner />}>
        <HotelStaffMain />
      </Suspense>

      <PopUp
        width="w-[30rem] md:w-[48rem]"
        hide
        height="h-[100dvh] lg:h-[90dvh]"
        show={staffModal}
        onClose={toggleModal}
        rightTopBack
      >
        <Suspense fallback={<LoadingSpinner />}>
          <AddStaffToHotel />
        </Suspense>
      </PopUp>

      <PopUp
        height="h-[100dvh]"
        width="w-[30rem] md:w-[64rem]"
        show={showStaffReport}
        onClose={closeShowStaffReport}
        hide
        rightTopBack
      >
        <section className="h-[95dvh] overflow-y-auto hide-scrollbar">
          <StaffRepoComp hide={true} />
        </section>
      </PopUp>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "",
            onClick: goBack,
            isBackButton: true,
            className: "pl-3 rounded-md",
          },
          {
            text: "Add Staff",
            onClick: toggleModal,
            icon: <User size={24} />,
            className: "rounded-md w-full",
            highlight: true,
          },
        ]}
      />
    </main>
  );
};

const StaffManagementHotel = memo(MemoStaffManagementHotel);
export default StaffManagementHotel;
