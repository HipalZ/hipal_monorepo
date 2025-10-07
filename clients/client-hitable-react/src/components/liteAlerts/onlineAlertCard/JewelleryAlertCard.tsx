import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { Alert } from "../../types/hiClientzData";
import { Button } from "../../ui/button";
import { IoCloseCircleSharp } from "react-icons/io5";
import { memo } from "react";

interface JewelleryAlertCardProps {
  alert: Alert;
  className?: string;
  onViewDetails?: (alert: Alert) => void;
  showRemoveButton?: boolean;
  onRemove?: (id: string) => void;
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

function MemoJewelleryAlertCard({
  alert,
  className,
  onViewDetails,
  showRemoveButton = true,
  onRemove,
}: JewelleryAlertCardProps) {
  const orderIdLast6 = alert.orderId.razorpayOrderId.slice(-6);
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
      <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-foreground">
                #{orderIdLast6}
              </p>
            </div>

            <div className="text-right">
              <Badge
                variant="secondary"
                className={cn(
                  "mb-1 text-xs font-medium",
                  alert.mode === "OFFLINE"
                    ? "bg-orange-100 text-orange-800 border-orange-200"
                    : "bg-blue-100 text-blue-800 border-blue-200",
                )}
              >
                {alert.mode}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timestampToDateTime(alert.date)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">
              {alert.orderId.userId.name}
            </p>

            <div className="text-right">
              <p className="text-xl font-bold text-foreground">
                ₹{alert.orderId.total.toLocaleString()}
              </p>
            </div>
          </div>
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
const JewelleryAlertCard = memo(MemoJewelleryAlertCard);
export default JewelleryAlertCard;
