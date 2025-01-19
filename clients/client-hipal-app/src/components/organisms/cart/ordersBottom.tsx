import { useCart } from '@/components/store/useCart';
import React, { memo, useCallback } from 'react'
import { BiRightArrow } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";
import { RiNewspaperLine } from "react-icons/ri";

const MemoOrdersBottom = () => {
    const { setShowCart, setCartPage } = useCart();
    const handleBack = useCallback(() => setShowCart(false), [setShowCart]);
    const handleConfirmBillPage = useCallback(() => setCartPage("confirmPayment"), [setCartPage]);
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-white">
                <div className="p-2 text-center text-xs text-red-500 bg-red-50">
                    Note: Some items modified will be shown in final bill.
                </div>
                <div className="flex items-stretch h-16 p-2 gap-2">
                    <button
                        onClick={handleBack}
                        type="button"
                        className="flex items-center justify-center px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <FaArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={handleConfirmBillPage}
                        type="button"
                        className="px-6 w-full inline-flex items-center justify-between bg-[#008800] rounded-lg text-white font-medium hover:bg-green-800"
                    >
                        <span className="inline-flex items-center gap-2">
                            <RiNewspaperLine size={20} />
                            Generate Final Bill
                        </span>
                        <BiRightArrow className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        </>
    )
}

const OrdersBottom = memo(MemoOrdersBottom)
export default OrdersBottom