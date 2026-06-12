import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useSummarizedPeopleData } from "@/hooks/usePeopleData";
import {
  freshnessLabel,
  useCampaignConversion,
  useVisitAnalytics,
} from "@/hooks/useVisitAnalytics";
import { format } from "date-fns";
import { memo, useMemo, useState } from "react";
import { LiaThumbsDown } from "react-icons/lia";
import { PiThumbsUp } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useBusinessData from "../../store/useBusinessData";
import DateRangePicker from "./dateRangePicker";

const fmt = (n?: number) => (n ?? 0).toLocaleString("en-IN");

const SOURCE_LABELS: Record<string, string> = {
  TABLE_QR: "Table QR",
  CHECK_IN_QR: "Check-in QR",
  ROOM_QR: "Room QR",
  COUPON_QR: "Coupon QR",
  APP_OPEN: "App open",
  SIGN_IN: "Sign-in",
  PAYMENT: "Payment",
  POS: "POS",
  BACKFILL: "WhatsApp history",
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-xl border border-black/[0.06] bg-white px-5 py-4 ${className}`}
  >
    {children}
  </section>
);

const CardTitle = ({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) => (
  <div className="mb-4 flex items-start justify-between">
    <div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
    {right}
  </div>
);

const Metric = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="rounded-xl bg-white p-4">
    <p className="text-[13px] text-gray-500">{label}</p>
    <p className="mt-1.5 text-2xl font-medium leading-none tracking-tight text-gray-900 tabular-nums">
      {value}
    </p>
    <p className="mt-1.5 text-xs text-gray-400">{sub}</p>
  </div>
);

const MemoSummary = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { peopleData } = useHiPeopleStore();
  const {
    openDatePickerModal,
    setOpenDatePickerModal,
    dateInTimeStamp,
    dateRange,
  } = useHiPeopleStore((state) => ({
    dateRange: state.dateRange,
    setOpenDatePickerModal: state.setOpenDatePickerModal,
    openDatePickerModal: state.openDatePickerModal,
    dateInTimeStamp: state.dateInTimeStamp,
  }));

  const [showStaff, setShowStaff] = useState(false);

  const [from, to] = dateRange;
  const formattedFrom = from ? format(from, "dd MMM yyyy") : "";
  const formattedTo = to ? format(to, "dd MMM yyyy") : "";

  const { isLoading: reviewsLoading } = useSummarizedPeopleData(
    dateInTimeStamp.from,
    dateInTimeStamp.to,
  );

  const { data: analytics, isLoading: analyticsLoading } = useVisitAnalytics(
    businessId,
    dateInTimeStamp.from || undefined,
    dateInTimeStamp.to || undefined,
  );
  const { data: campaignData } = useCampaignConversion(businessId);

  const trend = useMemo(() => {
    if (!analytics?.dailyTrend?.length) return [];
    if (analytics.dailyTrend.length <= 45) {
      return analytics.dailyTrend.map((d) => ({
        label: format(new Date(d.day), "dd MMM"),
        visits: d.visits,
      }));
    }
    const byMonth = new Map<string, number>();
    for (const d of analytics.dailyTrend) {
      const month = d.day.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + d.visits);
    }
    return [...byMonth.entries()].sort().map(([m, visits]) => ({
      label: format(new Date(`${m}-01`), "MMM yy"),
      visits,
    }));
  }, [analytics?.dailyTrend]);

  const visibleTopVisitors = useMemo(
    () =>
      (analytics?.topVisitors ?? []).filter((v) => showStaff || !v.isStaff),
    [analytics?.topVisitors, showStaff],
  );

  const hasStaffInTop = (analytics?.topVisitors ?? []).some((v) => v.isStaff);
  const maxFreq = Math.max(
    ...(analytics?.frequencyDistribution?.map((x) => x.customers) ?? [1]),
    1,
  );

  if (analyticsLoading && reviewsLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  const audience = analytics?.audience;
  const summary = analytics?.summary;
  const overlapTotal =
    (audience?.subscribedAndVisited ?? 0) +
    (audience?.subscribedNeverVisited ?? 0) +
    (audience?.visitedNotSubscribed ?? 0);

  const noDataYet =
    (audience?.totalCustomers ?? 0) === 0 &&
    (audience?.subscribersTotal ?? 0) === 0;

  return (
    <div className="mx-auto max-w-[58rem] rounded-2xl bg-[#F5F4F0] px-4 pb-8 lg:px-6">
      <div className="flex items-end justify-between pb-5 pt-6">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-gray-900">
            Summary
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            {formattedFrom && formattedTo
              ? `${formattedFrom} – ${formattedTo}`
              : "Last 90 days"}
            {analytics?.generatedAt
              ? ` · ${freshnessLabel(analytics.generatedAt)}`
              : ""}
          </p>
        </div>
        <button
          onClick={() => setOpenDatePickerModal(true)}
          type="button"
          className="flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <SlCalender size={13} /> Change period
        </button>
      </div>

      {noDataYet ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-500">
            Visit tracking is active — data appears here as customers scan,
            sign in and visit.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              label="Subscribers"
              value={fmt(audience?.subscribersTotal)}
              sub="on your WhatsApp list"
            />
            <Metric
              label="Customers"
              value={fmt(audience?.totalCustomers)}
              sub="visited at least once"
            />
            <Metric
              label="Repeat visitors"
              value={fmt(summary?.returningVisitors)}
              sub={`${summary?.repeatRate ?? 0}% came back`}
            />
            <Metric
              label="Visits in period"
              value={fmt(summary?.totalVisits)}
              sub={`${fmt(summary?.uniqueVisitors)} unique visitors`}
            />
          </div>

          {overlapTotal > 0 && (
            <Card>
              <CardTitle
                title="Audience overlap"
                sub="how subscribers and customers relate"
              />
              <div className="flex h-2.5 overflow-hidden rounded-full">
                <div
                  className="bg-[#1D9E75]"
                  style={{
                    width: `${((audience?.subscribedAndVisited ?? 0) / overlapTotal) * 100}%`,
                  }}
                />
                <div
                  className="bg-[#9FE1CB]"
                  style={{
                    width: `${((audience?.subscribedNeverVisited ?? 0) / overlapTotal) * 100}%`,
                  }}
                />
                <div
                  className="bg-[#C7C3F0]"
                  style={{
                    width: `${((audience?.visitedNotSubscribed ?? 0) / overlapTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[#1D9E75]" />
                  Subscribed + visited
                  <span className="font-medium text-gray-900 tabular-nums">
                    {fmt(audience?.subscribedAndVisited)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[#9FE1CB]" />
                  Subscribed, never visited
                  <span className="font-medium text-gray-900 tabular-nums">
                    {fmt(audience?.subscribedNeverVisited)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[#C7C3F0]" />
                  Visited, not subscribed
                  <span className="font-medium text-gray-900 tabular-nums">
                    {fmt(audience?.visitedNotSubscribed)}
                  </span>
                </span>
              </div>
            </Card>
          )}

          {trend.length >= 2 && (
            <Card>
              <CardTitle title="Visit trend" />
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#f3f4f6"
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        boxShadow: "none",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#0F6E56"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {(analytics?.frequencyDistribution?.length ?? 0) > 0 && (
              <Card>
                <CardTitle
                  title="Visit frequency"
                  sub="how often customers return"
                />
                <div className="space-y-2.5">
                  {analytics?.frequencyDistribution.map((b) => (
                    <div key={b.bucket} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-xs text-gray-500">
                        {b.bucket}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-[#1D9E75]"
                          style={{
                            width: `${Math.max((b.customers / maxFreq) * 100, 1.5)}%`,
                          }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-xs font-medium text-gray-900 tabular-nums">
                        {fmt(b.customers)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {audience && (
              <Card>
                <CardTitle
                  title="Reach & opportunity"
                  sub="who you can bring back"
                />
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5">
                    <span className="text-xs text-gray-500">
                      Reachable on WhatsApp
                    </span>
                    <span className="text-sm font-medium text-gray-900 tabular-nums">
                      {fmt(audience.subscribersTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5">
                    <span className="text-xs text-gray-500">
                      Active in this period
                    </span>
                    <span className="text-sm font-medium text-gray-900 tabular-nums">
                      {fmt(summary?.uniqueVisitors)}
                    </span>
                  </div>
                  {audience.readNeverVisited > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-[#FAEEDA] px-3.5 py-2.5">
                      <span className="text-xs text-[#854F0B]">
                        Read campaigns, never visited
                        <span className="ml-1.5 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium">
                          win-back
                        </span>
                      </span>
                      <span className="text-sm font-medium text-[#633806] tabular-nums">
                        {fmt(audience.readNeverVisited)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {(campaignData?.campaigns?.length ?? 0) > 0 && (
            <Card>
              <CardTitle
                title="Campaigns that brought people back"
                sub={`read the campaign → visited within ${campaignData?.windowDays} days`}
              />
              <div className="space-y-4">
                {campaignData?.campaigns.slice(0, 5).map((cmp) => (
                  <div key={cmp.campaignId}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] font-medium capitalize text-gray-900">
                        {cmp.campaignName}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                        {fmt(cmp.reads)} read ·{" "}
                        <span className="font-medium text-[#0F6E56]">
                          {fmt(cmp.returnedWithinWindow)} returned
                        </span>{" "}
                        · {cmp.conversionRate}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-[#1D9E75]"
                        style={{
                          width: `${Math.min(Math.max(cmp.conversionRate, 1), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(analytics?.topVisitors?.length ?? 0) > 0 && (
            <Card>
              <CardTitle
                title="Top visitors"
                right={
                  hasStaffInTop ? (
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400">
                      <input
                        type="checkbox"
                        checked={showStaff}
                        onChange={(e) => setShowStaff(e.target.checked)}
                        className="h-3.5 w-3.5 accent-gray-700"
                      />
                      show staff
                    </label>
                  ) : undefined
                }
              />
              <div className="divide-y divide-gray-100">
                {visibleTopVisitors.slice(0, 8).map((v) => (
                  <div key={v.userId} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                        v.isStaff
                          ? "bg-[#FAEEDA] text-[#854F0B]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {(v.name ?? "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
                      {v.name ?? v.phone ?? "Customer"}
                      {v.isStaff && (
                        <span className="ml-2 rounded-full bg-[#FAEEDA] px-2 py-0.5 text-[10px] font-medium text-[#854F0B]">
                          STAFF
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-900 tabular-nums">
                      {v.visits}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        visits
                      </span>
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs text-gray-400">
                      {format(new Date(v.lastVisit), "dd MMM")}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {(analytics?.sourceBreakdown?.length ?? 0) > 0 && (
              <Card>
                <CardTitle title="Where visits come from" />
                <div className="flex flex-wrap gap-2">
                  {analytics?.sourceBreakdown.map((s) => (
                    <span
                      key={s.source}
                      className="rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-600"
                    >
                      {SOURCE_LABELS[s.source] ?? s.source}
                      <span className="ml-1.5 font-medium text-gray-900 tabular-nums">
                        {fmt(s.visits)}
                      </span>
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {peopleData?.userReviews &&
              Object.keys(peopleData.userReviews).length > 0 && (
                <Card>
                  <CardTitle title="Average reviews" />
                  <div className="space-y-2.5">
                    {Object.keys(peopleData.userReviews).map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-[13px]"
                      >
                        <span className="capitalize text-gray-600">
                          {key === "service"
                            ? "Staff and behaviour"
                            : key === "foodTaste"
                              ? "Service"
                              : key}
                        </span>
                        <span className="flex items-center gap-4 text-gray-900">
                          <span className="flex items-center gap-1 tabular-nums">
                            <PiThumbsUp size={14} className="text-gray-400" />
                            {peopleData.userReviews[key]?.likePercentage}%
                          </span>
                          <span className="flex items-center gap-1 tabular-nums">
                            <LiaThumbsDown
                              size={15}
                              className="text-gray-400"
                            />
                            {peopleData.userReviews[key]?.dislikePercentage}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          </div>

          {analytics?.lifetime?.trackedSince && (
            <p className="pt-1 text-center text-[11px] text-gray-400">
              Visit tracking since{" "}
              {format(new Date(analytics.lifetime.trackedSince), "dd MMM yyyy")}{" "}
              · {fmt(analytics.lifetime.totalVisits)} visits ·{" "}
              {fmt(analytics.lifetime.uniqueVisitors)} people lifetime
            </p>
          )}
        </div>
      )}

      {openDatePickerModal && (
        <PopUp
          show={openDatePickerModal}
          onClose={() => setOpenDatePickerModal(false)}
          width="w-[30rem]"
          height="h-[30rem]"
        >
          <section className="h-[75vh]">
            <DateRangePicker />
          </section>
        </PopUp>
      )}
    </div>
  );
};

const Summary = memo(MemoSummary);

export default Summary;
