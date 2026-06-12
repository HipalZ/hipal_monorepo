import LoadingSpinner from "@/components/atom/loadingSpinner";
import { apiRpc } from "@hi/common";
import {
  freshnessLabel,
  useCampaignConversion,
  useVisitAnalytics,
} from "@/hooks/useVisitAnalytics";
import { format } from "date-fns";
import { memo, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

const InsightRow = ({
  label,
  description,
  value,
  tone = "neutral",
}: {
  label: string;
  description: string;
  value: string;
  tone?: "neutral" | "warning";
}) => (
  <div
    className={`flex items-start justify-between gap-4 rounded-lg px-3.5 py-2.5 ${
      tone === "warning" ? "bg-[#FAEEDA]" : "bg-gray-50"
    }`}
  >
    <span>
      <span
        className={`block text-xs font-medium ${
          tone === "warning" ? "text-[#854F0B]" : "text-gray-700"
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-0.5 block text-[11px] leading-4 ${
          tone === "warning" ? "text-[#9A650F]" : "text-gray-400"
        }`}
      >
        {description}
      </span>
    </span>
    <span
      className={`shrink-0 text-sm font-medium tabular-nums ${
        tone === "warning" ? "text-[#633806]" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const MemoSummary = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [showStaff, setShowStaff] = useState(false);
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } =
    useVisitAnalytics(businessId);
  const { data: campaignData } = useCampaignConversion(businessId);
  const { data: hasWhatsAppConfig, isLoading: whatsappConfigLoading } =
    useQuery({
      queryKey: ["summary-whatsapp-config", businessId],
      enabled: Boolean(businessId),
      staleTime: 5 * 60 * 1000,
      retry: false,
      queryFn: async () => {
        const res = await apiRpc.whatsapp.whatsapp_config[":businessId"].$get({
          param: { businessId: businessId as string },
        });
        const payload = await res.json();
        return res.ok && payload.err === false;
      },
    });

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

  if (analyticsLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  const audience = analytics?.audience;
  const businessSummary = analytics?.businessSummary;
  const summary = analytics?.summary;
  const winBackCampaigns = (campaignData?.campaigns ?? [])
    .filter((cmp) => cmp.reads > cmp.returnedWithinWindow)
    .slice(0, 3);

  const noDataYet =
    (businessSummary?.totalUsers ?? audience?.totalCustomers ?? 0) === 0 &&
    (audience?.subscribersTotal ?? 0) === 0;

  return (
    <div className="mx-auto max-w-[58rem] rounded-2xl bg-[#F5F4F0] px-4 pb-8 lg:px-6">
      <div className="flex items-end justify-between pb-5 pt-6">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-gray-900">
            Summary
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Complete business data
            {analytics?.generatedAt
              ? ` · ${freshnessLabel(analytics.generatedAt)}`
              : ""}
          </p>
        </div>
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
              label="Total users"
              value={fmt(businessSummary?.totalUsers ?? audience?.totalCustomers)}
              sub="in this business"
            />
            <Metric
              label="Recorded visits"
              value={fmt(summary?.totalVisits)}
              sub="visit events captured"
            />
            <Metric
              label="New visitors"
              value={fmt(summary?.newVisitors)}
              sub="first seen overall"
            />
          </div>

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

            {hasWhatsAppConfig && audience ? (
              <Card>
                <CardTitle
                  title="WhatsApp campaign reach"
                  sub="what your WhatsApp list can do for this business"
                />
                <div className="space-y-2.5">
                  <InsightRow
                    label="Contacts reachable on WhatsApp"
                    description="Saved WhatsApp subscribers who can receive approved campaign messages."
                    value={fmt(audience.subscribersTotal)}
                  />
                  <InsightRow
                    label="Total business users tracked"
                    description="All customer records available for this business in HiPeople."
                    value={fmt(
                      businessSummary?.totalUsers ?? audience.totalCustomers,
                    )}
                  />
                  <InsightRow
                    label="Verified app or QR visitors"
                    description="Users counted from visit events such as app open, QR scan, sign-in, payment, or POS."
                    value={fmt(summary?.uniqueVisitors)}
                  />
                  {audience.readNeverVisited > 0 && (
                    <InsightRow
                      label="Campaign readers not yet visited"
                      description={
                        winBackCampaigns.length > 0
                          ? `Seen in: ${winBackCampaigns
                              .map((cmp) => cmp.campaignName)
                              .join(", ")}`
                          : "Customers read WhatsApp campaigns but have no visit event after reading."
                      }
                      value={fmt(audience.readNeverVisited)}
                      tone="warning"
                    />
                  )}
                </div>
              </Card>
            ) : hasWhatsAppConfig === false && !whatsappConfigLoading ? (
              <Card>
                <CardTitle
                  title="Activate WhatsApp"
                  sub="bring campaigns and customer reach into this summary"
                />
                <button
                  type="button"
                  onClick={() =>
                    businessId &&
                    navigate(`/app/business/${businessId}/whatzapp`)
                  }
                  className="w-full rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                >
                  Activate WhatsApp
                </button>
              </Card>
            ) : null}
          </div>

          {(campaignData?.campaigns?.length ?? 0) > 0 && (
            <Card>
              <CardTitle
                title="Campaigns that brought people back"
                sub={`read the campaign → visited within ${campaignData?.windowDays} days`}
              />
              <div className="space-y-4">
                {campaignData?.campaigns.slice(0, 3).map((cmp) => (
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
    </div>
  );
};

const Summary = memo(MemoSummary);

export default Summary;
