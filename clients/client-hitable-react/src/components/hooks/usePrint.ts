import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useReprintKot = () => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (kotId: string) => {
      const response = await apiRpc.kot.reprint_kot.$post({
        json: {
          kotId: kotId,
        },
      });
      return response;
    },
    onSuccess: async (data, variables) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.error?.issues[0]?.message);
        setOpenErrorModal(true);
        return toast.error("Failed to reprint kot");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Kot reprinted successfully");
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });
  return { isPending, mutateAsync };
};

interface ReprintBillProps {
  orderId: string;
}

export const useReprintBill = () => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending: billPrinting, mutateAsync: reprintBill } = useMutation({
    mutationFn: async ({ orderId }: ReprintBillProps) => {
      const response = await apiRpc.pos.settle_bill_print.$post({
        json: {
          orderId: orderId,
        },
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.message);
        setOpenErrorModal(true);
        return toast.error("Failed to reprint bill");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Bill reprinted successfully");
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });
  return { billPrinting, reprintBill };
};
