import { useState, useRef, memo, useCallback } from "react";
import useCouponsStore from "@/components/store/useCouponsStore";
import AfterGrabbingCoupon from "./previewTypes/afterGrabbingCard";
import BeforeGrabbingCoupon from "./previewTypes/beforeGrabbing";
import SmallCoupon from "./previewTypes/smallCoupon";
import SocialMedia from "./previewTypes/socialMedia";
import StorySize from "./previewTypes/storySize";
import Background from "@/components/atom/feildBackground";
import { cn } from "@hi/common";
import { toPng } from "html-to-image";
import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import { storeImageAfterSave } from "@/components/utils/helper";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useEditCoupon, useSaveCoupon } from "@/hooks/useCoupon";

const buttonData = [
  { id: "beforeGrabbing", label: "Before Grabbing" },
  { id: "afterGrabbing", label: "After Grabbing" },
  { id: "smallCoupon", label: "Home Page" },
  { id: "socialMedia", label: "Social Media" },
  { id: "storySize", label: "Story Size" },
];
const MemoCustom = () => {
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
    when,
    minimumBillAmount,
    couponForEveryOne,
    customDays,
    couponStartDate,
    couponEndDate,
    expiryAfterGrabbed,
    termsAndConditions,
    selectedUserIds,
    selectedGroupIds,
    overAllLimit,
    expiryClaimLimitValue,
    couponId,
    setPromoteOnBill,
    setPromote,
    setCashbackAvailable,
    requiredFields,
    extendedEndTime,
    couponImage,
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
    setPromoteOnBill: s.setPromoteOnBill,
    setPromote: s.setPromote,
    setCashbackAvailable: s.setCashbackAvailable,
    requiredFields: s.requiredFields,
    extendedEndTime: s.extendedEndTime,
    couponImage: s.couponImage,
  }));

  const { selectedFile } = useMenuPageStore((s) => ({
    selectedFile: s.selectedFile,
  }));

  const { saveCoupon, isPending: isSaving } = useSaveCoupon();
  const { editCoupon, isPending: isUpdating } = useEditCoupon();
  const businessData = useBusinessData((s) => s.businessData);
  const [loading, setIsLoading] = useState(false);

  const [selectedPreview, setSelectedPreview] = useState("beforeGrabbing");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (previewRef.current === null) {
      return;
    }

    const previewElement = previewRef.current as HTMLDivElement;
    const originalBackgroundColor = previewElement.style.backgroundColor;

    try {
      const dataUrl = await toPng(previewElement);

      const link = document.createElement("a");
      link.download = `${selectedPreview}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture the preview:", error);
    } finally {
      previewElement.style.backgroundColor = originalBackgroundColor;
    }
  };

  const saveCouponHandler = async (isPublishStatus: boolean) => {
    let imageUrl = "";

    try {
      imageUrl = couponImage
        ? await storeImageAfterSave(selectedFile, couponImage, setIsLoading)
        : "";
    } catch (error) {
      console.error("Error uploading image:", error);
      return;
    }

    const availability =
      when === "birthdayweek" || when === "birthdaymonth"
        ? { when: "allthetime", customDays: [], startTime: 0, endTime: 0 }
        : {
            when: when,
            customDays: customDays,
            startTime: startTime,
            endTime: extendedEndTime > 0 ? extendedEndTime : endTime,
          };

    const eligibleUser = couponForEveryOne
      ? { allUsers: true }
      : {
          allUsers: false,
          userIds: selectedUserIds.length ? selectedUserIds : undefined,
          groupIds: selectedGroupIds.length ? selectedGroupIds : undefined,
        };

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

  if (loading || isSaving || isUpdating) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 lg:flex-row pb-[7rem]">
      <div className="flex-1 p-2 rounded-2xl">
        <div className="p-4 rounded-xl" ref={previewRef}>
          {selectedPreview === "beforeGrabbing" && <BeforeGrabbingCoupon />}
          {selectedPreview === "afterGrabbing" && <AfterGrabbingCoupon />}
          {selectedPreview === "smallCoupon" && <SmallCoupon />}
          {selectedPreview === "socialMedia" && <SocialMedia />}
          {selectedPreview === "storySize" && <StorySize />}
        </div>
        {selectedPreview === "storySize" ||
        selectedPreview === "socialMedia" ? (
          <div className="w-[92%] mx-auto text-center bg-[#ffffff50] border border-[#ffffff70] rounded-2xl px-2 py-2 mt-6">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 w-full px-2 py-2 text-sm text-black bg-white rounded-full"
            >
              Download Preview
            </button>
          </div>
        ) : null}
      </div>

      <Background className="">
        <div className="flex flex-wrap flex-1 gap-4 mb-6 text-sm ">
          {buttonData.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={cn(
                "px-4 py-2 rounded-full text-nowrap",
                selectedPreview === id
                  ? "bg-[#E3CDFE] text-[#8C63FF]"
                  : "border",
              )}
              onClick={() => setSelectedPreview(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 px-4">
          {selectedUserIds?.length === 0 && selectedGroupIds?.length === 0 && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promoteOnBill"
                  checked={promoteOnBill}
                  className="text-black rounded"
                  onChange={(e) => setPromoteOnBill(e.target.checked)}
                />
                <label htmlFor="promoteOnBill">
                  Promote this after every payment bill
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promote"
                  checked={promote}
                  className="text-black rounded"
                  onChange={(e) => setPromote(e.target.checked)}
                />
                <label htmlFor="promote">Promote this in explore page</label>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cashbackAvailable"
              checked={cashbackAvailable}
              className="text-black rounded"
              onChange={(e) => setCashbackAvailable(e.target.checked)}
            />
            <label htmlFor="cashbackAvailable">
              This coupon will have cashback
            </label>
          </div>
        </div>
      </Background>

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

const Custom = memo(MemoCustom);
export default Custom;
