import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Star,
  Users,
  Wrench,
  TrendingUp,
  MessageSquare,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useIndividualUserAnalytics } from "@/hooks/hotel/useUserData.ts";

interface UserDetailsProps {
  user: { _id: string; name: string; phone: string };
  businessId?: string;
  userId?: string;
  analytics?: Array<{
    guestUserIds: Array<{ name: string; phone: string }>;
    reviewIds: Array<{
      reviewRating: number;
      date: number;
      serviceIds: Array<{ name: string }>;
    }>;
    serviceIds: Array<{ name: string }>;
    roomId: { _id: string; name: string };
    userId: { name: string; phone: string };
    source: string;
    checkIn: number;
    checkOut: number;
  }>;
  overallData?: { averageRating: number; totalReviews: number };
}

export function UserDetails({
  user,
  businessId,
  userId,
  analytics: analyticsProp,
  overallData: overallProp,
}: UserDetailsProps) {
  const shouldFetch = Boolean(businessId && userId);
  const {
    data: fetched,
    isLoading,
    error,
  } = useIndividualUserAnalytics(
    shouldFetch ? { businessId: businessId!, userId: userId! } : ({} as any),
  );

  // Prefer fetched values when available; else use props
  const rawAnalytics =
    (shouldFetch ? fetched?.userAnalytics : analyticsProp) ?? [];
  const rawOverall = (shouldFetch ? fetched?.overAll : overallProp) ?? {
    averageRating: 0,
    totalReviews: 0,
  };

  const formatDate = (ts: number) =>
    ts === 0
      ? "Still checked in"
      : new Date(ts).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  const formatDateTime = (ts: number) =>
    ts === 0
      ? "Still checked in"
      : new Date(ts).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

  // Normalize arrays + fields for safety
  const safeAnalytics = Array.isArray(rawAnalytics)
    ? rawAnalytics.map((b) => ({
        ...b,
        reviewIds: Array.isArray(b.reviewIds) ? b.reviewIds : [],
        serviceIds: Array.isArray(b.serviceIds) ? b.serviceIds : [],
        guestUserIds: Array.isArray(b.guestUserIds) ? b.guestUserIds : [],
        roomId: b.roomId ?? { _id: "", name: "—" },
        userId: b.userId ?? { name: "Guest", phone: "" },
        source: b.source ?? "N/A",
        checkIn: typeof b.checkIn === "number" ? b.checkIn : 0,
        checkOut: typeof b.checkOut === "number" ? b.checkOut : 0,
      }))
    : [];

  const hasAnalytics = safeAnalytics.length > 0;

  const totalBookings = safeAnalytics.length;
  const totalReviews = safeAnalytics.reduce(
    (sum, b) => sum + b.reviewIds.length,
    0,
  );
  const allServices = safeAnalytics.flatMap((b) =>
    b.serviceIds.map((s) => s.name),
  );
  const uniqueServices = [...new Set(allServices)];
  const totalGuests = safeAnalytics.reduce(
    (sum, b) => sum + b.guestUserIds.length,
    0,
  );

  // Loading state (only when fetching inside)
  if (shouldFetch && isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="h-16 w-1/2 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="h-24 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="h-40 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (shouldFetch && error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>
          {(error as Error).message || "Failed to load user analytics."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm bg-gradient-to-br from-card to-card/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {user.name}
                </h2>
                <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg w-fit">
                  <div className="p-1 bg-primary/10 rounded">
                    <Phone className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user.phone}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">
                {hasAnalytics ? rawOverall.averageRating : "—"}
              </div>
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      hasAnalytics && i < Math.floor(rawOverall.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {hasAnalytics ? "Average Rating" : "No rating data"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalBookings}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Visits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalReviews}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Reviews
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {uniqueServices.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Services Used
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {totalGuests}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Guests
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="pb-4 px-0">
          <CardTitle className="text-xl font-bold flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Booking History
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6 px-0 pt-0">
          {!hasAnalytics ? (
            <div className="flex items-center justify-center flex-col gap-3 py-20 text-center">
              <div className="p-3 rounded-full bg-muted/40">
                <Inbox className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                No data available
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                We couldn’t find bookings for this user in the selected date
                range. Try a wider range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {safeAnalytics.map((booking, index) => {
                // --- helpers for subtle color coding by source (Material-like chips)
                const sourceHue =
                  booking.source === "Hotel Website"
                    ? "from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-500/20"
                    : booking.source === "Online Travel Agent"
                      ? "from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-500/20"
                      : booking.source === "Corporate"
                        ? "from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-500/20"
                        : "from-zinc-500/15 to-zinc-500/5 text-zinc-700 border-zinc-500/20";

                const reviewCount = booking.reviewIds.length;
                const guestCount = booking.guestUserIds.length;
                const serviceCount = booking.serviceIds.length;

                return (
                  <article
                    key={index}
                    className="group rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/70 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Header strip */}
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 bg-gradient-to-r from-muted/40 to-transparent">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm text-muted-foreground">
                            Room
                          </div>
                          <div className="text-lg font-semibold text-foreground truncate">
                            {booking.roomId?.name ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-medium px-3 py-1 rounded-full border bg-gradient-to-r ${sourceHue}`}
                        title={booking.source}
                      >
                        {booking.source || "N/A"}
                      </div>
                    </div>

                    {/* Dates row */}
                    <div className="px-5 pt-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground/90">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.checkIn)}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-foreground/90">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.checkOut)}
                        </span>
                      </div>
                    </div>

                    {/* Quick stats chips */}
                    <div className="px-5 pt-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          <Wrench className="w-3.5 h-3.5" />
                          {serviceCount} service{serviceCount === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground/90">
                          <Users className="w-3.5 h-3.5" />
                          {guestCount} guest{guestCount === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-700">
                          <Star className="w-3.5 h-3.5" />
                          {reviewCount} review{reviewCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    {/* Content grid */}
                    <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Services */}
                      <section>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-2">
                          Services
                        </div>
                        {serviceCount > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {booking.serviceIds.slice(0, 6).map((s, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {s.name}
                              </Badge>
                            ))}
                            {serviceCount > 6 && (
                              <Badge variant="secondary" className="text-xs">
                                +{serviceCount - 6}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No services recorded
                          </div>
                        )}
                      </section>

                      {/* Guests */}
                      <section>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-2">
                          Guests
                        </div>
                        {guestCount > 0 ? (
                          <div className="space-y-1.5">
                            {booking.guestUserIds.slice(0, 4).map((g, i) => (
                              <div
                                key={i}
                                className="text-sm text-foreground/90 px-2 py-1 rounded-md bg-muted/40 inline-flex"
                              >
                                {g.name}
                              </div>
                            ))}
                            {guestCount > 4 && (
                              <div className="text-xs text-muted-foreground">
                                +{guestCount - 4} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No guests added
                          </div>
                        )}
                      </section>

                      {/* Reviews (full width on small screens) */}
                      <section className="md:col-span-2">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mb-2">
                          Reviews
                        </div>
                        {reviewCount > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {booking.reviewIds.map((review, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-border/60 bg-background/60 p-3 hover:bg-background transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, j) => (
                                        <Star
                                          key={j}
                                          className={`w-3.5 h-3.5 ${
                                            j < review.reviewRating
                                              ? "text-yellow-400 fill-current"
                                              : "text-muted-foreground/30"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground">
                                      {review.reviewRating}/5
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">
                                    {formatDateTime(review.date)}
                                  </span>
                                </div>

                                {review.serviceIds?.length ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {review.serviceIds.map((s, k) => (
                                      <Badge
                                        key={k}
                                        variant="outline"
                                        className="text-xs bg-primary/5"
                                      >
                                        {s.name}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No services tagged
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No reviews
                          </div>
                        )}
                      </section>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
