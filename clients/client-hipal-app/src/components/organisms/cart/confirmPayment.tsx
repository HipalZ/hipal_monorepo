"use client";
import dynamic from "next/dynamic"
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import useTableData from "@/components/store/useTableData"
import BillPrint from "@/assets/cart/BillPrint.png"
import KotMachine from "@/assets/cart/KotMachine.png";
import BillImage from "@/assets/call/BillImage.png";
import { cn } from "@/components/utils/helpers"
import { useCart } from "@/components/store/useCart"
import TransitionImages from "./transitionImages"

const SwipeToPlaceOrder = dynamic(() => import("./swipeToPlaceOrder"))
const MemoConfirmPayment = () => {
    const { setCartPage } = useCart()
    const { tableName } = useTableData()

    // List of images to slide
    const images = [BillPrint, KotMachine, BillImage];

    const placeOrder = useCallback(() => {
        setCartPage("payment")
    }, [setCartPage]);

    const goBack = useCallback(() => {
        setCartPage("order")
    }, [setCartPage]);

    return (
        <>
            <div className="flex flex-col items-center px-6 py-8 bg-white">
                <div className="w-full max-w-md space-y-3 text-center my-4 poppins-regular">
                    <h1 className="text-2xl font-bold text-black">
                        Before we get you bill!
                    </h1>
                    <p className="text-lg text-[#CACACA]">
                        Table: {tableName}
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
                        No further items can be placed!
                    </h2>
                    <p className="text-sm text-black">
                        After the bill is generated for this table.
                    </p>
                </motion.div>
            </div>
            <div className="mt-36 poppins-regular space-y-4 w-full max-w-md px-4 sticky bottom-2">
                <button
                    type="button"
                    onClick={goBack}
                    className={cn("bg-gray-50 border-black/50 text-black/50 border w-full text-base p-3 rounded-xl")}
                >
                    Go Back and Check Again
                </button>
                <SwipeToPlaceOrder placeOrder={placeOrder} />
            </div>
        </>
    )
}

const ConfirmPayment = memo(MemoConfirmPayment)
export default ConfirmPayment

