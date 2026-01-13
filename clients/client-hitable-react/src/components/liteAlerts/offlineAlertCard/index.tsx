import { memo } from "react";
import { handleRemoveAlert } from "@/components/hooks/commonApi";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { Alert } from "@/components/types/hiClientzData";
import {
  cn,
  timestampToDateTime,
  useErrorHandling,
} from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { IoCloseCircleSharp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OfflineCards from "./offlineCards";

interface IOfflineProp {
  offlineAlertData: Alert[];
}

const OfflineAlertCard = ({ offlineAlertData }: IOfflineProp) => {
  const { errorText } = useErrorHandling();
  const {
    removeOfflineAlert,
    setViewData,
    setClickViewMore,
    removeOfflineCount,
  } = useLiteStore((s) => ({
    removeOfflineAlert: s.removeOfflineAlert,
    setViewData: s.setViewData,
    setClickViewMore: s.setClickViewMore,
    removeOfflineCount: s.removeOfflineCount,
  }));
  const { captainData } = useHiClientZ((s) => ({
    captainData: s.captainData,
  }));

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(true);
  };

  const removeAlert = async (id: string) => {
    try {
      const res = await handleRemoveAlert(apiRpc, id, captainData?.name);
      if (res.status === 401) {
        return errorText();
      }
      if (res.status === 200) {
        removeOfflineAlert(id);
        removeOfflineCount();
      } else {
        console.error("Failed to remove alert");
      }
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  return (
    <motion.main
      className="p-4 pb-[5rem] gap-4 grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {Array.isArray(offlineAlertData) && offlineAlertData.length > 0 ? (
          offlineAlertData.map((alert: Alert) => {
            if (alert?.alertType === "WAITER") {
              return null;
            }
            return (
              <motion.div
                key={alert?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <Card
                  className={cn(
                    "relative overflow-hidden",
                    alert?.alertType === "WAITER"
                      ? "border-orange-200"
                      : "border-blue-200",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4 -mt-4 -ml-4">
                      <Badge
                        variant={
                          alert?.alertType === "WAITER"
                            ? "warning"
                            : alert?.status === "FAIL"
                              ? "destructive"
                              : "default"
                        }
                        className="text-base font-medium capitalize rounded-none md:text-lg"
                      >
                        {alert?.alertType === "WAITER"
                          ? "Call the staff"
                          : alert?.alertType?.toLowerCase()}
                      </Badge>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {timestampToDateTime(alert?.date)}
                      </span>
                    </div>
                    {alert?.alertType !== "WAITER" && (
                      <OfflineCards alert={alert} />
                    )}
                  </CardContent>
                  <CardFooter
                    className={cn(
                      "flex items-center justify-between p-4",
                      alert?.alertType === "WAITER"
                        ? "bg-orange-50"
                        : "bg-blue-50",
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-destructive/10"
                      onClick={() => removeAlert(alert?._id)}
                    >
                      <IoCloseCircleSharp className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                    {alert?.alertType !== "WAITER" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMore(alert)}
                        className="font-semibold"
                      >
                        View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            className="text-2xl font-semibold text-center col-span-full text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No Data Found
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};

const OfflineAlertCardMemo = memo(OfflineAlertCard);

export default OfflineAlertCardMemo;
