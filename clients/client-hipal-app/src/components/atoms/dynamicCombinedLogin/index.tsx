"use client"
import { useParams } from 'next/navigation'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import BottomPopUp from '../bottomPopUp'
import CombinedLogin from '@/components/templates/posPayment/CombinedLogin'
import dynamic from 'next/dynamic'
import React, { memo, useCallback } from 'react'

const SignUpBonus = dynamic(() => import('@/components/organisms/explore/signupbonus'))

const MemoDynamicCombinedLogin = () => {
    const params = useParams();
    const customLink = params?.businessId || "";
    const { setCheckLogin, checkLogin, openBlastModal, coinz, setOpenBlastModal } = usePaymentStore();

    const goNext = useCallback(() => {
        setOpenBlastModal(false);
        setCheckLogin(true);
        setTimeout(() => {
            window.location.href = `/${customLink}/explore`;
        }, 2000);
    }, [setOpenBlastModal, setCheckLogin, customLink]);

    return (
        <>
            <BottomPopUp
                hide
                onClose={() => setCheckLogin(false)}
                show={checkLogin}
            >
                <CombinedLogin />
            </BottomPopUp>
            {openBlastModal ?
                <SignUpBonus coinZ={coinz} goNext={goNext} />
                : null}
        </>
    )
}

const DynamicCombinedLogin = memo(MemoDynamicCombinedLogin)
export default DynamicCombinedLogin