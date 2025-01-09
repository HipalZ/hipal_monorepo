"use client";

import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import React, { memo, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useErrorHandling } from "@/utils/helper";
import Bill from "@/assets/call/BillImage.png";
import Breakfast from "@/assets/call/Breakfast.png";
import Towel from "@/assets/call/Towel.png";
import RoomService from "@/assets/call/RoomService.png";
import ReceptionBell from "@/assets/call/ReceptionBell.png";
import Image from "next/image";
import { motion } from "framer-motion";
import ConfettiHeader from "@/components/organisms/confettiHeader";
import { cn } from "@/components/utils/helpers";

const CallTheWaiterComponent = ({ onClose }: { onClose: () => void }) => {
  const { errorText } = useErrorHandling();
  const [message, setMessage] = useState("");
  const { tableName } = useTableData();
  const name = useLogin((s) => s.userDetails?.name);
  const userDetails = useLogin((s) => s.userDetails);

  const messageImageMap = {
    "Other Service": RoomService,
    "Remind for my order": Breakfast,
    "Get tissues": Towel,
    "Get my bill": Bill,
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
        userId: userDetails._id,
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
    userDetails._id,
    loading,
    errorText,
    onClose,
  ]);

  return (
    <>
      <div className="flex flex-col h-screen relative pb-[6rem] overflow-auto bg-white">
        <ConfettiHeader direction="top" />
        <center className="mt-20">
          <Image src={ReceptionBell} alt="ReceptionBell" height={143} width={143} />
          <h1 className="text-black my-2 text-2xl font-semibold">Calling Captain?</h1>
          <p className="text-gray-500 text-sm mt-2">What should we tell the captain to help you with </p>
        </center>
        <br />
        <motion.ul
          className="grid flex-grow grid-cols-2 gap-5 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Object.entries(messageImageMap).map(([messageText, imageSrc]) => (
            <motion.li
              key={messageText}
              className={cn(message === messageText ? "border-[#008800] border-2" : "border-[#CACACA] border", "overflow-hidden rounded-2xl pb-4 h-[11rem] relative cursor-pointer flex flex-col items-center justify-center")}
              onClick={() => handleSelectMessage(messageText)}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="py-4 bg-[#ffffff] text-base-content"
              >
                <Image
                  src={imageSrc}
                  alt={messageText}
                  height={120}
                  width={120}
                  objectFit="cover"
                  className="transition-transform duration-300 ease-in-out transform"
                />
              </motion.div>
              <h3 className="text-sm font-medium text-center text-[#000000]">
                {messageText}
              </h3>
            </motion.li>
          ))}
        </motion.ul>
        <br />
        <div className="mx-4">
          <button
            type="button"
            onClick={callTheWaiter}
            className={cn(message?.length > 0 ? "bg-[#008800] text-white" : "bg-[#FFFFFF] text-gray-500", "w-full border border-[#cacaca] text-base p-3 rounded-xl")}
          >
            {message?.length > 0 ? 'Continue' : 'Select the option and call'}
          </button>
        </div>
      </div>
    </>
  );
};

const MemoCallTheWaiterComponent = memo(CallTheWaiterComponent);
export default MemoCallTheWaiterComponent;
