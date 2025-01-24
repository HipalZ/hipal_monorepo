"use client";
import ScanPage from '@/components/templates/posPayment/paymentScanner'
import React, { memo, useEffect } from 'react'
import BottomPopUp from '../bottomPopUp'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import useTableData, { resetTableData } from '@/components/store/useTableData';
import { debounce } from 'lodash-es';

const MemoDynamicScanPage = () => {
    const { showScan,
        setShowScan,
    } = usePaymentStore()

    const { tableNameTimeStamp, setTableNameTimeStamp, setIsVisible } = useTableData()

    useEffect(() => {
        const checkTableNameExpiry = () => {
            const currentTime = new Date().getTime();
            const threeHoursInMillis = 3 * 60 * 60 * 1000;

            // If the last update timestamp is recent, skip resetting
            if (tableNameTimeStamp && (currentTime - tableNameTimeStamp) < threeHoursInMillis) {
                return;
            }

            // Reset only if the condition is met
            if (tableNameTimeStamp && (currentTime - tableNameTimeStamp) > threeHoursInMillis) {
                resetTableData();
                setIsVisible(true);
            }
        };

        // Debounced function to handle user interaction
        const handleUserInteraction = debounce(() => {
            const currentTime = new Date().getTime();
            setTableNameTimeStamp(currentTime);
            checkTableNameExpiry();
        }, 1000);

        // Add event listeners
        window.addEventListener("click", handleUserInteraction);
        window.addEventListener("keydown", handleUserInteraction);
        window.addEventListener("touchstart", handleUserInteraction);

        return () => {
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("keydown", handleUserInteraction);
            window.removeEventListener("touchstart", handleUserInteraction);
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