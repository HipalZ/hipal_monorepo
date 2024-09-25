import useCouponsStore from "@/components/store/useCouponsStore";
import BottomButton from "@/components/atom/bottomButton";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";
import { useDeleteCoupon, useEditCoupon } from "@/hooks/useCoupon";
import LoadingSpinner from "@/components/atom/loadingSpinner";

import InfoBottomSection from "./infoBottomSection";
import InfoPreview from "./infoPreview";
import SocialMedia from "./previewTypes/socialMedia";

const MemoInfo = () => {
  const { isPublish, couponId } = useCouponsStore((s) => ({
    isPublish: s.isPublish,
    couponId: s.couponId,
  }));

  const { editCoupon, isPending } = useEditCoupon();

  const { mutate: deleteCoupon, isPending: deletePending } = useDeleteCoupon();

  const deleteCouponFunc = useCallback(() => {
    if (couponId) {
      deleteCoupon(couponId);
    }
  }, [couponId]);

  const handlePause = useCallback(
    async (isPublish: boolean) => {
      // if (isActive) {
      //   return toast.error("Cannot pause active coupon");
      // }
      if (!couponId) {
        return toast.error("Coupon ID is missing. Cannot pause.");
      }

      try {
        await editCoupon({
          payload: { isPublish: isPublish },
          couponId,
        });
      } catch (error) {
        toast.error("Failed to pause coupon.");
        console.error("Error pausing coupon:", error);
      }
    },
    [couponId],
  );

  // const EditCoupon = useCallback(() => {
  //   if (isActive) {
  //     return toast.error("Cannot edit active coupon");
  //   }
  //   setSelectedPage("DETAILS");
  // }, [selectedPage, isActive]);

  if (isPending || deletePending) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <section className="pb-[7rem] flex flex-col lg:flex-row">
        <section className="flex-1 overflow-auto">
          <InfoPreview />
        </section>
        <InfoBottomSection />
      </section>
      <BottomButton
        buttons={[
          {
            text: isPublish ? "Pause" : "Activate",
            onClick: () => handlePause(!isPublish),
          },
          {
            text: "delete",
            onClick: deleteCouponFunc,
            delete: true,
          },
        ]}
        fixed
      />
    </>
  );
};

const Info = memo(MemoInfo);

export default Info;
