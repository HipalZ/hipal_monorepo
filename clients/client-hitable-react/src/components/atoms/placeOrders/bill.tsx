import { useOrderStore } from '@/components/store/useOrderData'
import { memo } from 'react'
import BillWarning from './billWarning'
import GetBill from './getBill'

const MemoBill = () => {

    const { paymentSteps } = useOrderStore()

    return (
        <div>
            {
                paymentSteps === 0 && (
                    <BillWarning />
                )
            }
            {
                paymentSteps === 1 && (
                    <GetBill />
                )
            }
        </div>
    )
}

const Bill = memo(MemoBill)
export default Bill
