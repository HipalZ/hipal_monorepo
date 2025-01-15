import { memo, useCallback } from "react";
import { useCallTheCaptain } from "@/components/hooks/useCartHook";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";
import useTableData from "@/components/store/useTableData";

const MemoCallTheCaptain = () => {
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const userDetails = useLogin((s) => s.userDetails);
  const tableName = useTableData((s) => s.tableName);
  const { mutate, isPending } = useCallTheCaptain();
  const callTheWaiter = useCallback(async () => {
    if (!tableName) {
      toast.error("Please Scan the table to call staff");
      return;
    }

    const payload = {
      businessId: businessId,
      tableName: tableName,
      message: "Share the code of the table",
      alertType: "WAITER",
      status: "WAITER",
      name: userDetails?.name || "user",
      userId: userDetails._id,
    };

    mutate(payload);
  }, [businessId, tableName, userDetails?.name, userDetails._id, mutate]);
  return (
    <button
      type="button"
      onClick={callTheWaiter}
      disabled={isPending}
      className="bg-[#FFFFFF] text-gray-500 w-full border border-[#cacaca] text-sm px-4 py-3 rounded-md"
    >
      Need help from Captain
    </button>
  );
};

const CallTheCaptain = memo(MemoCallTheCaptain);
export default CallTheCaptain;
