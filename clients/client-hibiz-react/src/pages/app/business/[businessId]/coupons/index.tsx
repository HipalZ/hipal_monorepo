import Hi from "@/assets/svg/hi.svg";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore, {
  type CouponFlow,
} from "@/components/store/useCouponsStore";
import Manage from "@/components/templates/coupons/Manage";
import AllConditions from "@/components/templates/coupons/allConditions";
import AllLinkChannels from "@/components/templates/coupons/allLinkChannels";
import CouponAnalytics from "@/components/templates/coupons/analytics";
import Channel from "@/components/templates/coupons/channel";
import CouponAnalyticsInfo from "@/components/templates/coupons/couponAnalyticsInfo";
import CouponDetails from "@/components/templates/coupons/couponDetails";
import CreateCouponPage from "@/components/templates/coupons/createCoupons";
import Custom from "@/components/templates/coupons/custom";
import Info from "@/components/templates/coupons/info";
import Preview from "@/components/templates/coupons/preview";
import Share from "@/components/templates/coupons/share";
import Terms from "@/components/templates/coupons/terms";
import { routeToDashboard } from "@/components/utils/routes";
import { cn } from "@hi/common";
import { memo, startTransition, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const getPageHeading = (selectedPage: CouponFlow): string => {
  const headings: { [key in CouponFlow]?: string } = {
    CREATE: "Create Coupon",
    EDIT: "Edit Coupon",
    MANAGE: "Manage Coupons",
    DETAILS: "Creation",
    AVAILABLE: "Coupon Availability",
    EXPIRED: "Conditions",
    ELIGIBILITY: "Coupon Eligibility",
    Terms: "Couponz terms",
    PREVIEW: "Customize Coupon",
    CUSTOM: "Previews",
    INFO: "Coupon Info",
    ANALYTICS: "Analytics",
    ANALYTICS_INFO: "Coupon Info",
    LINK_CHANNELS: "Link Channels",
    CHANNELS: "Channels",
    SHARE: "Share",
  };
  return headings[selectedPage] || "Coupon";
};
const MemoCoupons = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const { selectedPage, setSelectedPage, couponId, bgColor, resetFunction } =
    useCouponsStore((s) => ({
      selectedPage: s.selectedPage,
      setSelectedPage: s.setSelectedPage,
      bgColor: s.bgColor,
      resetFunction: s.resetCouponState,
      couponId: s.couponId,
    }));

  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    switch (selectedPage) {
      case "MANAGE":
        startTransition(() => {
          navigate(routeToDashboard(businessData?._id as string));
        });
        break;
      case "CREATE":
      case "EDIT":
      case "INFO":
        setSelectedPage("MANAGE");
        resetFunction();
        break;
      case "SHARE":
        setSelectedPage("Terms");
        break;
      case "DETAILS":
        if (couponId) {
          return setSelectedPage("INFO");
        }
        setSelectedPage("CREATE");
        break;
      case "AVAILABLE":
        setSelectedPage("EXPIRED");
        break;
      case "EXPIRED":
        setSelectedPage("DETAILS");
        break;
      case "ELIGIBILITY":
        setSelectedPage("AVAILABLE");
        break;
      case "Terms":
        setSelectedPage("CUSTOM");
        break;
      case "PREVIEW":
        setSelectedPage("Terms");
        break;
      case "CUSTOM":
        setSelectedPage("PREVIEW");
        break;
      case "ANALYTICS":
        setSelectedPage("MANAGE");
        break;
      case "ANALYTICS_INFO":
        setSelectedPage("ANALYTICS");
        resetFunction();
        break;
      case "LINK_CHANNELS":
        setSelectedPage("ANALYTICS_INFO");
        break;
      case "CHANNELS":
        setSelectedPage("ANALYTICS_INFO");
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
        return <span className="text-xl font-semibold">3/5</span>;
      case "EXPIRED":
        return <span className="text-xl font-semibold">2/5</span>;
      case "ELIGIBILITY":
        return <span className="text-xl font-semibold">4/5</span>;

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
          title={getPageHeading(selectedPage as CouponFlow)}
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightButton={rightButton()}
          headingColor={selectedPage === "PREVIEW" ? "#FFFFFF" : ""}
        />
      </section>
      {selectedPage === "MANAGE" && <Manage />}
      {selectedPage === "CREATE" && <CreateCouponPage />}
      {selectedPage === "DETAILS" && <CouponDetails />}
      {selectedPage === "EXPIRED" && <AllConditions />}
      {selectedPage === "PREVIEW" && <Preview />}
      {selectedPage === "Terms" && <Terms />}
      {selectedPage === "CUSTOM" && <Custom />}
      {selectedPage === "SHARE" && <Share />}
      {selectedPage === "INFO" && <Info />}
      {selectedPage === "ANALYTICS" && <CouponAnalytics />}
      {selectedPage === "ANALYTICS_INFO" && <CouponAnalyticsInfo />}
      {selectedPage === "LINK_CHANNELS" && <AllLinkChannels />}
      {selectedPage === "CHANNELS" && <Channel />}
    </main>
  );
};

const Coupons = memo(MemoCoupons);

export default Coupons;
