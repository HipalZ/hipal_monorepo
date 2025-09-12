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
import { Inbox, Search, X } from "lucide-react";
import { useUsersAnalyticsData } from "@/hooks/hotel/useUserData";
import useBusinessData from "@/components/store/useBusinessData";
import { UserDetails } from "@/components/hotel/hotelUsers/UserDetails";
import { SourcesDashboard } from "@/components/hotel/hotelUsers";
import { UserCard } from "@/components/hotel/hotelUsers/UserCard";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);

type MiniUser = { _id?: string; name: string; phone: string };

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
  const debouncedSearch = useDebounced(search, 300);

  const { isLoading, error, userAnalyticsData } = useUsersAnalyticsData({
    businessId,
    from: String(timeStampStart),
    to: String(timeStampEnd),
  });

  const analytics = userAnalyticsData?.analytics ?? [];
  const sourcePercentages = userAnalyticsData?.sourcePercentages ?? {};

  const uniqueUsers = useMemo<MiniUser[]>(() => {
    const seen = new Set<string>();
    const list: MiniUser[] = [];
    for (const item of analytics) {
      const phone = item?.userId?.phone;
      if (!phone) continue;
      if (!seen.has(phone)) {
        seen.add(phone);
        list.push({
          _id: item?.userId?._id,
          name: item?.userId?.name ?? "Guest",
          phone,
        });
      }
    }
    return list;
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
      <main className="pb-20">
        <header className="linear_gradient_background">
          <MemoizedHeader title="User Analytics" onBack={goBack} />
        </header>
        <div className="p-6">
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
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="User Analytics" onBack={goBack} />
      </header>

      <Suspense fallback={<div className="p-6">Loading date picker...</div>}>
        <DateRangePicker />
      </Suspense>

      <div className="p-6">
        <div className="mb-8">
          <SourcesDashboard sourcePercentages={sourcePercentages} />
        </div>

        <div className="flex items-end justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold">
            User Directory
            {uniqueUsers.length !== 0 && (
              <span className="text-muted-foreground font-normal">
                {" "}
                ({uniqueUsers.length})
              </span>
            )}
          </h2>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="pl-10"
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

          {/* Search meta */}
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

        {/* Results */}
        {uniqueUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Inbox className="w-8 h-8" />
            <p className="font-medium">
              No users found for the selected range.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
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
