"use client";

import { apiRpc } from "@hi/common";
import { cn } from "@/components/utils/helpers"
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/components/store/useCart"
import { useQuery } from "@tanstack/react-query";
import BillImage from "@/assets/call/BillImage.png";
import BillPrint from "@/assets/cart/BillPrint.png"
import dynamic from "next/dynamic"
import KotMachine from "@/assets/cart/KotMachine.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData"

const ScannerButton = dynamic(() => import("./scannerButton"));
const TransitionImages = dynamic(() => import("./transitionImages"));
const CallTheCaptain = dynamic(() => import("./callTheCaptain"));
const SwipeToPlaceOrder = dynamic(() => import("./swipeToPlaceOrder"))

const MemoConfirmPayment = () => {
    const { setCartPage } = useCart()
    const { tableName, isTransfer, setIsTransfer } = useTableData()
    const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
    // List of images to slide
    const images = [BillPrint, KotMachine, BillImage];

    const placeOrder = useCallback(() => {
        setCartPage("payment")
    }, [setCartPage]);

    const goBack = useCallback(() => {
        setCartPage("order")
    }, [setCartPage]);

    const checkTableSession = async () => {
        const response = await apiRpc.table.get_table_session[":tableName"][":businessId"].$get({
            param: {
                tableName,
                businessId,
            }
        })
        const res = await response.json();
        setIsTransfer(res.data?.isTransfer || false);
        return res;
    }

    useQuery({
        queryKey: ["businessSettings", businessId, tableName],
        queryFn: checkTableSession,
        enabled: !!businessId && !!tableName,
    });

    return (
        <>
            <article className="flex flex-col items-center p-6 bg-white">
                <div className="w-full max-w-md space-y-3 text-center my-4 poppins-regular">
                    <h1 className="text-2xl font-bold text-black inline-flex items-center">
                        {isTransfer ? "Table Transfer Notice" : "Before we get you bill!"}
                    </h1>
                    <p className={cn(isTransfer ? "justify-around" : "justify-center", "text-lg flex items-center")}>
                        <span>Table: {tableName}</span>
                        <span>{isTransfer ? <ScannerButton /> : null}</span>
                    </p>
                </div>
                <div className="relative bg-[#8DC1F120] w-[250px] mb-8 aspect-square rounded-full overflow-hidden">
                    <TransitionImages images={images} />
                </div>
                <motion.div
                    className="poppins-regular w-full max-w-md space-y-2 text-center mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-black">
                        {isTransfer ? "Cannot Generate Bill" : "No further items can be placed!"}
                    </h2>
                    <p className="text-sm text-black">
                        {isTransfer
                            ? "As your table was just shifted, please approach the captain for bill generation."
                            : "After the bill is generated for this table."}
                    </p>
                </motion.div>
            </article>
            <article className="mt-36 poppins-regular space-y-4 w-full max-w-md px-4 sticky bottom-2">
                <button
                    type="button"
                    onClick={goBack}
                    className={cn("bg-gray-50 border-black/50 text-black/50 border w-full text-base p-3 rounded-xl")}
                >
                    {isTransfer ? "Go Back" : "Go Back and Check Again"}
                </button>
                {!isTransfer && <SwipeToPlaceOrder placeOrder={placeOrder} />}
                {isTransfer && <CallTheCaptain messageToSend="Please Settle My Table" messageDisplay="Ask Captain To Get Bill" className="text-green-700 border-green-700" />}
            </article>
        </>
    )
}

const ConfirmPayment = memo(MemoConfirmPayment)
export default ConfirmPayment

