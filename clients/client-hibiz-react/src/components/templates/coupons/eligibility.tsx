import { memo, useCallback } from "react";
import Coupon from "./coupon";
import { cn } from "@hi/common";
import useCouponsStore, {
  type eligibilityModal,
} from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import BottomButton from "@/components/atom/bottomButton";
import PopUp from "@/components/atom/popUp";
import MemoUserGroupList from "./addUsersToTheCoupon";
import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

const MemoEligibility = () => {
  const {
    couponForEveryOne,
    setCouponForEveryOne,
    setSelectedPage,
    eligibilityModal,
    eligibilityType,
    setEligibilityModal,
    setEligibilityType,
    selectedGroupIds,
    selectedUserIds,
  } = useCouponsStore((s) => ({
    couponForEveryOne: s.couponForEveryOne,
    eligibilityModal: s.eligibilityModal,
    eligibilityType: s.eligibilityType,
    selectedUserIds: s.selectedUserIds,
    selectedGroupIds: s.selectedGroupIds,
    setCouponForEveryOne: s.setCouponForEveryOne,
    setSelectedPage: s.setSelectedPage,
    setEligibilityModal: s.setEligibilityModal,
    setEligibilityType: s.setEligibilityType,
  }));

  const openModal = useCallback(
    (type: eligibilityModal) => {
      setEligibilityType(type);
      setEligibilityModal(true);
    },
    [setEligibilityModal, setEligibilityType],
  );

  const closeModal = useCallback(() => {
    setEligibilityModal(false);
  }, [setEligibilityModal]);

  const goNext = useCallback(() => {
    if (!couponForEveryOne) {
      if (selectedUserIds.length === 0 && selectedGroupIds.length === 0) {
        return toast.error("Please select atleast one user or group");
      }
    }
    setSelectedPage("GRABBING");
  }, [selectedUserIds, selectedGroupIds, couponForEveryOne]);

  return (
    <section className="pb-[6rem] overflow-hidden flex flex-col lg:flex-row gap-6">
      <Coupon />
      <section className="mx-6 mt-[2rem] lg:mt-4 flex-1">
        <label className="font-semibold opacity-50" htmlFor="name">
          Who can claim this*
        </label>
        <article className="p-4 mt-2 bg-white rounded-xl">
          <label className="text-xs font-semibold opacity-50" htmlFor="name">
            Select one type*
          </label>
          <article className="flex w-full mt-4">
            <button
              type="button"
              onClick={() => setCouponForEveryOne(true)}
              className={cn(
                "p-6 rounded-2xl flex-1 mx-2 text-left",
                couponForEveryOne
                  ? "bg-[#F1E9FB] text-[#8C63FF]"
                  : "bg-[#f4f4f490]",
              )}
            >
              Everyone can grab
            </button>
            <button
              type="button"
              onClick={() => setCouponForEveryOne(false)}
              className={cn(
                "p-6 rounded-2xl flex-1 mx-2 text-left",
                !couponForEveryOne
                  ? "bg-[#F1E9FB] text-[#8C63FF]"
                  : "bg-[#f4f4f490]",
              )}
            >
              Assign to selected
            </button>
          </article>
        </article>
        {!couponForEveryOne && (
          <article className="mt-4">
            <h3>
              Users &nbsp;
              {selectedUserIds?.length > 0 ? selectedUserIds?.length : ""}
            </h3>
            <Background>
              <button
                type="button"
                onClick={() => openModal("people")}
                className="w-full bg-[#EFEFF3] rounded-full py-1"
              >
                Add Peoples &nbsp;
              </button>
            </Background>
          </article>
        )}
        {!couponForEveryOne && (
          <article className="mt-4">
            Groups{" "}
            {selectedGroupIds?.length > 0 ? selectedGroupIds?.length : ""}
            <Background>
              <button
                type="button"
                onClick={() => openModal("group")}
                className="w-full bg-[#EFEFF3]  rounded-full py-1"
              >
                Add Groupz
              </button>
            </Background>
          </article>
        )}
      </section>
      {eligibilityModal && (
        <PopUp show={eligibilityModal} onClose={closeModal} hide>
          <section className="h-[100dvh] lg:h-[80dvh] overflow-auto hide-scrollbar">
            <section className="sticky top-0 z-50 w-full bg-[#f4f4f4] lg:rounded-2xl">
              <MemoizedHeader
                title={
                  eligibilityType === "people" ? "Add People" : "Add Group"
                }
                onBack={closeModal}
                leftIcon={<FaArrowLeft />}
              />
            </section>
            {eligibilityType === "people" && (
              <MemoUserGroupList type="people" />
            )}
            {eligibilityType === "group" && <MemoUserGroupList type="group" />}
          </section>
        </PopUp>
      )}
      <BottomButton
        fixed
        buttons={[
          { text: "Back", onClick: () => setSelectedPage("AVAILABLE") },
          { text: "Next", onClick: goNext },
        ]}
      />
    </section>
  );
};

const Eligibility = memo(MemoEligibility);
export default Eligibility;
