import { memo, Suspense } from "react";
import { useAlertsStore } from "../store/useAlertStore";
import { AlertsSearchAndFilter } from "./alertsSearchAndFilter";
import { AlertCardHotel } from "./alertCardHotel";
import { EmptyAlerts } from "./emptyAlerts";
import NotificationBanner from "./NotificationBanner";
import { CheckoutTaskCard } from "./checkoutTasks/CheckoutTaskCard";
import useBusinessData from "../store/useBusinessData";
import { useHiClientZ } from "../store/useHiClientzData";
import { useCheckoutTaskActions, useMyCheckoutTasks } from "@/hooks/useCheckoutTasks";

/**
 * The staff work screen: guest requests AND checkout turnover in ONE feed.
 *
 * Turnover was previously a separate tab, but a night housekeeper watching this
 * screen would never switch to it — the work got missed, defeating the whole
 * escalation ladder. They now sit in a distinct band at the top: same page,
 * unmissable, but visually unmistakable from a guest request.
 */
const MemoAlertHotel = () => {
  const { filteredAlerts } = useAlertsStore();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useHiClientZ((s) => s.captainData?._id);

  const { tasks } = useMyCheckoutTasks(businessId, userId);
  const { accept, complete } = useCheckoutTaskActions(businessId, userId);

  // Stable order by when it was raised. Sorting by the live deadline made a card
  // jump the instant you accepted it (its deadline flips from accept→complete),
  // so a tap could land on the wrong card. createdAt never changes on accept.
  const turnover = [...tasks].sort((a, b) => a.createdAt - b.createdAt);

  const hasAlerts = filteredAlerts?.length > 0;

  return (
    <div className="p-4">
      <NotificationBanner />

      {/* Checkout turnover — a distinct band, so it can't be mistaken for a guest request */}
      {turnover.length > 0 && (
        <section className="mb-5 rounded-xl border border-orange-200 bg-orange-50/40 p-3">
          <div className="mb-2.5 flex items-center gap-2 px-0.5">
            <span className="h-4 w-1 rounded-full bg-orange-500" />
            <h2 className="text-sm font-semibold text-slate-800">Room turnover</h2>
            <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-700">{turnover.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {turnover.map((task) => (
              <CheckoutTaskCard
                key={task._id}
                task={task}
                busy={accept.isPending || complete.isPending}
                onAccept={() => accept.mutate(task._id)}
                onComplete={() => complete.mutate(task._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Guest requests — the existing flow, untouched */}
      <Suspense fallback={<div>Loading...</div>}>
        <AlertsSearchAndFilter />
      </Suspense>
      {hasAlerts ? (
        <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAlerts?.map((alert) => (
            <Suspense key={alert?._id} fallback={<div>Loading...</div>}>
              <AlertCardHotel alert={alert} />
            </Suspense>
          ))}
        </div>
      ) : turnover.length === 0 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <EmptyAlerts />
        </Suspense>
      ) : null}
    </div>
  );
};

const AlertHotel = memo(MemoAlertHotel);
export default AlertHotel;
