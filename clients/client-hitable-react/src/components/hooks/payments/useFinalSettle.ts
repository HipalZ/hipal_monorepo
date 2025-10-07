import { useMutation } from "@tanstack/react-query";
import { useLiteStore } from "../../store/useLiteStore";
import { useError } from "../../store/useError";
import toast from "react-hot-toast";
import { useOrderStore } from "../../store/useOrderData";
import { useNavigate, useParams } from "react-router-dom";
import { updateTheAlertToConfirmStatus } from "../../../api/alert";
import useBusinessData from "../../store/useBusinessData";

export const useFinalPopcornSettle = () => {
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const navigate = useNavigate();
  const setError = useError((s) => s.setError);
  const setOpenErrorModal = useError((s) => s.setOpenErrorModal);
  const outletType = useBusinessData((s) => s?.outletInfo?.outLetType);
  const removeOnlineAlert = useLiteStore((s) => s.removeOnlineAlert);
  const removeOnlineCount = useLiteStore((s) => s.removeOnlineCount);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const setIsSplit = useOrderStore((s) => s.setIsSplit);
  const setSettleModes = useOrderStore((s) => s.setSettleModes);
  const setOpenDues = useOrderStore((s) => s.setOpenDues);
  const setSaveDueUser = useOrderStore((s) => s.setSaveDueUser);
  const { businessId } = useParams();

  const { mutateAsync: confirmAlert, isPending: isAlertLoading } = useMutation({
    mutationFn: async (payload: {
      alertId: string;
      comment: string;
      waiterName: string;
      settleModes: { _id: string; name: string; amount: number }[];
      duesUserId?: string;
      staffId?: string;
    }) => {
      const res = await updateTheAlertToConfirmStatus({
        outletType: outletType,
        payload: payload,
      });
      if (res.status === 401 || res.status === 403) {
        setOpenErrorModal(true);
        setError("You are not authorized to perform this action");
        return res.json();
      }
      if (res.status === 200 || res.status === 201) {
        removeOnlineAlert(payload.alertId);
        removeOnlineCount();
        toast.success("Order confirmed successfully!");
        setSettleModes([]);
        setIsSplit(false);
        setOpenOrderModal(false);
        setClickViewMore(false);
        setOpenDues(false);
        setSettleModes([]);
        setSaveDueUser(null);
        navigate(`/${businessId}/alerts`);
        return res;
      }
    },
    onSuccess: (data) => {
      if (data?.err) {
        toast.error(data.message);
        return;
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
  return { confirmAlert, isAlertLoading };
};
