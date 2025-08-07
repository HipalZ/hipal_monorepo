import { useCallback, useState } from "react";
import type { IBillData } from "@/components/types/hiClientzData.ts";

export const usePhoneActions = (currentBill: IBillData | null) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<"copy" | "call" | null>(
    null,
  );
  const [copyTick, setCopyTick] = useState(false);

  const executePhoneAction = useCallback(
    (action: "copy" | "call") => {
      const phone = currentBill?.customerPhone;
      if (!phone) return;
      if (action === "copy") {
        navigator.clipboard.writeText(phone).then(() => {
          setCopyTick(true);
          setTimeout(() => setCopyTick(false), 3000);
        });
      } else if (action === "call") {
        window.location.href = `tel:+91${phone}`;
      }
    },
    [currentBill?.customerPhone],
  );

  const handleProtectedAction = useCallback(
    (action: "copy" | "call") => {
      if (isPhoneVerified) {
        executePhoneAction(action);
      } else {
        setPendingAction(action);
        setIsModalOpen(true);
      }
    },
    [isPhoneVerified, executePhoneAction],
  );

  const handlePasswordVerify = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setIsPhoneVerified(true);
        if (pendingAction) {
          executePhoneAction(pendingAction);
          setPendingAction(null);
        }
        setTimeout(() => setIsPhoneVerified(false), 5 * 60 * 1000);
      }
    },
    [pendingAction, executePhoneAction],
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isModalOpen,
    isPhoneVerified,
    copyTick,
    handleProtectedAction,
    handlePasswordVerify,
    handleModalClose,
  };
};
