import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdOutlineTableBar } from "react-icons/md";
import type { Alert } from "../../types/hiClientzData";

interface AlertCardProps {
  alert: Alert;
  onRemove?: (id: string) => void;
  onViewDetails?: (alert: Alert) => void;
  showRemoveButton?: boolean;
  className?: string;
}

const timestampToDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function AlertCard({
  alert,
  onRemove,
  onViewDetails,
  showRemoveButton = true,
  className,
}: AlertCardProps) {
  const isFailStatus = alert?.status === "FAIL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
      className={className}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          isFailStatus ? "border-red-200" : "border-green-200",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4 -mt-4 -ml-4">
            <Badge
              variant={isFailStatus ? "destructive" : "default"}
              className="text-base font-medium capitalize rounded-none md:text-lg"
            >
              {alert?.alertType?.split("_").join(" ").toLowerCase()}
            </Badge>
            <span className="text-sm font-semibold text-muted-foreground">
              {timestampToDateTime(alert?.date)}
            </span>
          </div>

          <div className="flex items-start justify-between mb-2">
            <h3 className="text-2xl font-bold">
              {(alert?.order_id?.discount > 0 ||
                alert?.order_id?.claimedCoins > 0) && (
                <span className="mr-2 text-sm line-through text-muted-foreground">
                  ₹ {alert?.order_id?.billValue}
                </span>
              )}
              ₹ {alert?.order_id?.total}
            </h3>
            <div className="flex items-center space-x-2 text-right">
              <MdOutlineTableBar size={28} />
              <h4 className="text-lg font-semibold">{alert?.tableName}</h4>
            </div>
          </div>

          <span className="font-semibold text-foreground opacity-60">
            {alert?.userId?.name || "customer"}
          </span>
        </CardContent>

        <CardFooter
          className={cn(
            "flex items-center justify-between p-4",
            isFailStatus ? "bg-red-100" : "bg-green-100",
          )}
        >
          {showRemoveButton && alert.alertType !== "OFFLINE" && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive bg-destructive/10"
              onClick={() => onRemove(alert?._id)}
            >
              <IoCloseCircleSharp className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(alert)}
              className="font-semibold"
            >
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export type { Alert };
