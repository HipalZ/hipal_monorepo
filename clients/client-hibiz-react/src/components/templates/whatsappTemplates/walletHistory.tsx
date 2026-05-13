import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp from "@/components/store/useWhatsapp";
import { useWalletBalance } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay, startOfMonth, subDays } from "date-fns";
import { motion } from "framer-motion";
import { memo, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { FiCalendar, FiCheckCircle, FiCopy, FiXCircle } from "react-icons/fi";

type PresetKey = "all" | "last7" | "last30" | "thisMonth" | "custom";

const presets: { key: PresetKey; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "custom", label: "Custom" },
];

const computeRange = (
  preset: PresetKey,
  customStart: Date | null,
  customEnd: Date | null,
): { from?: number; to?: number } => {
  const now = new Date();
  switch (preset) {
    case "last7":
      return {
        from: startOfDay(subDays(now, 6)).getTime(),
        to: endOfDay(now).getTime(),
      };
    case "last30":
      return {
        from: startOfDay(subDays(now, 29)).getTime(),
        to: endOfDay(now).getTime(),
      };
    case "thisMonth":
      return {
        from: startOfDay(startOfMonth(now)).getTime(),
        to: endOfDay(now).getTime(),
      };
    case "custom": {
      if (customStart && customEnd) {
        return {
          from: startOfDay(customStart).getTime(),
          to: endOfDay(customEnd).getTime(),
        };
      }
      return {};
    }
    default:
      return {};
  }
};

const fmtINR = (n: number | undefined) =>
  `₹${(Math.abs(n ?? 0)).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied"),
    () => toast.error("Copy failed"),
  );
};

const MemoWalletHistory = () => {
  const walletHistory = useWhatsapp((s) => s.walletHistory);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { getWalletHistory } = useWalletBalance();

  const [preset, setPreset] = useState<PresetKey>("all");
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const range = useMemo(
    () => computeRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  );

  const { isFetching } = useQuery({
    queryKey: ["walletHistory", businessId, range.from, range.to],
    queryFn: () => getWalletHistory({ from: range.from, to: range.to }),
    enabled: !!businessId,
  });

  const totals = useMemo(() => {
    let credited = 0;
    let charged = 0;
    let tax = 0;
    for (const t of walletHistory) {
      // Anything that isn't a hard FAILED row really moved money:
      // Razorpay SUCCESS rows AND legacy manual-credit rows (no status).
      if (t.status === "FAILED") continue;
      credited += t.amountCredited ?? 0;
      charged += t.amountCharged ?? 0;
      tax += t.taxAmount ?? 0;
    }
    return { credited, charged, tax };
  }, [walletHistory]);

  return (
    <div className="h-full max-h-screen overflow-y-auto bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Wallet History</h2>
          <div className="text-sm text-gray-600">
            <span className="mr-3">
              Credited: <span className="font-semibold text-green-600">{fmtINR(totals.credited)}</span>
            </span>
            <span className="mr-3">
              Paid: <span className="font-semibold">{fmtINR(totals.charged)}</span>
            </span>
            <span>
              GST: <span className="font-semibold">{fmtINR(totals.tax)}</span>
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPreset(p.key)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  preset === p.key
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
            {preset === "custom" && (
              <div className="flex flex-wrap items-center gap-2 pl-1">
                <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                  <FiCalendar className="text-gray-400" />
                  <DatePicker
                    selected={customStart}
                    onChange={(d) => setCustomStart(d)}
                    selectsStart
                    startDate={customStart}
                    endDate={customEnd}
                    maxDate={customEnd ?? new Date()}
                    placeholderText="Start"
                    dateFormat="dd MMM yyyy"
                    className="w-28 bg-transparent text-xs outline-none"
                  />
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1">
                  <FiCalendar className="text-gray-400" />
                  <DatePicker
                    selected={customEnd}
                    onChange={(d) => setCustomEnd(d)}
                    selectsEnd
                    startDate={customStart}
                    endDate={customEnd}
                    minDate={customStart ?? undefined}
                    maxDate={new Date()}
                    placeholderText="End"
                    dateFormat="dd MMM yyyy"
                    className="w-28 bg-transparent text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isFetching && walletHistory.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
        )}

        {!isFetching && walletHistory.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center">
            <p className="text-sm text-gray-500">
              No transactions in this range.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Recharge the wallet and your history will appear here.
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {walletHistory.map((t, idx) => {
            const isFailed = t.status === "FAILED";
            // Rows from the legacy `/wallet/credit` endpoint have no status
            // and no order_id, but a credited amount. Treat as a manual
            // credit rather than mislabeling them as failed.
            const isManualCredit = !t.status && !t.order_id?._id;
            const isSuccess = !isFailed;
            const businessName =
              typeof t.businessId === "object" ? t.businessId?.name : undefined;
            const payerName = t.userId?.name || "—";
            const payerEmail = t.userId?.email;
            const razorpayPaymentId = t.payment?.razorpayPaymentId;
            const method = t.payment?.mode;
            const titleText = isFailed
              ? "Payment failed"
              : isManualCredit
                ? "Manual credit"
                : "Wallet credited";

            return (
              <motion.li
                key={t._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isSuccess
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isSuccess ? (
                        <FiCheckCircle size={22} />
                      ) : (
                        <FiXCircle size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {titleText}
                        {businessName && (
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            · {businessName}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(t.date), "dd MMM yyyy, hh:mm a")}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Paid by{" "}
                        <span className="font-medium text-gray-800">
                          {payerName}
                        </span>
                        {payerEmail && (
                          <span className="text-gray-400"> · {payerEmail}</span>
                        )}
                      </p>
                      {!isSuccess && t.errorDescription && (
                        <p className="mt-1 text-xs text-red-500">
                          {t.errorDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        isFailed ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isFailed
                        ? fmtINR(t.amountCharged)
                        : `+${fmtINR(t.amountCredited)}`}
                    </p>
                    {!isFailed &&
                      (t.taxAmount ?? 0) > 0 &&
                      (t.amountCharged ?? 0) > (t.amountCredited ?? 0) && (
                        <p className="text-[11px] text-gray-500">
                          Paid {fmtINR(t.amountCharged)} · GST{" "}
                          {fmtINR(t.taxAmount)}
                        </p>
                      )}
                    {isFailed && (
                      <p className="text-[11px] text-red-500">attempted</p>
                    )}
                  </div>
                </div>

                {(razorpayPaymentId || method) && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">
                    {method && (
                      <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-gray-200">
                        {method.toUpperCase()}
                      </span>
                    )}
                    {razorpayPaymentId && (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        {razorpayPaymentId}
                        <button
                          type="button"
                          onClick={() => copyText(razorpayPaymentId)}
                          className="rounded p-1 hover:bg-gray-200"
                          title="Copy payment id"
                        >
                          <FiCopy size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const WalletHistory = memo(MemoWalletHistory);
export default WalletHistory;
