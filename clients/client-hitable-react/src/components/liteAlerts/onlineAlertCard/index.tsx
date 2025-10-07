import { handleRemoveAlert } from "@/components/hooks/commonApi";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useErrorHandling } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useBusinessData from "@/components/store/useBusinessData";
import type { Alert } from "@/components/types/hiClientzData";
import { AlertCard } from "./AlertCard";
import JewelleryAlertCard from "./JewelleryAlertCard";

interface OnlineAlertCardProps {
  onlineAlertData: Alert[];
}

const OnlineAlertCard = ({ onlineAlertData }: OnlineAlertCardProps) => {
  const { errorText } = useErrorHandling();

  const removeOnlineAlert = useLiteStore((s) => s.removeOnlineAlert);
  const removeOnlineCount = useLiteStore((s) => s.removeOnlineCount);
  const setViewData = useLiteStore((s) => s.setViewData);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const outletInfo = useBusinessData((s) => s.outletInfo);
  const captainData = useHiClientZ((s) => s.captainData);

  const removeAlert = useCallback(
    async (id: string) => {
      try {
        const res = await handleRemoveAlert(apiRpc, id, captainData?.name);
        if (res.status === 401) return errorText();
        if (res.status === 200) {
          removeOnlineAlert(id);
          removeOnlineCount();
        }
      } catch (error) {
        console.error("Error removing alert:", error);
      }
    },
    [captainData?.name, errorText, removeOnlineAlert, removeOnlineCount],
  );

  const handleViewMore = useCallback(
    (alert: Alert) => {
      setViewData(alert);
      setClickViewMore(true);
    },
    [setViewData, setClickViewMore],
  );

  const onMarkPaid = useCallback((alertId: string) => {
    console.log("Marking alert as paid:", alertId);
  }, []);

  if (!onlineAlertData?.length) {
    return null;
  }

  return (
    <motion.main
      className="pb-[5rem] m-4 grid gap-4 md:mx-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {onlineAlertData.map((alert) => {
          switch (outletInfo?.outLetType) {
            case "RESTAURANT":
            case "OTHER":
            case "MENU":
              return (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  onRemove={removeAlert}
                  onViewDetails={handleViewMore}
                />
              );
            case "JEWELLERY":
              return (
                <JewelleryAlertCard
                  key={alert._id}
                  alert={alert}
                  onViewDetails={handleViewMore}
                  onMarkPaid={onMarkPaid}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </motion.main>
  );
};

export default memo(OnlineAlertCard);
