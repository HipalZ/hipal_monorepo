import { memo, useCallback, useState } from "react";
import AfterGrabbingCoupon from "./previewTypes/afterGrabbingCard";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore, {
  type eligibilityModal,
} from "@/components/store/useCouponsStore";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useEditCoupon, useSaveCoupon } from "@/hooks/useCoupon";
import useBusinessData from "@/components/store/useBusinessData";
import Background from "@/components/atom/feildBackground";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { storeImageAfterSave } from "@/components/utils/helper";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import MemoUserGroupList from "./addUsersToTheCoupon";
import toast from "react-hot-toast";

const MemoShare = () => {
  const {
    bgColor,
    promoteOnBill,
    promote,
    cashbackAvailable,
    couponName,
    couponType,
    couponDiscount,
    couponPrice,
    startTime,
    endTime,
    minimumBillAmount,
    couponForEveryOne,
    customDays,
    couponStartDate,
    couponEndDate,
    expiryAfterGrabbed,
    termsAndConditions,
    selectedUserIds,
    when,
    selectedGroupIds,
    overAllLimit,
    expiryClaimLimitValue,
    couponId,
    requiredFields,
    extendedEndTime,
    couponImage,
    eligibilityModal,
    eligibilityType,
    setEligibilityModal,
    setEligibilityType,
    selectFlow,
  } = useCouponsStore((s) => ({
    bgColor: s.bgColor,
    promoteOnBill: s.promoteOnBill,
    promote: s.promote,
    cashbackAvailable: s.cashbackAvailable,
    couponName: s.couponName,
    couponType: s.couponType,
    couponDiscount: s.couponDiscount,
    couponPrice: s.couponPrice,
    startTime: s.startTime,
    endTime: s.endTime,
    when: s.when,
    minimumBillAmount: s.minimumBillAmount,
    couponForEveryOne: s.couponForEveryOne,
    customDays: s.customDays,
    couponStartDate: s.couponStartDate,
    couponEndDate: s.couponEndDate,
    expiryAfterGrabbed: s.expiryAfterGrabbed,
    termsAndConditions: s.termsAndConditions,
    selectedUserIds: s.selectedUserIds,
    selectedGroupIds: s.selectedGroupIds,
    overAllLimit: s.overAllLimit,
    expiryClaimLimitValue: s.expiryClaimLimitValue,
    couponId: s.couponId,
    requiredFields: s.requiredFields,
    extendedEndTime: s.extendedEndTime,
    couponImage: s.couponImage,
    eligibilityModal: s.eligibilityModal,
    eligibilityType: s.eligibilityType,
    setEligibilityModal: s.setEligibilityModal,
    setEligibilityType: s.setEligibilityType,
    selectFlow: s.selectFlow,
  }));

  const { selectedFile } = useMenuPageStore((s) => ({
    selectedFile: s.selectedFile,
  }));

  const { saveCoupon, isPending: isSaving } = useSaveCoupon();
  const { editCoupon, isPending: isUpdating } = useEditCoupon();
  const businessData = useBusinessData((s) => s.businessData);
  const [loading, setIsLoading] = useState(false);

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

  const saveCouponHandler = async (isPublishStatus: boolean) => {
    if (selectFlow === "ASSIGN") {
      if (selectedUserIds.length === 0 && selectedGroupIds.length === 0) {
        return toast.error("Please select atleast one user or group");
      }
    }
    let imageUrl = "";

    try {
      imageUrl = couponImage
        ? await storeImageAfterSave(selectedFile, couponImage, setIsLoading)
        : "";
    } catch (error) {
      console.error("Error uploading image:", error);
      return;
    }

    const availability = {
      when: customDays.length > 0 ? "custom" : "allthetime",
      customDays: customDays,
      startTime: startTime,
      endTime: extendedEndTime > 0 ? extendedEndTime : endTime,
    };

    const eligibleUser =
      selectedUserIds.length > 0 || selectedGroupIds.length > 0
        ? {
            allUsers: false,
            userIds: selectedUserIds.length ? selectedUserIds : undefined,
            groupIds: selectedGroupIds.length ? selectedGroupIds : undefined,
          }
        : { allUsers: true };

    const payload = {
      businessId: businessData?._id || "",
      name: couponName,
      type: "FIX",
      isPublish: isPublishStatus,
      bgColour: bgColor,
      promoteOnBill: promoteOnBill,
      promote: promote,
      cashbackAvailable: cashbackAvailable,
      ...(imageUrl && { image: imageUrl }),
      config: {
        value: couponType === "PERCENTAGE" ? couponDiscount : couponPrice,
        discountType: couponType,
        upto: couponPrice || 0,
      },
      conditions: {
        individualUserLimit: {
          overAllLimit: expiryClaimLimitValue || 0,
        },
        billValue: minimumBillAmount || 0,
        expiryClaimLimit: {
          overAllLimit: overAllLimit || 0,
        },
        availability: availability,
        eligibleUser: eligibleUser,
        expiryAfterGrabbed: expiryAfterGrabbed,
        couponStartDate: couponStartDate || 0,
        couponEndDate: couponEndDate || 0,
        requiredFields: requiredFields,
        tc:
          termsAndConditions ||
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    };

    couponId
      ? await editCoupon({ payload, couponId })
      : await saveCoupon(payload);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="pb-[7rem] mx-4 flex flex-col md:flex-row justify-center items-center lg:items-start gap-6">
      <AfterGrabbingCoupon />
      <section className=" w-full max-w-[30rem] ">
        {selectFlow === "ASSIGN" && (
          <article className="mt-4">
            <Background>
              <h3 className="text-[#6A31DF]">
                Users &nbsp;
                {selectedUserIds?.length > 0 ? selectedUserIds?.length : ""}
              </h3>
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
        {selectFlow === "ASSIGN" && (
          <article className="mt-4">
            <Background>
              <h3 className="text-[#6A31DF]">
                Groups{" "}
                {selectedGroupIds?.length > 0 ? selectedGroupIds?.length : ""}
              </h3>
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
              {eligibilityType === "group" && (
                <MemoUserGroupList type="group" />
              )}
            </section>
          </PopUp>
        )}
      </section>
      <BottomButton
        fixed
        buttons={[
          {
            text: couponId ? "Update" : "publish",
            onClick: () => saveCouponHandler(true),
            isLoading: isSaving || isUpdating,
          },
        ]}
      />
    </section>
  );
};

const Share = memo(MemoShare);
export default Share;
