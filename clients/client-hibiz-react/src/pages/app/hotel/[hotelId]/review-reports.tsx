// components/reviews/HotelReviews.tsx
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import { fetchReviews } from "@/hooks/hotel/useReviewHook.ts";
import {
  type IHotelStaff,
  useGetAllHotelServices,
  useGetAllHotelStaff,
} from "@/hooks/useHotelStaff.ts";
import type { IService } from "@/components/store/hotel/useHotelServices.ts";
import { useReviewsFilterStore } from "@/components/store/hotel/useReview.ts";
import ReviewsFilters from "@/components/hotel/review/ReviewFilters.tsx";
import ReviewAccordionCard from "@/components/hotel/review/ReviewCard.tsx";
import MemoizedHeader from "@/components/molecules/header/index.tsx";

export default function HotelReviews() {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) as
    | string
    | undefined;

  const { hotelServicesData = [] as IService[] } =
    useGetAllHotelServices(businessId || "") || {};
  const { staffData = [] as IHotelStaff[] } =
    useGetAllHotelStaff(businessId || "") || {};

  const createPayload = useReviewsFilterStore((s) => s.createPayload);
  const isFiltered = useReviewsFilterStore((s) => s.isFiltered);
  const applyKey = useReviewsFilterStore((s) => s.applyKey);

  // Build payload when businessId/applyKey change (defaults to "today" on first mount)
  const payload = useMemo(
    () => (businessId ? createPayload(businessId) : null),
    [businessId, applyKey],
  );

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
    refetch,
  } = useQuery({
    queryKey: ["reviews", businessId, payloadKey],
    queryFn: () => fetchReviews(payload!),
    enabled: !!businessId && !!payload,
  });

  useEffect(() => {
    useReviewsFilterStore.getState().setBusinessId(businessId);
  }, [businessId]);

  const onApply = () => {
    useReviewsFilterStore.getState().apply();
  };

  const filtered = isFiltered();

  return (
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Review Report"  />
      </header>
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
          <div className="pb-[10rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {results.map((r) => (
              <ReviewAccordionCard
                key={r._id}
                r={r}
                staffData={staffData}
                refetch={refetch}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
