import { useHandleMode } from '@/components/hooks/usePayments';
import { useLogin } from '@/components/store/useLogin';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import { calculateFinalBill } from '@/components/utils/helpers';
import { useUserToken } from '@hi/common/src/useUserToken';
import { memo, useCallback } from 'react';

const MemoTotalBillButton = () => {
    const { claimedCoinz, claimCouponz, tips, setEditBillModal, billValue, setCheckLogin } = usePaymentStore();
    const { handleMode } = useHandleMode()
    const accessToken = useUserToken.getState().accessToken;
    const { setUrlFrom } = useLogin()
    const completeUrl = window.location.href;
    const handleEligibility = useCallback(() => {
        if (billValue === 0) {
            setEditBillModal(true);
        }
        if (!accessToken) {
            setCheckLogin(true);
            setUrlFrom(completeUrl)
        } else {
            handleMode("MODE");
        }

    }, [accessToken, setCheckLogin, handleMode, billValue, setEditBillModal, setUrlFrom, completeUrl]);

    return (
        <section
            style={{
                boxShadow: "0px 0px 2px 0px #0000001F",
            }}
            className="fixed bottom-0 w-full max-w-[30rem] h-16 bg-white flex items-center justify-between px-4 !font-bold text-black"
        >
            <h1 className="text-sm text-left inter">
                Total Bill Amount: ₹{" "}
                {calculateFinalBill(
                    billValue,
                    claimedCoinz,
                    claimCouponz,
                    tips,
                )}
                <span className="text-xs">
                    {claimedCoinz > 0 ? (
                        <p className="text-[#4CAF50]">
                            {claimedCoinz} Saved, using coinz
                        </p>
                    ) : null}
                </span>
            </h1>
            <article
                onClick={handleEligibility}
                onKeyDown={handleEligibility}
                className="bg-black text-white text-center w-[8rem] px-3 py-2 rounded-lg inter text-sm on_active_bounce"
            >
                <span>Pay Now</span>
            </article>
        </section>
    )
}

const TotalBillButton = memo(MemoTotalBillButton)
export default TotalBillButton