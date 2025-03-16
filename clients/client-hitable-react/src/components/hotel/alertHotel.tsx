import { memo, Suspense } from "react";
import { useAlertsStore } from "../store/useAlertStore";
import { AlertsSearchAndFilter } from "./alertsSearchAndFilter";
import { AlertCardHotel } from "./alertCardHotel";
import { EmptyAlerts } from "./emptyAlerts";

const MemoAlertHotel = () => {
  const { filteredAlerts } = useAlertsStore();
  return (
    <div className="p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AlertsSearchAndFilter />
      </Suspense>
      {filteredAlerts?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {filteredAlerts?.map((alert) => (
            <Suspense key={alert?._id} fallback={<div>Loading...</div>}>
              <AlertCardHotel alert={alert} />
            </Suspense>
          ))}
        </div>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <EmptyAlerts />
        </Suspense>
      )}
    </div>
  );
};

const AlertHotel = memo(MemoAlertHotel);
export default AlertHotel