import Hi from "@/assets/svg/hi.svg";
import { cn } from "@/components/utils/helper";
import { lazy, memo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);
const MemoizedHeader = lazy(() => import("@/components/molecules/header"));

// Lazy load the Overview and PaymentSales components
const Overview = lazy(() => import("@/components/templates/payment/overview"));
const PaymentSales = lazy(() => import("@/components/templates/payment/sales"));

const Payments = () => {
  const [selectedTab, setSelectedTab] = useState("Overview");

  return (
    <main>
      <article className="pb-4 linear_gradient_background">
        <MemoizedHeader
          title="Payments"
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </article>
      <section className="flex justify-around mt-6 mb-2 text-lg">
        <button
          type="button"
          className={cn({
            "scale-125 border-b-2 border-black": selectedTab === "Overview",
          })}
          onClick={() => setSelectedTab("Overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={cn({
            "scale-125 border-b-2 border-black": selectedTab === "Sales",
          })}
          onClick={() => setSelectedTab("Sales")}
        >
          Sales
        </button>
      </section>
      <DateRangePicker />
      {selectedTab === "Overview" && <Overview />}
      {selectedTab === "Sales" && <PaymentSales />}
    </main>
  );
};

const MemoPayments = memo(Payments);
export default MemoPayments;
