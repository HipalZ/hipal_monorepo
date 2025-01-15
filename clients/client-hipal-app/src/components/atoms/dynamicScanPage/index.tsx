"use client";
import ScanPage from '@/components/templates/posPayment/paymentScanner'
import React, { memo, useEffect } from 'react'
import BottomPopUp from '../bottomPopUp'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import useTableData, { resetTableData } from '@/components/store/useTableData';

const MemoDynamicScanPage = () => {
    const { showScan,
        setShowScan,
    } = usePaymentStore()

    const { tableNameTimeStamp, setIsVisible } = useTableData()
    useEffect(() => {
        const checkTableNameExpiry = () => {
            const currentTime = new Date().getTime();
            const threeHoursInMillis = 10 * 60 * 1000;

            if (tableNameTimeStamp && currentTime - tableNameTimeStamp > threeHoursInMillis) {
                resetTableData()
                setIsVisible(true)
            }
        };

        const handleUserInteraction = () => {
            checkTableNameExpiry();
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('keydown', handleUserInteraction);
        window.addEventListener('touchstart', handleUserInteraction);

        return () => {
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('keydown', handleUserInteraction);
            window.addEventListener('touchstart', handleUserInteraction);
        };
    }, [tableNameTimeStamp, setIsVisible]);
    return (
        <>
            {showScan && <BottomPopUp hide show={showScan} onClose={() => setShowScan(false)}>
                <ScanPage />
            </BottomPopUp>}
        </>
    )
}

const DynamicScanPage = memo(MemoDynamicScanPage)
export default DynamicScanPage