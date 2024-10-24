import Hi from "@/assets/svg/hi.svg";
import PaymentNavbar from "@/components/templates/menu/sideNavbaar/paymentNavBar";
import { cn } from "@/components/utils/helper";
import { lazy, memo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
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

  const sidebarItems = [
    { text: "Overview", onClick: () => setSelectedTab("Overview") },
    {
      text: "Sales",
      onClick: () => setSelectedTab("Sales"),
    },
  ];

  return (
    <main>
      <article className="linear_gradient_background">
        <MemoizedHeader
          title="Payments"
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </article>

      <nav className="sticky top-0 z-50 flex justify-between w-full px-4 space-x-4 text-sm bg-white mobile-only">
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
