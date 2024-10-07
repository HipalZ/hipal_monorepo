import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import React, { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useErrorHandling } from "@/utils/helper";

const messages = [
  "Need Bill",
  "Bring Water bottles",
  "Bring Menu",
  "Bring Tissue Paper",
  "Please settle my table",
  "Other",
];

const CallTheWaiterComponent = ({ onClose }: { onClose: () => void }) => {
  const { errorText } = useErrorHandling();
  const [message, setMessage] = useState("");
  const { tableName } = useTableData();
  const name = useLogin((s) => s.userDetails?.name);
  const userDetailes = useLogin((s) => s.userDetails);

  const [loading, setLoading] = useState<boolean>(false);
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);

  const handleSelectMessage = useCallback((message: string) => {
    setMessage(message);
  }, []);

  const callTheWaiter = useCallback(async () => {
    if (message === "") {
      return toast.error("Please select a message to call waiter");
    }
    if (loading) {
      return toast.error("Please wait for a moment");
    }
    setLoading(true);
    const res = await apiRpc.payments.createWaiterAlert.$post({
      json: {
        businessId: businessId,
        tableName: tableName,
        message: message,
        alertType: "WAITER",
        status: "WAITER",
        name: name,
        userId: userDetailes._id,
      },
    });
    if (!res.ok) {
      setLoading(false);
      return errorText(res.status);
    }
    if (res.status === 200) {
      toast.success("Captain will be there soon. Thank you!!");
      onClose();
    }
  }, [businessId, tableName, message]);

  return (
    <>
      <ul className="h-full overflow-auto text-primary">
        {messages.map((message) => (
          <li
            className="p-2 m-4 transition-colors duration-200 ease-in-out transform rounded-md cursor-pointer hover:bg-primary hover:text-base-100 hover:scale-105"
            key={`${message} index`}
            onClick={() => handleSelectMessage(message)}
          >
            {message}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={loading}
        onClick={callTheWaiter}
        className="w-[92%] mb-4 px-8 py-3 mx-4 text-sm border rounded-full bg-primary text-base-100"
      >
        {loading ? (
          <span className="loader_spinner !border-t-base-100 text-primary" />
        ) : (
          "Call Captain"
        )}
      </button>
    </>
  );
};

const MemoCallTheWaiterComponent = memo(CallTheWaiterComponent);
export default MemoCallTheWaiterComponent;
