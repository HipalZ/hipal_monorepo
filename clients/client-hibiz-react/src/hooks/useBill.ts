import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

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