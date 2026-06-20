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
  CalendarDays,
  BedDouble,
  Download,
  Inbox,
  Search,
  Sparkles,
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
import { SourcesDashboard } from "@/components/hotel/hotelUsers";
import { UserCard } from "@/components/hotel/hotelUsers/UserCard";
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
  lastVisit?: string;
  topSource?: string;
};

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
  guestUserIds?: string[],
  primaryUserId?: string,
) => {
  if (!guestUserIds?.length) return 0;
  return guestUserIds.filter((id) => id && id !== primaryUserId).length;
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
  const [isDownloading, setIsDownloading] = useState(false);
  const debouncedSearch = useDebounced(search, 300);

  const { isLoading, error, userAnalyticsData } = useUsersAnalyticsData({
    businessId,
    from: String(timeStampStart),
    to: String(timeStampEnd),
  });

  const analytics = userAnalyticsData?.analytics ?? [];
  const sourcePercentages = userAnalyticsData?.sourcePercentages ?? {};

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

    return {
      totalStays: analytics.length,
      activeStays,
      services,
      companions,
      topSource,
    };
  }, [analytics, sourcePercentages]);

  const uniqueUsers = useMemo<MiniUser[]>(() => {
    const groupedUsers = new Map<string, AnalyticsItem[]>();

    for (const item of analytics) {
      const phone = item?.userId?.phone;
      if (!phone) continue;
      groupedUsers.set(phone, [...(groupedUsers.get(phone) ?? []), item]);
    }

    return Array.from(groupedUsers.entries()).map(([phone, userRows]) => {
      const firstUser = userRows[0]?.userId;
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
        companions: new Set(
          userRows.flatMap((row) =>
            (row.guestUserIds ?? []).filter(
              (guestId) => guestId && guestId !== row.userId?._id,
            ),
          ),
        ).size,
        reviews: userRows.reduce(
          (sum, row) => sum + (row.reviewIds?.length ?? 0),
          0,
        ),
        lastVisit: formatExcelTimestamp(
          Math.max(...userRows.map((row) => row.checkIn || 0)),
        ),
        topSource:
          Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          "Guest User",
      };
    });
  }, [analytics]);

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return uniqueUsers;
    return uniqueUsers.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [uniqueUsers, debouncedSearch]);

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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/40 pb-20">
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/40 pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="User Analytics" onBack={goBack} />
      </header>

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-5 rounded-lg border border-border/60 bg-white/85 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <Suspense fallback={<div className="p-3">Loading date picker...</div>}>
              <DateRangePicker />
            </Suspense>

            <Button
              type="button"
              size="sm"
              onClick={handleDownloadCustomers}
              disabled={isDownloading || analytics.length === 0}
              title="Download customer report"
              className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-600 lg:mt-1"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Preparing Report..." : "Download Report"}
            </Button>
          </div>
          <div
            className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
              canDownloadCustomerReport
                ? "border-blue-100 bg-blue-50 text-blue-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                Customer report downloads support up to {MAX_CUSTOMER_EXPORT_MONTHS} months at a time.
              </p>
              <p className="mt-0.5">
                Selected: {customerReportRangeLabel}
                {!canDownloadCustomerReport
                  ? " - download will ask you to select a shorter range."
                  : " - ready to download."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">


          <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700">
                  Customers
                </p>
                <p className="mt-1 text-3xl font-bold text-teal-950">
                  {uniqueUsers.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-teal-100">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-teal-800/80">
              {dashboardStats.companions} companions across stays
            </p>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-rose-700">
                  Services
                </p>
                <p className="mt-1 text-3xl font-bold text-rose-950">
                  {dashboardStats.services}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-rose-700 ring-1 ring-rose-100">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-rose-800/80">
              Requested services in selected range
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-amber-700">
                  Top Source
                </p>
                <p className="mt-1 truncate text-lg font-bold text-amber-950">
                  {dashboardStats.topSource}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-100">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-800/80">
              Highest booking source share
            </p>
          </div>
        </div>

        <div className="mb-8">
          <SourcesDashboard sourcePercentages={sourcePercentages} />
        </div>

        <div className="mb-6 rounded-lg border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-xl font-semibold">User Directory</h2>
                {uniqueUsers.length !== 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {uniqueUsers.length}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Search, inspect, and export customer stay data.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="h-11 rounded-md border-border/70 bg-slate-50 pl-10 focus-visible:bg-white"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/70"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            {debouncedSearch
              ? `Showing ${filteredUsers.length} result${
                  filteredUsers.length === 1 ? "" : "s"
                } for “${debouncedSearch}”`
              : `Showing ${uniqueUsers.length} user${
                  uniqueUsers.length === 1 ? "" : "s"
                }`}
          </div>
        </div>

        {uniqueUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white/70 text-muted-foreground">
            <Inbox className="w-8 h-8" />
            <p className="font-medium">
              No users found for the selected range.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white/70 text-muted-foreground">
            <Inbox className="w-8 h-8" />
            <p className="font-medium">
              No matches for{" "}
              <span className="text-foreground">“{debouncedSearch}”</span>
            </p>
            <p className="text-xs">Try a different name or phone number.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.phone}
                user={
                  {
                    _id: user._id ?? "",
                    // Highlight matches in the card title
                    name: (
                      <span className="capitalize">
                        <Highlight text={user.name} query={debouncedSearch} />
                      </span>
                    ) as unknown as string,
                    phone: user.phone,
                    stays: user.stays,
                    services: user.services,
                    companions: user.companions,
                    reviews: user.reviews,
                    lastVisit: user.lastVisit,
                    topSource: user.topSource,
                  } as any
                }
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const UserAnalytics = memo(MemoUserAnalytics);
export default UserAnalytics;
