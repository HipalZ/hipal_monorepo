import { memo } from "react";

interface IPaymentCard {
    claimedCoinz: number,
    billValue: number,
    logo: string | undefined
}

const PaymentCard = (props: IPaymentCard) => {
    const { claimedCoinz, billValue } = props;
    return (
        <center className={`relative text-xl rounded-b-3xl bg-primary pt-4 text-base-100 ${claimedCoinz > 0 ? "h-[12rem]":"h-[6rem]"}`}>
            <h4>You Pay</h4>
            <h4 className={`${claimedCoinz > 0 ? 'line-through' : 'text-4xl font-bold'}`}>₹ {billValue}</h4>
            {claimedCoinz > 0 ? <h4 className='text-4xl font-bold'>₹ {billValue - claimedCoinz}</h4> : null}
            {
                claimedCoinz > 0 ? <center className="relative text-sm bg-base-100 w-[16rem] text-base-content py-2 rounded-full mt-6">
                    <center className="absolute top-0 z-50 w-5 h-5 transform -translate-x-1/2 -translate-y-1/2 bg-base-100 left-[50%] rotate-45">

                    </center>
                    <button type="button">
                        🥳 Woah ! You are saving ₹{claimedCoinz}
                    </button>
                </center> : null
            }

        </center>
    )
}

const MemoPaymentCard = memo(PaymentCard)
export default MemoPaymentCard;
