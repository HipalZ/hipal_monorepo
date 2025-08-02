import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderStore } from "@/components/store/useOrderData";

export const useHomeNavigation = () => {
  const navigate = useNavigate();
  const { businessId } = useParams();

  // Clear any modal states when going home
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);
  const setNormalSettle = useOrderStore((s) => s.setNormalSettle);

  const goHome = useCallback(() => {
    // Clear all modal states
    setOpenOrderModal(false);
    setShowMoreOption(false);
    setNormalSettle(false);

    // Navigate to appropriate home
    if (businessId) {
      navigate(`/${businessId}/alerts`);
    } else {
      navigate("/");
    }
  }, [
    navigate,
    businessId,
    setOpenOrderModal,
    setShowMoreOption,
    setNormalSettle,
  ]);

  const goHomeWithConfirmation = useCallback(() => {
    const hasUnsavedChanges = false; // Add your logic here

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to go home?",
      );
      if (!confirmed) return;
    }

    goHome();
  }, [goHome]);

  return {
    goHome,
    goHomeWithConfirmation,
  };
};
