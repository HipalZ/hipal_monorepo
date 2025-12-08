// components/templates/payment/UnifiedSalesDashboard.tsx

import useBusinessData from "@/components/store/useBusinessData";
import useTimings from "@/components/store/useTimings";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { RefreshButton } from "@/components/atom/RefreshButton";
import ExecutiveUnifiedReportButton from "@/components/templates/payment/ExecutiveUnifiedReportButton";
import type { UnifiedDashboardCore } from "@/components/types/paymentTypes";
import {
  AlertTriangle,
  Gift,
  IndianRupee,
  Percent,
  SlidersHorizontal,
  Split,
} from "lucide-react";

import { useKotStore } from "@/components/store/useKotStore";
import { TableKotPopUp } from "@/components/templates/payment/KotPopUp";
import { useTablesKotMutation } from "@/hooks/useAllRunningTable";
import toast from "react-hot-toast";
import { useIsTodayBillRange } from "@/hooks/useIsTodayBillRange";

type BreakdownDirection = "positive" | "negative" | "neutral";

type BreakdownItem = {
  label: string;
  value: number;
  direction?: BreakdownDirection;
};

type MetricCardProps = {
  title: string;
  subtitle?: string;
  value: number;
  prefix?: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "danger" | "muted";
  breakdown?: BreakdownItem[];
  /** Optional extra action button(s) in the card header (e.g., "View all KOT") */
  action?: React.ReactNode;
};

/**
 * Utility: format currency in ₹ with Indian locale
 */
const formatCurrency = (val: number) => {
  const abs = Math.abs(val);
  return abs.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

const getToneClasses = (tone: MetricCardProps["tone"] = "default") => {
  switch (tone) {
    case "success":
      return {
        ring: "ring-emerald-100",
        bar: "from-emerald-500 via-emerald-400 to-emerald-300",
        value: "text-emerald-700",
      };
    case "danger":
      return {
        ring: "ring-red-100",
        bar: "from-red-500 via-red-400 to-red-300",
        value: "text-red-700",
      };
    case "muted":
      return {
        ring: "ring-slate-100",
        bar: "from-slate-400 via-slate-300 to-slate-200",
        value: "text-slate-800",
      };
    default:
      return {
        ring: "ring-indigo-100",
        bar: "from-indigo-500 via-sky-500 to-cyan-400",
        value: "text-slate-900",
      };
  }
};

const MetricCard = ({
  title,
  subtitle,
  value,
  prefix = "₹",
  icon,
  tone = "default",
  breakdown,
  action,
}: MetricCardProps) => {
  const toneClasses = getToneClasses(tone);
  const hasBreakdown = breakdown && breakdown.length > 0;

  const mainIsNegative = value < 0;
  const mainColor =
    tone === "danger"
      ? "text-red-700"
      : tone === "success"
        ? "text-emerald-700"
        : "text-slate-900";

  const mainDisplay =
    prefix && prefix === "₹"
      ? `${mainIsNegative ? "-" : ""}${prefix}${formatCurrency(value)}`
      : `${mainIsNegative ? "-" : ""}${prefix}${formatCurrency(value)}`;

  return (
    <Card
      className={`border-border/70 relative flex h-full flex-col overflow-hidden border bg-white/90 shadow-sm ring-1 ${toneClasses.ring}`}
    >
      {/* small coloured line */}
      <div className={`h-1 w-full bg-gradient-to-r ${toneClasses.bar}`} />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500/90">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
              {icon}
            </div>
          )}

          {action}

          {hasBreakdown && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="text-primary ml-1 h-8 w-8 bg-white p-0 hover:bg-slate-50"
                  variant="outline"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-base font-semibold">
                    {title} – Detailed Breakdown
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500">
                    Positive values are shown in{" "}
                    <span className="font-semibold text-emerald-600">
                      green
                    </span>
                    , deductions/discounts in{" "}
                    <span className="font-semibold text-red-600">
                      red with a minus sign
                    </span>
                    .
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-slate-50/90 p-3">
                    <p className="text-xs font-medium text-slate-500">Total</p>
                    <p className={`mt-1 text-2xl font-semibold ${mainColor}`}>
                      {mainDisplay}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {breakdown!.map((item, idx) => {
                      const dir: BreakdownDirection =
                        item.direction || "positive";
                      const isNeg = dir === "negative";
                      const isNeutral = dir === "neutral";

                      const colorClass = isNeutral
                        ? "text-slate-700"
                        : isNeg
                          ? "text-red-600"
                          : "text-emerald-600";

                      const sign = isNeutral ? "" : isNeg ? "-" : "+";

                      // labels that are counts (not ₹)
                      const isCountLabel = ["order", "guest", "table"].some(
                        (k) => item.label.toLowerCase().includes(k),
                      );

                      return (
                        <div
                          key={`${item.label}-${idx}`}
                          className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2"
                        >
                          <span className="text-xs font-medium text-slate-600">
                            {item.label}
                          </span>
                          <span
                            className={`text-sm font-semibold ${colorClass}`}
                          >
                            {isCountLabel
                              ? `${item.value}`
                              : `${sign}₹${formatCurrency(item.value)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between pb-4">
        <div className="mt-1">
          <p className={`text-2xl font-bold leading-tight ${mainColor}`}>
            {mainDisplay}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const MemoUnifiedSalesDashboard = () => {
  const business = useBusinessData((s) => s.businessData);
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const isTodayRange = useIsTodayBillRange(timeStampStart, timeStampEnd);

  const open = useKotStore((s) => s.open);
  const setOpen = useKotStore((s) => s.setOpen);
  const setSelectedTableId = useKotStore((s) => s.setSelectedTableId);

  const { mutateAsync: fetchTablesKot, isPending: isKotPending } =
    useTablesKotMutation();

  const fetchUnifiedDashboard = async (): Promise<UnifiedDashboardCore> => {
    const res = await apiRpc.payments[":id"].unified_sales_dashboard.$get({
      query: {
        businessId: business?._id,
        from: String(timeStampStart),
        to: String(timeStampEnd),
      },
      param: {
        id: business?._id || "",
      },
    });
    return handleEnvelope<UnifiedDashboardCore>(res);
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    UnifiedDashboardCore,
    Error
  >({
    queryKey: [
      "unifiedSalesDashboard",
      business?._id,
      timeStampStart,
      timeStampEnd,
    ],
    queryFn: fetchUnifiedDashboard,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const invoiceRangeText = useMemo(() => {
    if (!data) return "";
    const { start, end } = data.invoiceRange;
    if (!start && !end) return "No invoices in this range";
    if (start === end) return `Invoice #${start}`;
    return `Invoices ${start} → ${end}`;
  }, [data]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[69rem] space-y-4 px-3 py-6 sm:px-4">
        <Card className="h-40 animate-pulse bg-slate-100/70" />
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="h-32 animate-pulse bg-slate-100/70" />
          <Card className="h-32 animate-pulse bg-slate-100/70" />
          <Card className="h-32 animate-pulse bg-slate-100/70" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-[69rem] px-3 py-6 sm:px-4">
        <Card className="flex h-40 items-center justify-center border-dashed">
          <CardContent className="text-center">
            <p className="text-sm font-medium text-slate-500">
              No sales data found for the selected range.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    paidAll,
    paidNormal,
    runningTables,
    duesSettlements,
    discountSummary,
    rewardsSummary,
    duesSummary,
    taxesSummary,
  } = data;

  const hasDues =
    duesSummary.duesGiven > 0 ||
    duesSummary.duesOutstanding > 0 ||
    duesSummary.ordersPending > 0;

  // ====== SECTION 1: SALES SUMMARY ======
  const totalSalesValue = paidAll.totals.netAfterDiscountAndCharges;
  const grossSubtotal = paidAll.totals.grossSubtotal;
  const totalOrdersPaid = paidAll.totals.ordersCount;
  const totalPaxPaid = paidAll.totals.paxCount;
  const normalRevenue = paidNormal.totals.netAfterDiscountAndCharges;
  const duesSettleRevenue = duesSettlements.totals.netAfterDiscountAndCharges;

  const salesMainBreakdown: BreakdownItem[] = [
    {
      label: "Gross Subtotal",
      value: grossSubtotal,
      direction: "positive",
    },
    {
      label: "Discounts (incl. NPC & Complementary)",
      value: discountSummary.onPaid.total,
      direction: "negative",
    },
    {
      label: "Tax",
      value: taxesSummary.onPaid.tax,
      direction: "positive",
    },
    {
      label: "Service Charge",
      value: taxesSummary.onPaid.serviceCharge,
      direction: "positive",
    },
    {
      label: "Tips",
      value: taxesSummary.onPaid.tip,
      direction: "positive",
    },
    {
      label: "Round Off",
      value: paidAll.roundOff.value,
      direction: `${
        paidAll.roundOff.type === "positive" ? "positive" : "negative"
      }`,
    },
    {
      label: "Paid Orders",
      value: totalOrdersPaid,
      direction: "neutral",
    },
    {
      label: "Total Guests",
      value: totalPaxPaid,
      direction: "neutral",
    },
  ];

  const salesSplitBreakdown: BreakdownItem[] = [
    {
      label: "Normal Settlements",
      value: normalRevenue,
      direction: "positive",
    },
    {
      label: "Dues Settlements",
      value: duesSettleRevenue,
      direction: "positive",
    },
  ];

  const paymentModeBreakdown: BreakdownItem[] = Object.entries(
    paidAll.paymentModes,
  ).map(([mode, amount]) => ({
    label:
      mode === "online"
        ? "Online"
        : mode.charAt(0).toUpperCase() + mode.slice(1),
    value: amount,
    direction: "positive",
  }));

  // ===== RUNNING TABLES SUMMARY =====
  const runningTablesValue = runningTables?.totalActiveTableValue ?? 0;
  const hasRunningTables = !!runningTables && runningTables.tables.length > 0;

  const runningTablesBreakdown: BreakdownItem[] = runningTables
    ? [
        {
          label: "Active Tables",
          value: runningTables.tables.length,
          direction: "neutral",
        },
        ...runningTables.tables.map((t) => ({
          label: t.name,
          value: t.amount,
          direction: "positive" as BreakdownDirection,
        })),
      ]
    : [];

  const handleViewAllTableKot = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!runningTables || runningTables.tables.length === 0) {
      toast.error("No active tables found");
      return;
    }

    const tableIds = runningTables.tables.map((t) => t.id);
    setOpen(true);

    try {
      const res = await fetchTablesKot({ tableIds });
      if (res && res.length) {
        setSelectedTableId(res[0].tableId);
      }
    } catch (err) {
      console.error("Error fetching KOT data for tables:", err);
      toast.error("Failed to load KOT data");
    }
  };

  const runningTablesAction = hasRunningTables ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="ml-1 h-7 rounded-full px-2 text-[10px] font-semibold"
      onClick={handleViewAllTableKot}
      disabled={isKotPending}
      title="View all table KOT"
    >
      {isKotPending && (
        <span className="mr-1 inline-flex h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />
      )}
      View all KOT
    </Button>
  ) : null;

  // ====== SECTION 2: DUES SUMMARY ======
  const duesBreakdown: BreakdownItem[] = [
    {
      label: "Dues Given",
      value: duesSummary.duesGiven,
      direction: "negative",
    },
    {
      label: "Dues Recovered (Settled)",
      value: duesSummary.duesGetBack,
      direction: "positive",
    },
    {
      label: "Pending Dues",
      value: duesSummary.duesOutstanding,
      direction: duesSummary.duesOutstanding > 0 ? "negative" : "neutral",
    },
    {
      label: "Pending Dues Orders",
      value: duesSummary.ordersPending,
      direction: "neutral",
    },
  ];

  // ====== SECTION 3: DISCOUNTS & REWARDS ======
  const paidDiscounts = discountSummary.onPaid;
  const duesDiscounts = discountSummary.onDues;

  const discountPaidBreakdown: BreakdownItem[] = [
    {
      label: "Manual Discount",
      value: paidDiscounts.manual,
      direction: "negative",
    },
    {
      label: "Coins Used",
      value: paidDiscounts.coinsUsed,
      direction: "negative",
    },
    {
      label: "Coupon Discount",
      value: paidDiscounts.coupon,
      direction: "negative",
    },
    {
      label: "NPC (as Discount)",
      value: paidDiscounts.npcAsDiscount,
      direction: "negative",
    },
    {
      label: "Complementary",
      value: paidDiscounts.compAsDiscount,
      direction: "negative",
    },
  ];

  const discountDuesBreakdown: BreakdownItem[] = [
    {
      label: "Manual Discount on Dues",
      value: duesDiscounts.manual,
      direction: "negative",
    },
    {
      label: "Coins Used on Dues",
      value: duesDiscounts.coinsUsed,
      direction: "negative",
    },
    {
      label: "Coupon Discount on Dues",
      value: duesDiscounts.coupon,
      direction: "negative",
    },
    {
      label: "NPC on Dues (as Discount)",
      value: duesDiscounts.npcAsDiscount,
      direction: "negative",
    },
    {
      label: "Complementary on Dues",
      value: duesDiscounts.compAsDiscount,
      direction: "negative",
    },
  ];

  const rewardsAll = rewardsSummary.all;
  const rewardsBreakdown: BreakdownItem[] = [
    {
      label: "Coins Given on Paid",
      value: rewardsSummary.onPaid.coinsGiven,
      direction: "negative",
    },
    {
      label: "Coins Given on Dues",
      value: rewardsSummary.onDues.coinsGiven,
      direction: "negative",
    },
  ];

  // ====== SECTION 4: TAXES & SERVICE ======
  const taxesAll = taxesSummary.all;
  const taxesPaid = taxesSummary.onPaid;
  const taxesDues = taxesSummary.onDues;

  const taxesBreakdown: BreakdownItem[] = [
    {
      label: "GST on Paid",
      value: taxesPaid.tax,
      direction: "positive",
    },
    {
      label: "Service Charge on Paid",
      value: taxesPaid.serviceCharge,
      direction: "positive",
    },
    {
      label: "Tips on Paid",
      value: taxesPaid.tip,
      direction: "positive",
    },
    {
      label: "GST on Dues",
      value: taxesDues.tax,
      direction: "positive",
    },
    {
      label: "Service Charge on Dues",
      value: taxesDues.serviceCharge,
      direction: "positive",
    },
    {
      label: "Tips on Dues",
      value: taxesDues.tip,
      direction: "positive",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[69rem] space-y-5 px-3 py-4 sm:px-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            <span>Unified Sales Overview</span>
            <RefreshButton
              isLoading={isFetching}
              onClick={(e) => {
                e.preventDefault();
                refetch();
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            />
          </h2>
          <p className="text-xs font-medium text-slate-500/90">
            {business?.name || "My Business"} · {invoiceRangeText}
          </p>
        </div>

        {data && (
          <ExecutiveUnifiedReportButton
            businessName={business?.name || "My Business"}
            from={timeStampStart}
            to={timeStampEnd}
            core={data}
          />
        )}
      </motion.header>

      {/* SECTION 1 – SALES SUMMARY */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          1. Sales Summary
        </h3>
        <div className="grid gap-4 md:grid-cols-6">
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <MetricCard
              title={`Total Sales (Paid – ${totalOrdersPaid} orders)`}
              subtitle="Gross subtotal – discounts + GST + service + tips"
              value={totalSalesValue}
              icon={<IndianRupee className="h-4 w-4 text-slate-700" />}
              tone="default"
              breakdown={salesMainBreakdown}
            />
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            <MetricCard
              title="Sales Split"
              subtitle="Normal vs Dues settlements"
              value={normalRevenue + duesSettleRevenue}
              icon={<Split className="h-4 w-4 text-slate-700" />}
              tone="muted"
              breakdown={salesSplitBreakdown}
            />
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.11 }}
          >
            <MetricCard
              title="By Payment Mode"
              subtitle="Cash / Card / UPI / Online"
              value={Object.values(paidAll.paymentModes).reduce(
                (sum, v) => sum + v,
                0,
              )}
              icon={<IndianRupee className="h-4 w-4 text-slate-700" />}
              tone="muted"
              breakdown={paymentModeBreakdown}
            />
          </motion.div>

          {hasRunningTables && isTodayRange && (
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.14 }}
            >
              <MetricCard
                title="Running Tables"
                subtitle={
                  hasRunningTables
                    ? `${runningTables.tables.length} active table${
                        runningTables.tables.length > 1 ? "s" : ""
                      }`
                    : "No active tables"
                }
                value={runningTablesValue}
                icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                tone="muted"
                breakdown={runningTablesBreakdown} // 👈 now table-name + amount
                action={runningTablesAction} // your "View all KOT" button
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 2 – DUES SUMMARY */}
      {hasDues && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            2. Dues Summary
          </h3>
          <div className="grid gap-4 md:grid-cols-12">
            <motion.div
              className="md:col-span-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <MetricCard
                title="Dues – Net Position"
                subtitle="Given vs recovered vs outstanding"
                value={duesSummary.duesOutstanding}
                icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                tone={duesSummary.duesOutstanding > 0 ? "danger" : "muted"}
                breakdown={duesBreakdown}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* SECTION 3 – DISCOUNTS & REWARDS */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          3. Discounts & Rewards Summary
        </h3>
        <div className="grid gap-4 md:grid-cols-12">
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <MetricCard
              title="Discounts on Paid"
              subtitle="Manual + coins + coupon + NPC + complementary"
              value={-discountSummary.onPaid.total}
              icon={<Percent className="h-4 w-4 text-slate-700" />}
              tone="danger"
              breakdown={discountPaidBreakdown}
            />
          </motion.div>

          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            <MetricCard
              title="Discounts on Dues"
              subtitle="Dues bills discount view"
              value={-discountSummary.onDues.total}
              icon={<Percent className="h-4 w-4 text-slate-700" />}
              tone="danger"
              breakdown={discountDuesBreakdown}
            />
          </motion.div>

          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.11 }}
          >
            <MetricCard
              title="Rewards (Coins Given)"
              subtitle="Total coins issued as rewards"
              value={rewardsAll.coinsGiven}
              icon={<Gift className="h-4 w-4 text-slate-700" />}
              tone="muted"
              breakdown={rewardsBreakdown}
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 – TAXES & SERVICE */}
      <section className="space-y-3 pb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          4. Taxes & Service Summary
        </h3>
        <div className="grid gap-4 md:grid-cols-12">
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <MetricCard
              title="GST + Service + Tips (All)"
              subtitle="On paid + dues"
              value={taxesAll.tax + taxesAll.serviceCharge + taxesAll.tip}
              icon={<AlertTriangle className="h-4 w-4 text-slate-700" />}
              tone="muted"
              breakdown={taxesBreakdown}
            />
          </motion.div>
        </div>
      </section>

      {/* KOT history popup */}
      {open && (
        <TableKotPopUp runningTablesBreakdown={runningTablesBreakdown} />
      )}
    </div>
  );
};

const UnifiedSalesDashboard = memo(MemoUnifiedSalesDashboard);
export default UnifiedSalesDashboard;
