"use client";
import ScanPage from '@/components/templates/posPayment/paymentScanner'
import React, { memo } from 'react'
import BottomPopUp from '../bottomPopUp'
import { usePaymentStore } from '@/components/store/usePaymentStore'

const MemoDynamicScanPage = () => {
    const { showScan,
        setShowScan,
    } = usePaymentStore()
    return (
        <>
            {showScan && <BottomPopUp show={showScan} onClose={() => setShowScan(false)}>
                <ScanPage />
            </BottomPopUp>}
        </>
    )
}

const DynamicScanPage = memo(MemoDynamicScanPage)
export default DynamicScanPage