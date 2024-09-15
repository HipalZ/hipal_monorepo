import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore from "@/components/store/useCouponsStore";
import { routeToDashboard } from "@/components/utils/routes";
import { startTransition, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import Manage from "@/components/templates/coupons/Manage";
import CreateCoupon from "@/components/templates/coupons/createCoupon";
import CouponDetails from "@/components/templates/coupons/couponDetails";
import Available from "@/components/templates/coupons/available";
import Expiry from "@/components/templates/coupons/expiry";
import Eligibility from "@/components/templates/coupons/eligibility";
import Condition from "@/components/templates/coupons/condition";
import Preview from "@/components/templates/coupons/preview";
import { cn } from "@hi/common";
import Custom from "@/components/templates/coupons/custom";
import Terms from "@/components/templates/coupons/terms";
import Info from "@/components/templates/coupons/info";

const Coupons = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const { selectedPage, setSelectedPage, bgColor, resetFunction } =
    useCouponsStore((s) => ({
      selectedPage: s.selectedPage,
      setSelectedPage: s.setSelectedPage,
      bgColor: s.bgColor,
      resetFunction: s.resetCouponState,
    }));

  const navigate = useNavigate();

  const dynamicHeading = useCallback(() => {
    switch (selectedPage) {
      case "CREATE":
        return "Create Coupon";
      case "EDIT":
        return "Edit Coupon";
      case "MANAGE":
        return "Manage Coupons";
      case "DETAILS":
        return "Coupon Details";
      case "AVAILABLE":
        return "Coupon Availability";
      case "EXPIRED":
        return "Coupon Expiration";
      case "ELIGIBILITY":
        return "Coupon Eligibility";
      case "GRABBING":
        return "Coupon Grabbing";
      case "Terms":
        return "Couponz terms";
      case "PREVIEW":
        return "Preview";
      case "CUSTOM":
        return "Before Grabbing";
      default:
        return "Coupon";
    }
  }, [selectedPage]);

  const handleBack = useCallback(() => {
    switch (selectedPage) {
      case "MANAGE":
        startTransition(() => {
          navigate(routeToDashboard(businessData?._id as string));
        });
        break;
      case "CREATE":
      case "EDIT":
        setSelectedPage("MANAGE");
        break;
      case "DETAILS":
        setSelectedPage("CREATE");
        break;
      case "AVAILABLE":
        setSelectedPage("DETAILS");
        break;
      case "EXPIRED":
        setSelectedPage("AVAILABLE");
        break;
      case "ELIGIBILITY":
        setSelectedPage("EXPIRED");
        break;
      case "GRABBING":
        setSelectedPage("ELIGIBILITY");
        break;
      case "Terms":
        setSelectedPage("GRABBING");
        break;
      case "PREVIEW":
        setSelectedPage("Terms");
        break;
      case "CUSTOM":
        setSelectedPage("PREVIEW");
        break;
      case "INFO":
        setSelectedPage("MANAGE");
        resetFunction();
        break;
      default:
        startTransition(() => {
          navigate(routeToDashboard(businessData?._id as string));
        });
        break;
    }
  }, [selectedPage, businessData?._id]);

  const rightButton = useCallback(() => {
    switch (selectedPage) {
      case "MANAGE":
        return <img src={Hi} alt="HIpal logo" />;
      case "CREATE":
        return <img src={Hi} alt="HIpal logo" />;
      case "DETAILS":
        return <span className="text-xl font-semibold">1/5</span>;
      case "AVAILABLE":
        return <span className="text-xl font-semibold">2/5</span>;
      case "EXPIRED":
        return <span className="text-xl font-semibold">3/5</span>;
      case "ELIGIBILITY":
        return <span className="text-xl font-semibold">4/5</span>;
      case "GRABBING":
        return <span className="text-xl font-semibold">5/5</span>;
      default:
        break;
    }
  }, [selectedPage]);

  return (
    <main className="relative">
      <section
        style={{
          backgroundColor: selectedPage === "PREVIEW" ? bgColor : "#f4f4f4",
        }}
        className={cn("sticky top-0 z-50 w-full bg-[#f4f4f4]")}
      >
        <MemoizedHeader
          title={dynamicHeading()}
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightButton={rightButton()}
          headingColor={selectedPage === "PREVIEW" ? "#FFFFFF" : ""}
        />
      </section>
      {selectedPage === "MANAGE" && <Manage />}
      {selectedPage === "CREATE" && <CreateCoupon />}
      {selectedPage === "DETAILS" && <CouponDetails />}
      {selectedPage === "AVAILABLE" && <Available />}
      {selectedPage === "EXPIRED" && <Expiry />}
      {selectedPage === "ELIGIBILITY" && <Eligibility />}
      {selectedPage === "GRABBING" && <Condition />}
      {selectedPage === "PREVIEW" && <Preview />}
      {selectedPage === "Terms" && <Terms />}
      {selectedPage === "CUSTOM" && <Custom />}
      {selectedPage === "INFO" && <Info />}
    </main>
  );
};

export default Coupons;
