"use client"

import useBusinessDetails from "@/components/store/useBusinessDetails"
import { useLogin } from "@/components/store/useLogin"
import useTableData from "@/components/store/useTableData"
import { apiRpc } from "@hi/common"
import { memo, useCallback, useState } from "react"
import { toast } from "react-toastify"
import { useErrorHandling } from "@/utils/helper"
import Bill from "@/assets/call/BillImage.png"
import Breakfast from "@/assets/call/Breakfast.png"
import Towel from "@/assets/call/Towel.png"
import WaterBottle from "@/assets/call/Water.png"
import ReceptionBell from "@/assets/call/ReceptionBell.png"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import ConfettiHeader from "@/components/organisms/confettiHeader"
import { cn } from "@/components/utils/helpers"
import { Search, Send, X } from "lucide-react"

const CallTheWaiterComponent = ({ onClose }: { onClose: () => void }) => {
  const { errorText } = useErrorHandling()
  const [message, setMessage] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const { tableName } = useTableData()
  const name = useLogin((s) => s.userDetails?.name)
  const userDetails = useLogin((s) => s.userDetails)

  const messageImageMap = {
    "Water Bottle": WaterBottle,
    "Remind for my order": Breakfast,
    "Get my bill": Bill,
    "Get tissues": Towel,
  }

  const suggestions = ["Clean the table", "Need Spoons", "Need extra plates"]

  const [loading, setLoading] = useState<boolean>(false)
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId)

  const handleSelectMessage = useCallback((selectedMessage: string) => {
    setMessage(selectedMessage)
    setIsFocused(false)
  }, [])

  const callTheWaiter = useCallback(async () => {
    if (message === "") {
      return toast.error("Please select a message to call staff")
    }
    if (loading) {
      return toast.error("Please wait for a moment")
    }
    setLoading(true)
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
    })
    if (!res.ok) {
      setLoading(false)
      return errorText(res.status)
    }
    if (res.status === 200) {
      toast.success("Staff will be there soon. Thank you!!")
      onClose()
    }
  }, [businessId, tableName, message, name, userDetails._id, loading, errorText, onClose])

  const handleCloseInput = useCallback(() => {
    if (!Object.keys(messageImageMap).includes(message)) {
      setMessage("")
    }
    setIsFocused(false)
  }, [message, messageImageMap])

  return (
    <div className="relative h-screen overflow-auto bg-white hide-scrollbar">
      <ConfettiHeader direction="top" />
      <center className="mt-20">
        <Image src={ReceptionBell} alt="ReceptionBell" height={143} width={143} />
        <h1 className="my-2 text-2xl font-semibold text-black">Calling Captain?</h1>
        <p className="mt-2 text-sm text-gray-500">What should we tell the captain to help you with </p>
      </center>

      {/* Enhanced Input Area */}
      <div className="relative m-3">
        <div
          className={cn(
            "relative flex items-center transition-all duration-300",
            isFocused ? "transform scale-[1.02]" : "",
          )}
        >
          <input
            type="text"
            id="name"
            placeholder="Enter your request..."
            value={!Object.keys(messageImageMap).includes(message) ? message : ""}
            maxLength={30}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full pl-4 py-2 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
          />
          <AnimatePresence>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleCloseInput}
              className="absolute right-2 top-2 p-1 text-red-500 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </AnimatePresence>
          <small className="absolute bottom-1 right-10 text-gray-400 text-xs">
            {message?.length}/{30}
          </small>
        </div>


        {/* Quick Suggestions */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200"
            >
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => handleSelectMessage(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 active:bg-gray-200 hover:text-gray-900 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid Options */}
      <motion.ul
        className="grid flex-grow grid-cols-2 gap-5 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Object.entries(messageImageMap).map(([messageText, imageSrc]) => (
          <motion.li
            key={messageText}
            className={cn(
              message === messageText ? "border-[#008800] border-2 bg-green-50" : "border-[#CACACA] border",
              "overflow-hidden rounded-2xl pb-4 h-[11rem] relative cursor-pointer flex flex-col items-center justify-center hover:shadow-md transition-all duration-300",
            )}
            onClick={() => handleSelectMessage(messageText)}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="py-4 bg-[#ffffff] text-base-content">
              <Image
                src={imageSrc}
                alt={messageText}
                height={120}
                width={120}
                objectFit="cover"
                className="transition-transform duration-300 ease-in-out transform hover:scale-110"
              />
            </motion.div>
            <h3 className="text-sm font-medium text-center text-[#000000]">{messageText}</h3>
          </motion.li>
        ))}
      </motion.ul>

      {/* Enhanced Button */}
      <div className="mx-4 pb-20">
        <button
          type="button"
          onClick={callTheWaiter}
          className={cn(message?.length > 0 ? "bg-[#008800] text-white" : "bg-[#FFFFFF] text-gray-500", "w-full border border-[#cacaca] text-base p-3 rounded-xl")}
        >
          {message?.length > 0 ? 'Continue' : 'Select the option and call'}
        </button>
      </div>
    </div>
  )
}

const MemoCallTheWaiterComponent = memo(CallTheWaiterComponent)
export default MemoCallTheWaiterComponent

