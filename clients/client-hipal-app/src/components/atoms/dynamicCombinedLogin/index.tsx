"use client"
import { useParams } from 'next/navigation'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import BottomPopUp from '../bottomPopUp'
import CombinedLogin from '@/components/templates/posPayment/CombinedLogin'
import dynamic from 'next/dynamic'
import React, { memo, useCallback } from 'react'
import { useGoNext } from '@/utils/helper'

const SignUpBonus = dynamic(() => import('@/components/organisms/explore/signupbonus'))

const MemoDynamicCombinedLogin = () => {
    const { goNext } = useGoNext();
    const { setCheckLogin, checkLogin, openBlastModal, coinz, setOpenBlastModal } = usePaymentStore();

    const handleNext = useCallback(() => {
        setOpenBlastModal(false);
        setCheckLogin(true);
        goNext();
    }, [setOpenBlastModal, setCheckLogin, goNext]);

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
                <SignUpBonus coinZ={coinz} goNext={handleNext} />
                : null}
        </>
    )
}

const DynamicCombinedLogin = memo(MemoDynamicCombinedLogin)
export default DynamicCombinedLogin