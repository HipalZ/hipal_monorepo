import { memo, useCallback, lazy, Suspense } from "react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import MemoizedHeader from "@/components/molecules/header"
import { User } from "lucide-react"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import PopUp from "@/components/atom/popUp"
import useStaffStore from "@/components/store/hotel/useHotelStaff"

const HotelStaffMain = lazy(() => import("@/components/hotel/HotelStaff"))
const AddStaffToHotel = lazy(() => import("@/components/hotel/HotelStaff/AddStaffToHotel"))

const MemoStaffManagementHotel = () => {
  const navigate = useNavigate()
  const { staffModal, setStaffModal } = useStaffStore(
    s => ({ staffModal: s.staffModal, setStaffModal: s.setStaffModal })
  )

  const goBack = useCallback(() => {
    return navigate(-1)
  }, [navigate])

  const toggleModal = () => {
    setStaffModal(!staffModal)
  }


  return (
    <main className="pb-[5rem]">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Staff Management" leftIcon={<FaArrowLeft />} onBack={goBack} />
      </header>

      <Suspense fallback={<LoadingSpinner />}>
        <HotelStaffMain />
      </Suspense>


      <PopUp width="w-[30rem]" hide height="h-[100dvh] lg:h-[90dvh]" show={staffModal} onClose={toggleModal}>
        <Suspense fallback={<LoadingSpinner />}>
          <AddStaffToHotel />
        </Suspense>
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
  )
}

const StaffManagementHotel = memo(MemoStaffManagementHotel)
export default StaffManagementHotel

