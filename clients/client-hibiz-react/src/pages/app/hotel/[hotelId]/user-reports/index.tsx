import MemoizedHeader from "@/components/molecules/header";
import useTimings from "@/components/store/useTimings";
import {
    lazy,
    memo,
    Suspense,
    useState,
    useMemo,
    useEffect,
    useCallback,
} from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Download,
  Inbox,
  Phone,
  Search,
  Star,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchIndividualUserAnalytics,
  useUsersAnalyticsData,
  type AnalyticsItem,
  type IndividualUserAnalyticsData,
  type UserAnalyticsItemByUser,
} from "@/hooks/hotel/useUserData";
import useBusinessData from "@/components/store/useBusinessData";
import { UserDetails } from "@/components/hotel/hotelUsers/UserDetails";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);

type MiniUser = {
  _id?: string;
  name: string;
  phone: string;
  stays?: number;
  services?: number;
  companions?: number;
  reviews?: number;
  totalVisits?: number;
  lastVisit?: string;
  lastRoom?: string;
  status?: "In House" | "Checked out";
  topSource?: string;
};

const surface =
  "rounded-lg border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-18px_rgba(15,23,42,0.28)]";
const th =
  "border-b border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap";
const td = "border-b border-slate-100 px-3 py-3 align-middle";

const MAX_CUSTOMER_EXPORT_MONTHS = 3;

const getOrdinalDay = (day: number) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const isWithinMonthLimit = (from?: number, to?: number, months = MAX_CUSTOMER_EXPORT_MONTHS) => {
  if (!from || !to || to < from) return false;
  const maxDate = new Date(from);
  maxDate.setMonth(maxDate.getMonth() + months);
  return to <= maxDate.getTime();
};

const formatDateOnly = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
};

const formatExcelTimestamp = (timestamp?: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const day = Number(getPart("day"));
  const month = getPart("month");
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");
  const dayPeriod = getPart("dayPeriod").toUpperCase();

  return `${getOrdinalDay(day)} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
};

const escapeCsvValue = (value: unknown) => {
  const str = String(value ?? "");
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getStayDurationMinutes = (checkIn?: number, checkOut?: number) => {
  if (!checkIn || !checkOut) return "";
  return Number(((checkOut - checkIn) / 60000).toFixed(2));
};

const getStayDurationLabel = (checkIn?: number, checkOut?: number) => {
  if (!checkIn || !checkOut) return "";

  const totalMinutes = Math.max(0, Math.round((checkOut - checkIn) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    minutes || (!days && !hours) ? `${minutes}m` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

const joinUnique = (values: Array<string | undefined>) => {
  const unique = [...new Set(values.map((value) => value?.trim()).filter(Boolean))];
  return unique.join("; ");
};

const getReviewAverage = (reviews: UserAnalyticsItemByUser["reviewIds"]) => {
  if (!reviews.length) return "";
  const total = reviews.reduce((sum, review) => sum + (review.reviewRating || 0), 0);
  return Number((total / reviews.length).toFixed(2));
};

const getCompanionCountFromIds = (
  // The API returns populated objects, not bare id strings — so comparing the
  // element directly to the id always failed (object !== string) and counted the
  // guest themselves as a companion. Extract the id before comparing.
  guestUserIds?: Array<{ _id?: string } | string> | null,
  primaryUserId?: string,
) => {
  if (!guestUserIds?.length) return 0;
  return guestUserIds.filter((g) => {
    const id = typeof g === "string" ? g : g?._id;
    return id && String(id) !== String(primaryUserId);
  }).length;
};

const getCompanionGuests = (
  guests: UserAnalyticsItemByUser["guestUserIds"],
  primaryPhone?: string,
) =>
  guests.filter((guest) => {
    if (!guest?.phone) return true;
    return guest.phone !== primaryPhone;
  });

const downloadCsv = (
  filename: string,
  summaryLines: string[],
  rows: Record<string, unknown>[],
) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const summarySection = summaryLines.join("\n");
  const tableSection = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(","),
    ),
  ].join("\n");

  const csvContent = `${summarySection}\n\n${tableSection}`;
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const buildDetailedCustomerRows = (
  users: MiniUser[],
  detailsByUserId: Map<string, IndividualUserAnalyticsData>,
  fallbackItems: AnalyticsItem[],
  from: number,
  to: number,
) => {
  const fallbackByUserId = new Map<string, AnalyticsItem[]>();
  for (const item of fallbackItems) {
    const id = item?.userId?._id;
    if (!id) continue;
    fallbackByUserId.set(id, [...(fallbackByUserId.get(id) ?? []), item]);
  }

  return users.flatMap((user) => {
    const detailed = user._id ? detailsByUserId.get(user._id) : undefined;
    const stays = (detailed?.userAnalytics ?? []).filter((stay) => {
      if (!stay.checkIn) return false;
      return stay.checkIn >= from && stay.checkIn <= to;
    });

    if (!stays.length) {
      const fallbackRows = user._id ? fallbackByUserId.get(user._id) ?? [] : [];
      return fallbackRows.map((item) => ({
        "Customer Name": item?.userId?.name || user.name || "Guest",
        "Phone Number": item?.userId?.phone || user.phone || "",
        "Room No": item?.roomId?.name || "",
        Source: item?.source || "not-given",
        "Check In (IST)": formatExcelTimestamp(item?.checkIn),
        "Check Out (IST)": item?.checkOut
          ? formatExcelTimestamp(item.checkOut)
          : "",
        "Current Status": item?.checkOut ? "Checked out" : "Checked in",
        "Stay Duration": getStayDurationLabel(item?.checkIn, item?.checkOut),
        "Stay Duration (Minutes)": getStayDurationMinutes(
          item?.checkIn,
          item?.checkOut,
        ),
        "Services Used": "",
        "Services Count": item?.serviceIds?.length ?? 0,
        Companions: "",
        "Companion Count": getCompanionCountFromIds(
          item?.guestUserIds,
          item?.userId?._id,
        ),
        "Reviews Given": item?.reviewIds?.length ?? 0,
        "Average Review Rating": "",
        "Review Ratings": "",
        "Review Services": "",
        "Customer Total Reviews": "",
        "Customer Average Rating": "",
      }));
    }

    return stays.map((stay) => {
      const services = joinUnique(stay.serviceIds.map((service) => service.name));
      const companionGuests = getCompanionGuests(
        stay.guestUserIds,
        stay.userId?.phone || user.phone,
      );
      const companions = joinUnique(
        companionGuests.map((guest) =>
          guest.phone ? `${guest.name} (${guest.phone})` : guest.name,
        ),
      );
      const reviewServices = joinUnique(
        stay.reviewIds.flatMap((review) =>
          review.serviceIds.map((service) => service.name),
        ),
      );
      const reviewRatings = stay.reviewIds
        .map((review) => {
          const servicesForReview = joinUnique(
            review.serviceIds.map((service) => service.name),
          );
          return servicesForReview
            ? `${review.reviewRating} - ${servicesForReview}`
            : String(review.reviewRating);
        })
        .join("; ");

      return {
        "Customer Name": stay.userId?.name || user.name || "Guest",
        "Phone Number": stay.userId?.phone || user.phone || "",
        "Room No": stay.roomId?.name || "",
        Source: stay.source || "not-given",
        "Check In (IST)": formatExcelTimestamp(stay.checkIn),
        "Check Out (IST)": stay.checkOut
          ? formatExcelTimestamp(stay.checkOut)
          : "",
        "Current Status": stay.checkOut ? "Checked out" : "Checked in",
        "Stay Duration": getStayDurationLabel(stay.checkIn, stay.checkOut),
        "Stay Duration (Minutes)": getStayDurationMinutes(
          stay.checkIn,
          stay.checkOut,
        ),
        "Services Used": services,
        "Services Count": stay.serviceIds.length,
        Companions: companions,
        "Companion Count": companionGuests.length,
        "Reviews Given": stay.reviewIds.length,
        "Average Review Rating": getReviewAverage(stay.reviewIds),
        "Review Ratings": reviewRatings,
        "Review Services": reviewServices,
        "Customer Total Reviews": detailed?.overAll?.totalReviews ?? 0,
        "Customer Average Rating": detailed?.overAll?.averageRating ?? 0,
      };
    });
  });
};

const fetchDetailedAnalyticsForUsers = async (
  businessId: string,
  users: MiniUser[],
) => {
  const detailsByUserId = new Map<string, IndividualUserAnalyticsData>();
  const usersWithIds = users.filter(
    (user): user is MiniUser & { _id: string } => Boolean(user._id),
  );
  const concurrency = 5;

  for (let index = 0; index < usersWithIds.length; index += concurrency) {
    const batch = usersWithIds.slice(index, index + concurrency);
    const results = await Promise.allSettled(
      batch.map((user) =>
        fetchIndividualUserAnalytics({ businessId, userId: user._id }),
      ),
    );

    results.forEach((result, resultIndex) => {
      if (result.status === "fulfilled") {
        detailsByUserId.set(batch[resultIndex]._id, result.value);
      }
    });
  }

  return detailsByUserId;
};

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-yellow-200/60 text-foreground px-0.5 rounded-sm">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

const MemoUserAnalytics = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? "";
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<MiniUser | null>(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [isDownloading, setIsDownloading] = useState(false);
  const debouncedSearch = useDebounced(search, 300);

  const { isLoading, error, userAnalyticsData } = useUsersAnalyticsData({
    businessId,
    from: String(timeStampStart),
    to: String(timeStampEnd),
  });

  const analytics = userAnalyticsData?.analytics ?? [];
  const sourcePercentages = userAnalyticsData?.sourcePercentages ?? {};
  const visitCountByPhone = userAnalyticsData?.visitCountByPhone ?? {};

  const dashboardStats = useMemo(() => {
    const activeStays = analytics.filter((item) => !item.checkOut).length;
    const services = analytics.reduce(
      (sum, item) => sum + (item.serviceIds?.length ?? 0),
      0,
    );
    const companions = analytics.reduce(
      (sum, item) =>
        sum + getCompanionCountFromIds(item.guestUserIds, item.userId?._id),
      0,
    );
    const topSource =
      Object.entries(sourcePercentages).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "No source";
    const avgVisits = Object.keys(visitCountByPhone).length
      ? Math.round(
          (Object.values(visitCountByPhone).reduce((sum, count) => sum + count, 0) /
            Object.keys(visitCountByPhone).length) *
            10,
        ) / 10
      : 0;

    return {
      totalStays: analytics.length,
      activeStays,
      services,
      companions,
      topSource,
      avgVisits,
    };
  }, [analytics, sourcePercentages, visitCountByPhone]);

  const uniqueUsers = useMemo<MiniUser[]>(() => {
    const groupedUsers = new Map<string, AnalyticsItem[]>();

    for (const item of analytics) {
      const phone = item?.userId?.phone;
      if (!phone) continue;
      groupedUsers.set(phone, [...(groupedUsers.get(phone) ?? []), item]);
    }

    return Array.from(groupedUsers.entries()).map(([phone, userRows]) => {
      const firstUser = userRows[0]?.userId;
      const latestRow = [...userRows].sort((a, b) => (b.checkIn || 0) - (a.checkIn || 0))[0];
      const sourceCounts = userRows.reduce<Record<string, number>>((acc, row) => {
        const source = row.source || "not-given";
        acc[source] = (acc[source] ?? 0) + 1;
        return acc;
      }, {});

      return {
        _id: firstUser?._id,
        name: firstUser?.name ?? "Guest",
        phone,
        stays: userRows.length,
        services: userRows.reduce(
          (sum, row) => sum + (row.serviceIds?.length ?? 0),
          0,
        ),
        // Unique co-guests across all stays, excluding the guest themselves.
        // guestUserIds are populated OBJECTS, so we must dedupe by their id —
        // a Set of objects never dedupes (unique refs) and object !== id always
        // held true, which is why a solo guest wrongly showed 1 companion.
        companions: new Set(
          userRows.flatMap((row) => {
            const primaryId = row.userId?._id;
            return (row.guestUserIds ?? [])
              .map((g) => (typeof g === "string" ? g : g?._id))
              .filter((id): id is string => Boolean(id) && String(id) !== String(primaryId));
          }),
        ).size,
        reviews: userRows.reduce(
          (sum, row) => sum + (row.reviewIds?.length ?? 0),
          0,
        ),
        totalVisits: visitCountByPhone[phone] ?? userRows.length,
        lastVisit: formatExcelTimestamp(
          Math.max(...userRows.map((row) => row.checkIn || 0)),
        ),
        lastRoom: latestRow?.roomId?.name ?? "",
        status: latestRow?.checkOut ? "Checked out" : "In House",
        topSource:
          Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          "Guest User",
      };
    });
  }, [analytics, visitCountByPhone]);

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return uniqueUsers.filter((u) => {
      if (sourceFilter !== "ALL" && u.topSource !== sourceFilter) return false;
      if (!q) return true;
      const name = (u.name || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [uniqueUsers, debouncedSearch, sourceFilter]);

  const sourceOptions = useMemo(
    () => Object.keys(sourcePercentages).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [sourcePercentages],
  );

  const sourceRows = useMemo(
    () =>
      Object.entries(sourcePercentages)
        .filter(([, value]) => Number(value) > 0)
        .sort((a, b) => b[1] - a[1]),
    [sourcePercentages],
  );

  const topGuests = useMemo(
    () => [...uniqueUsers].sort((a, b) => (b.totalVisits ?? 0) - (a.totalVisits ?? 0)).slice(0, 3),
    [uniqueUsers],
  );

  const filteredAnalytics = useMemo(() => {
    const allowedPhones = new Set(filteredUsers.map((user) => user.phone));
    return analytics.filter((item) => allowedPhones.has(item?.userId?.phone));
  }, [analytics, filteredUsers]);

  const canDownloadCustomerReport = useMemo(
    () => isWithinMonthLimit(timeStampStart, timeStampEnd),
    [timeStampEnd, timeStampStart],
  );

  const customerReportRangeLabel = useMemo(
    () =>
      `${formatDateOnly(timeStampStart) || "Start date"} to ${
        formatDateOnly(timeStampEnd) || "End date"
      }`,
    [timeStampEnd, timeStampStart],
  );

  const handleDownloadCustomers = useCallback(async () => {
    try {
      if (!canDownloadCustomerReport) {
        toast.error(
          `Cannot download more than ${MAX_CUSTOMER_EXPORT_MONTHS} months of customer report data at a time.`,
        );
        return;
      }

      setIsDownloading(true);

      const sourceData = debouncedSearch.trim() ? filteredAnalytics : analytics;
      const exportUsers = debouncedSearch.trim() ? filteredUsers : uniqueUsers;
      const detailsByUserId = await fetchDetailedAnalyticsForUsers(
        businessId,
        exportUsers,
      );
      const rows = buildDetailedCustomerRows(
        exportUsers,
        detailsByUserId,
        sourceData,
        timeStampStart,
        timeStampEnd,
      );

      if (!rows.length) {
        alert("No customer data available to download.");
        return;
      }

      const sourcesSummary = Object.entries(sourcePercentages)
        .map(([source, percentage]) => `${source}: ${percentage}%`)
        .join(" | ");

      const summaryLines = [
        "HOTEL CUSTOMER ANALYTICS REPORT",
        `Total Customers: ${exportUsers.length}`,
        `Total Stay Records: ${rows.length}`,
        `Date Range: ${formatExcelTimestamp(timeStampStart)} to ${formatExcelTimestamp(timeStampEnd)}`,
        `Search Filter: ${debouncedSearch.trim() || "All customers"}`,
        `Booking Sources: ${sourcesSummary || "No source data"}`,
        `Generated At: ${formatExcelTimestamp(Date.now())}`,
        "--------------------------------------------",
      ];

      downloadCsv(`hotel_customers_${Date.now()}.csv`, summaryLines, rows);
    } catch (error) {
      console.error("Failed to download customer data:", error);
      alert("Failed to download customer data.");
    } finally {
      setIsDownloading(false);
    }
  }, [
    analytics,
    businessId,
    canDownloadCustomerReport,
    debouncedSearch,
    filteredAnalytics,
    filteredUsers,
    sourcePercentages,
    timeStampEnd,
    timeStampStart,
    uniqueUsers,
  ]);

  const goBack = useCallback(() => {
    if (selectedUser) {
      setSelectedUser(null);
      return;
    }
    navigate(-1);
  }, [navigate, selectedUser]);

  if (isLoading) {
    return (
      <main className="pb-20">
        <header className="linear_gradient_background">
          <MemoizedHeader title="User Analytics" onBack={goBack} />
        </header>
        <div className="p-6 space-y-6">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-72 w-full bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pb-20">
        <header className="linear_gradient_background">
          <MemoizedHeader title="User Analytics" />
        </header>
        <div className="p-6 text-red-500">
          {(error as Error).message || "Failed to fetch analytics."}
        </div>
      </main>
    );
  }

  if (selectedUser) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20">
        <header className="linear_gradient_background">
          <MemoizedHeader title="User Analytics" onBack={goBack} />
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <UserDetails
            user={{
              _id: selectedUser._id ?? "",
              name: selectedUser.name,
              phone: selectedUser.phone,
            }}
            businessId={businessId}
            userId={selectedUser._id ?? ""}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="User Analytics" onBack={goBack} />
      </header>

      <div className="mx-auto max-w-[1400px] space-y-4 px-4 py-5 md:px-6">
        <section className={`${surface} p-3`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Suspense fallback={<div className="p-3">Loading date picker...</div>}>
              <DateRangePicker />
            </Suspense>

            <Button
              type="button"
              size="sm"
              onClick={handleDownloadCustomers}
              disabled={isDownloading || analytics.length === 0}
              title="Download customer report"
              className="gap-2 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-600"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Preparing Report..." : "Download Report"}
            </Button>
          </div>
          <div
            className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
              canDownloadCustomerReport
                ? "border-indigo-100 bg-indigo-50 text-indigo-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{customerReportRangeLabel}</p>
              <p className="mt-0.5">
                {canDownloadCustomerReport
                  ? "CSV export is ready for this range."
                  : `Choose ${MAX_CUSTOMER_EXPORT_MONTHS} months or less to export.`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Guests",
              value: uniqueUsers.length,
              sub: `${dashboardStats.totalStays} stay records`,
              icon: Users,
              tone: "text-indigo-700 bg-indigo-50 ring-indigo-100",
            },
            {
              label: "Active Stays",
              value: dashboardStats.activeStays,
              sub: "currently checked in",
              icon: CalendarDays,
              tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
            },
            {
              label: "Services",
              value: dashboardStats.services,
              sub: "requests in range",
              icon: Wrench,
              tone: "text-rose-700 bg-rose-50 ring-rose-100",
            },
            {
              label: "Avg Visits",
              value: dashboardStats.avgVisits || "-",
              sub: "lifetime per guest",
              icon: TrendingUp,
              tone: "text-amber-700 bg-amber-50 ring-amber-100",
            },
            {
              label: "Companions",
              value: dashboardStats.companions,
              sub: "co-guests in range",
              icon: Users,
              tone: "text-teal-700 bg-teal-50 ring-teal-100",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`${surface} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{item.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${item.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">{item.sub}</p>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className={`${surface} p-5 lg:col-span-2`}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Booking Sources</h2>
                <p className="text-xs text-slate-500">{dashboardStats.topSource} leads this range</p>
              </div>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-4 space-y-3">
              {sourceRows.length ? (
                sourceRows.map(([source, percentage]) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setSourceFilter(sourceFilter === source ? "ALL" : source)}
                    className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                      sourceFilter === source ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-semibold text-slate-700">{source}</span>
                      <span className="font-bold tabular-nums text-slate-900">{Number(percentage).toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(Number(percentage), 100)}%` }} />
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">No source data in this range.</div>
              )}
            </div>
          </div>

          <div className={`${surface} p-5 lg:col-span-3`}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Frequent Guests</h2>
                <p className="text-xs text-slate-500">Highest lifetime visit count</p>
              </div>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {topGuests.map((guest, index) => (
                <button
                  key={guest.phone}
                  type="button"
                  onClick={() => setSelectedUser(guest)}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold capitalize text-slate-950">{guest.name}</p>
                      <p className="text-xs text-slate-500">{guest.phone}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                    <span className="text-slate-500">Visits</span>
                    <span className="font-bold tabular-nums text-indigo-700">{guest.totalVisits ?? guest.stays ?? 0}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={`${surface} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Guest Directory</h2>
              <p className="text-xs text-slate-500">
                {filteredUsers.length} of {uniqueUsers.length} guests
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone"
              className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 pr-9 text-sm focus-visible:bg-white"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter by source"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        {uniqueUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Inbox className="h-8 w-8" />
            <p className="font-medium">
              No users found for the selected range.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Inbox className="h-8 w-8" />
            <p className="font-medium">
              No matches for <span className="text-slate-700">"{debouncedSearch || sourceFilter}"</span>
            </p>
            <p className="text-xs">Try a different name, phone number, or source.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={th}>Guest</th>
                  <th className={th}>Visits</th>
                  <th className={th}>Last stay</th>
                  <th className={th}>Room</th>
                  <th className={th}>Source</th>
                  <th className={th}>Activity</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.phone}
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold uppercase text-slate-700">
                          {user.name?.[0] || "G"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold capitalize text-slate-950">
                            <Highlight text={user.name} query={debouncedSearch} />
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} font-bold tabular-nums text-indigo-700`}>
                      {user.totalVisits ?? user.stays ?? 0}
                    </td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{user.lastVisit || "No date"}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{user.lastRoom ? `Room ${user.lastRoom}` : "-"}</td>
                    <td className={td}>
                      <span className="inline-flex max-w-[180px] truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                        {user.topSource || "not-given"}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded-md bg-rose-50 px-2 py-1 font-medium text-rose-700 ring-1 ring-rose-100">
                          {user.services ?? 0} services
                        </span>
                        <span className="rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700 ring-1 ring-amber-100">
                          {user.reviews ?? 0} reviews
                        </span>
                        <span className="rounded-md bg-teal-50 px-2 py-1 font-medium text-teal-700 ring-1 ring-teal-100">
                          {user.companions ?? 0} companions
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          user.status === "In House"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "In House" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </section>
      </div>
    </main>
  );
};

const UserAnalytics = memo(MemoUserAnalytics);
export default UserAnalytics;
