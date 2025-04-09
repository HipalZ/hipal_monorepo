import { AlertCardHotel } from "./alertCardHotel"
import { memo, Suspense } from "react"
import { useEscalatedAlerts } from "@/hooks/useHotelApis"
import type { Alert } from "../types/hotelData"

const MemoEscalationAlerts = () => {
  const { escalatedData } = useEscalatedAlerts()
  return (
    <div className="p-4">
      {escalatedData?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {escalatedData?.map((alert: Alert) => (
            <Suspense key={alert?._id} fallback={<div>Loading...</div>}>
              <AlertCardHotel alert={alert} />
            </Suspense>
          ))}
        </div>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <center>
            No Escalations Found
          </center>
        </Suspense>
      )}
    </div>
  )
}

const EscalationAlerts = memo(MemoEscalationAlerts)
export default EscalationAlerts