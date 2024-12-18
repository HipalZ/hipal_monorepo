import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useErrorHandling } from "@/utils/helper";
interface ICallTheCaptain {
  businessId: string;
  tableName: string;
  message: string;
  alertType: string;
  status: string;
  name: string;
  userId: string;
}

export const useCallTheCaptain = () => {
  const { errorText } = useErrorHandling();
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: ICallTheCaptain) => {
      const res = await apiRpc.payments.createWaiterAlert.$post({
        json: payload,
      });
      if (res.status === 401) {
        return errorText(res.status);
      }
      if (res.status === 200) {
        toast.success("Staff will be there soon. Thank you!!");
      }
      if (res.status === 404 || res.status === 400) {
        toast.error("Please scan again");
      }
    },
  });
  return { mutate, isPending };
};
