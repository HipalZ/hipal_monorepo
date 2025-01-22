"use client"
import { useParams } from 'next/navigation'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import BottomPopUp from '../bottomPopUp'
import CombinedLogin from '@/components/templates/posPayment/CombinedLogin'
import dynamic from 'next/dynamic'
import React, { memo, useCallback } from 'react'
import { useGoNext } from '@/utils/helper'
import { useLogin } from '@/components/store/useLogin'

const SignUpBonus = dynamic(() => import('@/components/organisms/explore/signupbonus'))

const MemoDynamicCombinedLogin = () => {
    const { goNext } = useGoNext();
    const { setCheckLogin, checkLogin, openBlastModal, coinz, setOpenBlastModal } = usePaymentStore();
    const { setSubscribeModal } = useLogin();
    const handleNext = useCallback(() => {
        setOpenBlastModal(false);
        setCheckLogin(false);
        setSubscribeModal(false);
        goNext();
    }, [setOpenBlastModal, setCheckLogin, goNext, setSubscribeModal]);

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
                <SignUpBonus goNext={handleNext} />
                : null}
        </>
    )
}

const DynamicCombinedLogin = memo(MemoDynamicCombinedLogin)
export default DynamicCombinedLogin