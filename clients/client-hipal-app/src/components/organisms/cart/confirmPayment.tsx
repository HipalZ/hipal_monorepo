import useTableData from '@/components/store/useTableData'
import Image from 'next/image'
import React, { memo, useCallback } from 'react'
import BillPrint from "@/assets/cart/BillPrint.png"

const MemoConfirmPayment = () => {
    const { tableName } = useTableData()
    return (
        <center>
            <h1>Before we get you bill !</h1>
            <span>{tableName}</span>
            <Image src={BillPrint} alt="BillPrint" />
            <h1>No further items can be placed</h1>
            <p>After the bill is generated for this table</p>
        </center>
    )
}

const ConfirmPayment = memo(MemoConfirmPayment)
export default ConfirmPayment