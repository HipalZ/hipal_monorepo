import { RiQrScan2Line } from 'react-icons/ri';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import React, { memo, useCallback } from 'react'

const MemoScannerButton = () => {
    const { setShowScan } = usePaymentStore();
    const openScanAndPay = useCallback(() => setShowScan(true), [setShowScan]);

    return (
        <article onKeyDown={openScanAndPay} onClick={openScanAndPay} className="relative inline-block">
            <RiQrScan2Line size={36} />
            <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full" />
        </article>
    )
}

const ScannerButton = memo(MemoScannerButton)
export default ScannerButton