"use client";

import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import React, { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useErrorHandling } from "@/utils/helper";
import Bill from "@/assets/call/bill.png";
import WaterBottle from "@/assets/call/waterBottle.png";
import Tissue from "@/assets/call/tissue.png";
import Order from "@/assets/call/order.png";
import Other from "@/assets/call/other.png";
import Image from "next/image";
import { motion } from "framer-motion";
import CommonBottomButton from "@/components/atoms/bottomButton";

const CallTheWaiterComponent = ({ onClose }: { onClose: () => void }) => {
  const { errorText } = useErrorHandling();
  const [message, setMessage] = useState("");
  const { tableName } = useTableData();
  const name = useLogin((s) => s.userDetails?.name);
  const userDetailes = useLogin((s) => s.userDetails);

  const messageImageMap = {
    "Get Me Water Bottles": WaterBottle,
    "Get Me Tissue Paper": Tissue,
    "Please Settle My Table": Bill,
    "Please Take My Order": Order,
    Other: Other,
  };

  const [loading, setLoading] = useState<boolean>(false);
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);

  const handleSelectMessage = useCallback((selectedMessage: string) => {
    setMessage(selectedMessage);
  }, []);

  const callTheWaiter = useCallback(async () => {
    if (message === "") {
      return toast.error("Please select a message to call staff");
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
      toast.success("Staff will be there soon. Thank you!!");
      onClose();
    }
  }, [
    businessId,
    tableName,
    message,
    name,
    userDetailes._id,
    loading,
    errorText,
    onClose,
  ]);

  return (
    <>
      <div className="flex flex-col relative max-h-[90dvh] pb-[5rem] overflow-auto bg-base-100">
        <motion.ul
          className="grid flex-grow grid-cols-2 gap-4 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Object.entries(messageImageMap).map(([messageText, imageSrc]) => (
            <motion.li
              key={messageText}
              className={` relative cursor-pointer flex flex-col items-center justify-center `}
              onClick={() => handleSelectMessage(messageText)}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`py-4 ${
                  message === messageText
                    ? "bg-primary text-base-100 rounded-2xl"
                    : "bg-base-100 text-base-content"
                }`}
              >
                <Image
                  src={imageSrc}
                  alt={messageText}
                  width={200}
                  height={150}
                  objectFit="cover"
                  className="transition-transform duration-300 ease-in-out transform w-full aspect-[4/3]"
                />
              </motion.div>
              <h3 className="mt-2 text-sm font-medium text-center text-primary">
                {messageText}
              </h3>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <CommonBottomButton
        fixed
        buttons={[
          {
            type: "button",
            text: "Call captain",
            onClick: callTheWaiter,
          },
        ]}
      />
    </>
  );
};

const MemoCallTheWaiterComponent = memo(CallTheWaiterComponent);
export default MemoCallTheWaiterComponent;
