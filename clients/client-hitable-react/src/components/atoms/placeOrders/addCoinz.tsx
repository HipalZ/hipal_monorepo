import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/components/store/useOrderData";
import {
  useCheckLoyalty,
  useCustomerLogin,
  useUpdateBill,
} from "@/components/hooks/useTableData";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import PhoneNumber from "./phoneNumber";
import OtpStep from "./otpStep";
import LoyaltySuccess from "./loyaltySuccess";

const MemoAddCoinz = (props) => {
  const { data } = props;
  const billValue = data.total || 0;
  const [userData, setUserData] = useState<any>({});
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { setOpenAddCoinz } = useOrderStore();
  const { loyaltyData } = useCheckLoyalty();
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [availedCoupon, setAvailedCoupon] = useState<any>(null);
  const [couponz, setCouponz] = useState();
  const [availableCoinz, setAvailableCoinz] = useState(0);
  const [coinzAdded, setCoinzAdded] = useState(data?.claimedCoins);
  const [applyCoinz, setApplyCoinz] = useState(data?.claimedCoins);
  const { updateBill } = useUpdateBill();
  const handleCloseModal = () => {
    setOpenAddCoinz(false);
  };

  const { sendOtp, verifyOtp } = useCustomerLogin();

  const handleOtpSubmit = async () => {
    if (otp.length !== 4) return;
    try {
      const res = await verifyOtp({ phone: phoneNumber, otp });
      setAvailableCoinz(res?.data?.coins || 0);
      setCouponz(res?.data?.coupons || []);
      setUserData(res?.data?.userData || {});
      setStep("success");
    } catch {
      toast.error("OTP verification failed");
    }
  };

  const removeCoupon = () => {
    setAvailedCoupon(null);
    updateBill({
      tableName: data.tableName,
      coinz: 0,
      total: data.total,
      couponId: null,
      businessId,
    });
  };

  const getCouponDiscountAmount = (coupon) => {
    const { value, discountType, upto } = coupon?.config || {};
    if (discountType === "PERCENTAGE") {
      const discount = Math.floor((value / 100) * billValue);
      return upto && upto > 0 ? Math.min(discount, upto) : discount;
    }
    if (discountType === "AMOUNT") {
      return value;
    }
    return 0;
  };

  const applyCoupon = async (coupon) => {
    const minBill = coupon?.conditions?.billValue || 0;
    const customDays = coupon?.conditions?.availability?.customDays || [];

    const today = new Date()
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    // Validate day availability
    if (customDays.length > 0 && !customDays.includes(today)) {
      return toast("This coupon is not valid today.");
    }

    // Validate bill amount
    if (billValue < minBill) {
      return toast(`Bill should be at least ₹${minBill} to use this coupon.`);
    }

    // If Coinz are already claimed
    if (coinzAdded > 0) {
      const confirmReplace = window.confirm(
        "Applying this coupon will remove your Coinz. Continue?",
      );
      if (!confirmReplace) return;

      // Clear coinz before proceeding
      setCoinzAdded(0);
      toast.success("Coinz removed.");
    }

    // Calculate discount
    const { discountValue, resetClaimedCoins } = calculateDiscount(
      coupon,
      billValue,
      coinzAdded,
    );

    if (resetClaimedCoins) {
      setCoinzAdded(0);
    }

    setAvailedCoupon(coupon);
    // setClaimCouponz(discountValue);
    toast.success(`Coupon "${coupon.name}" applied: ₹${discountValue} off`);
    updateBill({
      tableName: data.tableName,
      coinz: discountValue,
      total: data.total,
      couponId: coupon?._id || null,
      businessId,
    });
  };

  const calculateDiscount = (coupon, billValue, coinzAdded) => {
    const { value, discountType, upto } = coupon.config;
    let discount = 0;

    if (discountType === "PERCENTAGE") {
      discount = Math.floor((value / 100) * billValue);
      if (upto && upto > 0) {
        discount = Math.min(discount, upto);
      }
    } else if (discountType === "AMOUNT") {
      discount = value;
    }

    const resetClaimedCoins = coinzAdded > 0;
    return { discountValue: discount, resetClaimedCoins };
  };

  const maxClaim = useMemo(() => {
    const canClaimCoinz = Math.round(
      (data?.subTotal || billValue) *
        (loyaltyData?.setClaimedPercentage / 100) || 0,
    );
    return canClaimCoinz < availableCoinz ? canClaimCoinz : availableCoinz;
  }, [
    data?.subTotal,
    billValue,
    loyaltyData?.setClaimedPercentage,
    availableCoinz,
  ]);

  const handleApplyCoinz = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
    if (availedCoupon) {
      toast.error("You can't apply Coinz when a coupon is already applied.");
      return;
    }

    if (userEnteredValue > maxClaim) {
      toast.error(`You can use up to ${maxClaim} Coinz only.`);
      setCoinzAdded(maxClaim);
    } else {
      setCoinzAdded(userEnteredValue);
    }
  };

  const confirmApplyCoinz = () => {
    if (coinzAdded > 0) {
      setApplyCoinz(coinzAdded);
      toast.success(`Applied ${coinzAdded} Coinz on this bill.`);
      updateBill({
        tableName: data.tableName,
        coinz: coinzAdded,
        total: data.total,
        couponId: availedCoupon?._id || null,
        businessId,
      });
    }
  };

  const removeApplyCoinz = () => {
    setApplyCoinz(0);
    setCoinzAdded(0);
    updateBill({
      tableName: data.tableName,
      coinz: 0,
      total: data.total,
      couponId: null,
      businessId,
    });
    toast.success("Removed Coinz from this bill.");
  };

  if (!loyaltyData?.loyaltyId)
    return (
      <center className="text-xl text-black mt-24">
        Your Business doesn't have loyalty
      </center>
    );

  const renderContent = () => {
    switch (step) {
      case "phone":
        return (
          <PhoneNumber
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            sendOtp={sendOtp}
            setStep={setStep}
            setAvailableCoinz={setAvailableCoinz}
            setUserData={setUserData}
            setCouponz={setCouponz}
          />
        );

      case "otp":
        return (
          <OtpStep
            phoneNumber={phoneNumber}
            otp={otp}
            setOtp={setOtp}
            handleOtpSubmit={handleOtpSubmit}
            setStep={setStep}
          />
        );

      case "success":
        return (
          <LoyaltySuccess
            userData={userData}
            availableCoinz={availableCoinz}
            applyCoinz={applyCoinz}
            handleCloseModal={handleCloseModal}
            handleApplyCoinz={handleApplyCoinz}
            applyCoupon={applyCoupon}
            removeApplyCoinz={removeApplyCoinz}
            removeCoupon={removeCoupon}
            getCouponDiscountAmount={getCouponDiscountAmount}
            couponz={couponz}
            availedCoupon={availedCoupon}
            confirmApplyCoinz={confirmApplyCoinz}
            coinzAdded={coinzAdded}
          />
        );
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Sub Total</CardTitle>
        <CardTitle className="text-2xl cursor-pointer">
          <span>₹{data?.subTotal}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

const AddCoinz = memo(MemoAddCoinz);
export default AddCoinz;
