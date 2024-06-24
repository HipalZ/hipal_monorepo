import { HistoryData } from '@/components/types/businessData'
import { timestampToDateTime } from '@/components/utils/helper'
import { MdOutlineCall } from 'react-icons/md'

interface PaymentModalProps {
    salesData: HistoryData
}
const PaymentModal = (props: PaymentModalProps) => {
    const { salesData } = props

    const hideMiddleNumbers = (phone: string) => {
        if (phone.length <= 4) return phone;
        const firstPart = phone.slice(0, 3);
        const lastPart = phone.slice(-3);
        return `${firstPart}****${lastPart}`;
    };

    return (
        <section style={{ maxHeight: '90%', overflowY: 'auto' }}>
            <div className="mx-6 mt-10 flex justify-between">
                <h1 className="text-base text-gray-500">{timestampToDateTime(salesData?.date)}</h1>
                <p>order id : {salesData?._id.slice(-5)}</p>
            </div>
    &nbsp;
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Paid Amount</h1>
                <p>: ₹ {salesData?.order_id?.total}</p>
            </div>
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Bil value entered</h1>
                <p>: ₹ {salesData?.order_id?.billValue}</p>
            </div>
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Including tips</h1>
                <p>: ₹ {salesData?.order_id?.tips}</p>
            </div>
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Discount</h1>
                <p>: {salesData?.order_id?.claimedCoins} Coin used</p>
            </div>
            <hr className="m-6 h-[0.1rem] bg-[#CACACA] text-black" />
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>User</h1>
                <p>: {salesData?.order_id?.name}</p>
            </div>
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Table</h1>
                <p>: {salesData?.order_id?.tableName}</p>
            </div>
            <div className="mx-6 mb-2 grid grid-cols-2">
                <h1>Number</h1>
                <div className="flex">
                    <span>: {salesData?.order_id?.phone ? hideMiddleNumbers(salesData.order_id.phone) : ''}</span>&nbsp;&nbsp;
        <a href={`tel:+91${salesData?.order_id?.phone}`} className="flex items-center rounded-full bg-[#f3eeff] px-2 py-1 text-[#6f2eff]">
                        <MdOutlineCall size={16} />
                        <span className="text-sm">Call</span>
                    </a>
                </div>
            </div>
            <h1 className="mx-6 font-semibold">Used reason</h1>
            <div className="m-6 flex flex-col rounded-2xl bg-gray-300 p-4">
                <h1 id="discount-reason">
                    User {salesData?.order_id?.name} discount applied ₹ {salesData?.order_id?.claimedCoins}
                </h1>
                <br />
            </div>
            {
                salesData?.comment && salesData?.comment.length > 0 ? <>
                    <h1 className="mx-6 font-semibold">
                        Added Comment
                </h1>
                    <div className="m-6 flex flex-col rounded-2xl bg-gray-300 p-4">
                        <p>{salesData?.comment}</p>
                        <br />
                    </div>
                </> : null
            }
        </section>
    )
}

export default PaymentModal