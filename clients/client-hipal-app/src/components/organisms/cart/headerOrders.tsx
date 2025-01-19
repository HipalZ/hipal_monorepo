import { useCartStore } from '@/components/store/useCartStore';
import Image from 'next/image'
import React, { memo, useCallback } from 'react'
import { RiQrScan2Line } from 'react-icons/ri'
import glassTable from "@/assets/cart/glassTable.png";
import { usePaymentStore } from '@/components/store/usePaymentStore';

const MemoOrdersHeader = () => {
    const { cartHistory } = useCartStore();
    const { setShowScan } = usePaymentStore();
    const openScanAndPay = useCallback(() => setShowScan(true), [setShowScan]);

    return (
        <header className="poppins-regular sticky top-0 flex-none bg-white border-b">
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-medium">Final Cart</h1>
                <div className="flex items-center gap-2 text-gray-600">
                    {cartHistory[0]?.tableName && (
                        <div className="text-sm text-gray-500 inline-flex items-center gap-1">
                            <Image src={glassTable} alt="Table" className="pb-1" />
                            <span className="text-base">Table {cartHistory[0]?.tableName}</span>
                        </div>
                    )}
                </div>
                <article onKeyDown={openScanAndPay} onClick={openScanAndPay} className="relative inline-block">
                    <RiQrScan2Line size={36} />
                    <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full" />
                </article>
            </div>
        </header>
    )
}

const OrdersHeader = memo(MemoOrdersHeader)
export default OrdersHeader