import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";
import PaymentNavbar from "@/components/templates/menu/sideNavbaar/paymentNavBar";
import { cn } from "@/components/utils/helper";
import { lazy, memo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);
const MemoizedHeader = lazy(() => import("@/components/molecules/header"));
const Overview = lazy(() => import("@/components/templates/payment/overview"));
const PaymentSales = lazy(() => import("@/components/templates/payment/sales"));

const Payments = () => {
  const [selectedTab, setSelectedTab] = useState<"Overview" | "Sales">(
    "Overview",
  );
  const businessData = useBusinessData((s) => s.businessData);

  const sidebarItems = [
    { text: "Overview", onClick: () => setSelectedTab("Overview") },
    {
      text: "Sales",
      onClick: () => setSelectedTab("Sales"),
    },
  ];

  const navigate = useNavigate();
  const handleBack = () => {
    navigate(`/app/business/${businessData?._id}`);
  };

  return (
    <main className="relative">
      <section className={cn("sticky top-0 z-50 w-full bg-[#f4f4f4]")}>
        <MemoizedHeader
          title="Payments"
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          onBack={handleBack}
        />
      </section>

      <nav className="sticky top-[4rem] z-50 flex justify-between w-full px-4 space-x-4 text-sm bg-white mobile-only">
        {sidebarItems.map((item) => (
          <button
            className={cn(
              "pb-3 pt-4 bg-white ",
              selectedTab?.toLowerCase() === item.text.toLowerCase()
                ? "border-b-2 border-[#15BBB3] transition-all text-[#15BBB3]"
                : "",
            )}
            key={item.text}
            type="button"
            onClick={item.onClick}
          >
            {item.text}
          </button>
        ))}
      </nav>
      <PaymentNavbar items={sidebarItems} selectedNavItem={selectedTab} />
      <DateRangePicker />
      {selectedTab === "Overview" && <Overview />}
      {selectedTab === "Sales" && <PaymentSales />}
    </main>
  );
};

const MemoPayments = memo(Payments);
export default MemoPayments;
