import { memo, useCallback, useState } from "react";
import Hipay from "@/assets/payment/hipay.png";
import hipayBg from "@/assets/payment/hipay_background.png";
import style from "./addAmount.module.css";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useTableData from "@/components/store/useTableData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import PlaceholderImg from "@/components/atoms/placeholder";
import { getRandomBlurImg } from "@/components/utils/images";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useCouponz } from "@/components/store/useCouponz";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCallTheCaptain } from "@/components/hooks/useCartHook";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useJewelleryOrderCreate } from "@/components/hooks/useOrderCreate";
import { useOrderStore } from "../../store/useOrder";

interface AddAmountModalProps {
  onClose?: () => void;
}

const AddAmountModal = memo(({ onClose }: AddAmountModalProps) => {
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const business = useBusinessDetails((s) => s.businessDetails);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { mutate, isPending } = useCallTheCaptain();
  const billValue = usePaymentStore((s) => s.billValue);
  const setBillValue = usePaymentStore((s) => s.setBillValue);
  const setEditBillModal = usePaymentStore((s) => s.setEditBillModal);
  const setClaimCouponz = usePaymentStore((s) => s.setClaimCouponz);
  const setClaimedCoins = usePaymentStore((s) => s.setClaimedCoins);
  const setCustomTip = usePaymentStore((s) => s.setCustomTip);
  const setTips = usePaymentStore((s) => s.setTips);
  const setSelectedTip = usePaymentStore((s) => s.setSelectedTip);
  const setShowInput = usePaymentStore((s) => s.setShowInput);
  const setIsTipActive = usePaymentStore((s) => s.setIsTipActive);
  const outLetType = outletInfo?.outLetType;
  const { mutateAsync, isPending: jewelleryPending } =
    useJewelleryOrderCreate();

  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));
  const userDetails = useLogin((s) => s.userDetails);
  const customLink = useParams()?.businessId as string;

  const setIsPayment = useLogin((s) => s.setIsPayment);
  const name = useLogin((s) => s.userDetails?.name);
  const saveAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBillValue(value === "" ? 0 : Number(value));
  };
  const { tableName } = useTableData();

  const normalFlow = useCallback(() => {
    setIsPayment(false);
    setEditBillModal(false);
    setClaimCouponz(0);
    setClaimedCoins(0);
    setSelectedTip("");
    setCustomTip("");
    setShowInput(false);
    setIsTipActive(false);
    setTips(0);
    setAvailedCoupon({});
    // onClose?.();
    router.push(`/${customLink}/payment`);
  }, [
    customLink,
    router,
    setEditBillModal,
    setIsPayment,
    setClaimCouponz,
    setClaimedCoins,
    setCustomTip,
    setTips,
    setSelectedTip,
    setShowInput,
    setIsTipActive,
    setAvailedCoupon,
    // onClose,
  ]);

  const proceedToPayment = useCallback(async () => {
    if (billValue === 0 || billValue < 0) {
      toast.error("Please enter amount");
      return;
    }
    if (
      outLetType === "RESTAURANT" ||
      outLetType === "MENU" ||
      outLetType === "OTHER"
    ) {
      setLoading(true);
      normalFlow();
    }
    if (outLetType === "JEWELLERY") {
      const res = await mutateAsync({
        billValue: billValue,
        businessId: businessId,
        userId: userDetails!._id,
      });
      if (res.status === 200) {
        setLoading(true);
        normalFlow();
      }
    }
  }, [billValue, outLetType, businessId, userDetails, mutateAsync]);

  const callTheWaiter = useCallback(async () => {
    if (!tableName) {
      toast.error("Please Scan the table to call staff");
      return;
    }

    const payload = {
      businessId: businessId,
      tableName: tableName,
      message: "Want to settle bill",
      alertType: "WAITER",
      status: "WAITER",
      name: name || "user",
      userId: userDetails._id,
    };

    mutate(payload);
  }, [businessId, tableName, name, userDetails._id, mutate]);

  return (
    <section className=" relative overflow-y-auto overflow-x-hidden mb-[2rem]">
      <header className="bg-base-100 h-[4.25rem] flex items-center text-primary">
        {business.logoUrl ? (
          <figure className="h-[5rem] p-4 w-[5rem]">
            <Image
              src={business.logoUrl}
              height={80}
              width={80}
              quality={95}
              objectFit="cover"
              alt="logo-business"
              className="object-center border rounded-full shadow-sm aspect-square"
              placeholder="blur"
              blurDataURL={getRandomBlurImg(100, 100)}
            />
          </figure>
        ) : (
          <PlaceholderImg />
        )}
        <div>
          Paying : <br />
          <span className="font-bold text-primary">{business.name}</span>
        </div>
      </header>
      <section className="relative -mt-4  mb-[3rem] scale-[0.85]">
        <center>
          <Image
            width={1080}
            height={1080}
            src={hipayBg}
            alt="hipayBg"
            className="spin"
          />
          <figure className={`${style.globe_payment} mt-24`}>
            <Image width={193} height={193} src={Hipay} alt="Hipay" />
          </figure>
        </center>
        <section className="absolute mx-6 space-y-4 w-[88%]">
          <input
            value={billValue || ""}
            onChange={saveAmount}
            placeholder="Enter Final Bill Amount"
            className="w-full px-4 py-3 text-black bg-white border border-black rounded-2xl focus:outline-none"
            type="tel"
            maxLength={6}
            minLength={1}
            required
          />
        </section>
      </section>
      <CommonBottomButton
        fixed
        buttons={[
          ...(outletInfo?.outLetType === "RESTAURANT" ||
          outletInfo?.outLetType === "MENU" ||
          outletInfo?.outLetType === "OTHER"
            ? [
                {
                  text: "Call Captain",
                  onClick: callTheWaiter,
                  disable: isPending,
                  isLoading: isPending,
                },
              ]
            : []),
          {
            text: "Next",
            onClick: proceedToPayment,
            disable: isPending || loading || jewelleryPending,
            isLoading: isPending || loading || jewelleryPending,
          },
        ]}
      />
    </section>
  );
});

const MemoAddAmountModal = memo(AddAmountModal);
export default MemoAddAmountModal;
