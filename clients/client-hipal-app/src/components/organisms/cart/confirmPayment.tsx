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
                    <h1 className="text-2xl font-bold text-[#525252]">
                        Before we get you bill!
                    </h1>
                    <p className="text-lg text-[#52525280]">
                        Table: {tableName}
                    </p>
                </div>
                <div className="relative bg-[#8DC1F120] w-[250px] mt-8 aspect-square rounded-full overflow-hidden">
                    <TransitionImages images={images} />
                </div>
                <motion.div
                    className="poppins-regular w-full max-w-md space-y-2 text-center my-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-[#525252]">
                        No further items can be placed!
                    </h2>
                    <p className="text-sm text-[#52525280]">
                        After the bill is generated for this table.
                    </p>
                </motion.div>
            </div>
            <div className="mt-36 w-full max-w-md px-4 sticky bottom-2">
                <div className="poppins-regular my-8">
                    <button
                        type="button"
                        onClick={goBack}
                        className={cn("bg-gray-50 text-[#B0B0B0] border", "w-full text-base p-4 rounded-xl")}
                    >
                        Go Back and Check Again
                    </button>
                </div>
                <SwipeToPlaceOrder placeOrder={placeOrder} />
            </div>
        </>
    )
}

const ConfirmPayment = memo(MemoConfirmPayment)
export default ConfirmPayment

