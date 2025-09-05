// components/reviews/HotelReviews.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  DoorOpen,
  CalendarDays,
  Wrench,
  ChevronDown,
  Phone,
  ClipboardList,
  CheckCircle2,
  CircleHelp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import useBusinessData from "@/components/store/useBusinessData";
import { useGetAllHotelServices, type IService } from "@/hooks/useServices";
import { useGetAllHotelStaff, type IHotelStaff } from "@/hooks/useStaff";
import { apiRpc } from "@hi/common";
import type {
  reviewResponse as ReviewItem,
  reviewPayload,
} from "@/hooks/useReview";
import { useReviewsFilterStore } from "../store/useReviewsFilterStore";
import ReviewsFilters from "./HotelReviewFilter";

/* === Small utils === */
const safeFormatDate = (ms?: number) => {
  if (!ms || Number.isNaN(ms)) return "—";
  try {
    const ts = ms < 1e12 ? ms * 1000 : ms;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return "—";
  }
};

const Stars = ({ value }: { value: number }) => (
  <div
    className="flex absolute top-2 right-2 items-center gap-1"
    aria-label={`Rating ${value} of 5`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-6 h-6",
          i < (Number.isFinite(value) ? value : 0)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300",
        )}
      />
    ))}
  </div>
);

const InitialAvatar = ({ name }: { name?: string }) => {
  const letter = name?.trim()?.[0]?.toUpperCase() || "U";
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-sm font-semibold">
      {letter}
    </div>
  );
};

/* === Review Card === */
const ReviewAccordionCard = ({
  r,
  staffData,
}: { r: ReviewItem; staffData: IHotelStaff[] }) => {
  const services =
    r.alertId?.serviceIds?.map((s) => s?.name).filter(Boolean) ?? [];
  const staffs = (r.staffs ?? []).filter(Boolean);
  const getStaffById = (id: string) =>
    staffData.find((s) => s._id === id)?.name;

  return (
    <Collapsible>
      <Card className="rounded-xl border shadow-sm overflow-hidden relative">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer select-none">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InitialAvatar name={r.userId?.name} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold">
                    {r.userId?.name || "Guest"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <DoorOpen className="inline w-4 h-4 mr-1" />
                    {r.roomId?.name || "—"}
                  </div>
                </div>
              </div>

              <section>
                <Stars value={Number(r.reviewRating) || 0} />
                <div className="flex absolute top-10 right-2 items-center gap-2">
                  {r.isRead ? (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Read
                    </Badge>
                  ) : (
                    <Badge className="text-xs">Unread</Badge>
                  )}
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                </div>
              </section>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{safeFormatDate(r.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{r.userId?.phone || "—"}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground">
                <Wrench className="w-4 h-4" />
                Services
              </div>
              {services.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No services listed
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {services.map((s, i) => (
                    <Badge
                      key={`${r._id}-svc-${i}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Staff Assigned
              </div>
              {staffs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No staff linked</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {staffs.map((sid) => (
                    <Badge
                      key={`${r._id}-stf-${sid}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {getStaffById(sid) || "unknown"}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* ... (acceptedBy / deliveredBy / improvements / read status – unchanged) */}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

/* === API helper for useQuery === */
async function fetchReviews(payload: reviewPayload): Promise<ReviewItem[]> {
  const res = await apiRpc.hotel.rooms.hotel_user_reviews.$post({
    json: payload,
  });
  const json = await res.json();
  if (!res.ok || json?.err) {
    throw new Error(json?.message || "Failed to fetch reviews");
  }
  return (json?.data ?? []) as ReviewItem[];
}

/* === Container === */
export default function HotelReviews() {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) as
    | string
    | undefined;

  const { hotelServicesData = [] as IService[] } =
    useGetAllHotelServices(businessId || "") || {};
  const { staffData = [] as IHotelStaff[] } =
    useGetAllHotelStaff(businessId || "") || {};

  // NOTE: pull applyKey from the store so the key changes on Apply
  const { createPayload, applyKey, isFiltered } = useReviewsFilterStore();

  // Build payload when businessId/applyKey change (defaults to "today" on first mount)
  const payload = useMemo(
    () => (businessId ? createPayload(businessId) : null),
    [businessId, applyKey],
  );

  // Optional: stable serialized key (prevents reruns if order of arrays changes)
  const payloadKey = useMemo(() => {
    if (!payload) return "nopayload";
    const { from, to, filter } = payload;
    return JSON.stringify({
      from,
      to,
      filter: {
        ...filter,
        serviceIds: filter?.serviceIds
          ? [...filter.serviceIds].sort()
          : undefined,
        staffIds: filter?.staffIds ? [...filter.staffIds].sort() : undefined,
        roomIds: filter?.roomIds ? [...filter.roomIds].sort() : undefined,
        rating: filter?.rating,
        isRead: filter?.isRead,
      },
    });
  }, [payload]);

  const {
    data: results = [],
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ["reviews", businessId, payloadKey], // ⬅️ depends on Apply/filters
    queryFn: () => fetchReviews(payload!), // ⬅️ POST
    enabled: !!businessId && !!payload, // ⬅️ fetch today by default
  });

  const onApply = () => {
    // bump the key in the store; triggers new payload and refetch
    useReviewsFilterStore.getState().apply();
  };

  const filtered = isFiltered();

  return (
    <section className="m-0">
      <ReviewsFilters
        services={hotelServicesData}
        staff={staffData}
        onApply={onApply}
        busy={isFetching || isLoading}
      />

      {/* Loading skeleton */}
      {isFetching && results.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 opacity-70">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl border bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {!isFetching && results.length === 0 && (
        <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground m-4">
          {filtered
            ? "No reviews match the selected filters."
            : "No reviews for today."}
        </div>
      )}

      {results.length > 0 && (
        <div className="pb-[10rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {results.map((r) => (
            <ReviewAccordionCard key={r._id} r={r} staffData={staffData} />
          ))}
        </div>
      )}
    </section>
  );
}
