import type { Alert } from "@/components/types/hiClientzData"
import { Badge } from "@/components/ui/badge"
import { memo } from "react"
import { MdOutlineTableBar } from "react-icons/md"
import { PiCoinsFill } from "react-icons/pi"

const MemoOfflineCards = ({ alert }: { alert: Alert }) => {
  return (
    <div className="space-y-2">
    <div className="flex items-start justify-between mb-2">
      <h3 className="text-2xl font-bold ">
        {alert?.order_id?.discount > 0 ||
          alert?.order_id?.claimedCoins > 0 ? (
          <span className="mr-2 text-sm line-through text-muted-foreground">
            ₹ {alert?.order_id?.billValue}
          </span>
        ) : null}
        ₹ {alert?.order_id?.total}
      </h3>
      <div className="flex items-center space-x-2 text-right">
        <MdOutlineTableBar size={28} />
        <h4 className="text-lg font-semibold">
          {alert?.tableName}
        </h4>
      </div>
    </div>
    <span className="font-semibold">
      {alert?.userId?.name?.length > 10
        ? `${alert?.userId?.name?.substring(0, 10)}...`
        : alert?.userId?.name || "customer"}
    </span>
    {alert?.coinsApplied && (
      <Badge
        variant="secondary"
        className="flex items-center space-x-1"
      >
        <PiCoinsFill className="w-4 h-4" />
        <span>{alert?.order_id?.claimedCoins} Used</span>
      </Badge>
    )}
  </div>
  )
}

const OfflineCards = memo(MemoOfflineCards)
export default OfflineCards
