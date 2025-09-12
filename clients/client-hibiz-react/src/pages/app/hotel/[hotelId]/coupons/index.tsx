import { lazy, memo, Suspense, useCallback } from "react";
import Hi from "@/assets/svg/hi.svg";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore, {
  type CouponFlow,
} from "@/components/store/useCouponsStore";
import { routeToDashboard } from "@/components/utils/routes";
import { cn } from "@hi/common";
import { useNavigate } from "react-router-dom";
const Manage = lazy(() => import("@/components/templates/coupons/Manage"));
const AllConditions = lazy(
  () => import("@/components/templates/coupons/allConditions"),
);
const AllLinkChannels = lazy(
  () => import("@/components/templates/coupons/allLinkChannels"),
);
const CouponAnalytics = lazy(
  () => import("@/components/templates/coupons/analytics"),
);
const Channel = lazy(() => import("@/components/templates/coupons/channel"));
const CouponAnalyticsInfo = lazy(
  () => import("@/components/templates/coupons/couponAnalyticsInfo"),
);
const CouponDetails = lazy(
  () => import("@/components/templates/coupons/couponDetails"),
);
const CreateCouponPage = lazy(
  () => import("@/components/templates/coupons/createCoupons"),
);
const Custom = lazy(() => import("@/components/templates/coupons/custom"));
const Info = lazy(() => import("@/components/templates/coupons/info"));
const Preview = lazy(() => import("@/components/templates/coupons/preview"));
const Share = lazy(() => import("@/components/templates/coupons/share"));
const Terms = lazy(() => import("@/components/templates/coupons/terms"));

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
        navigate(-1);
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
        setSelectedPage("EXPIRED");
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
        navigate(-1);
        break;
    }
  }, [selectedPage, couponId, navigate, resetFunction, setSelectedPage]);

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
          rightButton={rightButton()}
          headingColor={selectedPage === "PREVIEW" ? "#FFFFFF" : ""}
        />
      </section>

      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </main>
  );
};

const Coupons = memo(MemoCoupons);

export default Coupons;
