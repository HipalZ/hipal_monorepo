import { IoMdCard } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { memo, useCallback, useState } from "react";
import AddAmountModal from "@/components/molecules/bottomButton/addAmountModal";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { RiCouponFill } from "react-icons/ri";

interface IUseCoinzPopup {
    openModal: () => void,
    claimedCoinz: number,
    userCoinz: number
}

const UseCoinzPopup = (props: IUseCoinzPopup) => {
    const { openModal, claimedCoinz, userCoinz } = props;
    const [editBillModal, setEditBillModal] = useState(false);
    const loyaltySetting = useLoyaltyData(s => s.loyaltySetting)
    const openBillModal = useCallback(() => {
        setEditBillModal(true);
    }, []);

    const closeBillModal = useCallback(() => {
        setEditBillModal(false);
    }, []);

    return (
        <>
            <center className="flex items-center justify-center my-2">
                <button type="button" onClick={openBillModal} className="px-2 py-1 text-sm border rounded-full border-primary">
                    <CiEdit className="inline-block" />
                    <span className="px-2 py-2">
                        Edit Bill Value
                    </span>
                </button>
            </center>
            <h1 className="mx-4 text-xl font-semibold">Rewardz</h1>
            <article
                onClick={openModal}
                className='animation-shake flex justify-between items-center h-[90px] mx-4 rounded-3xl p-6 mt-4 bg-base-200'
            >
                <div className='flex items-center'>
                    <IoMdCard size={30} className='-rotate-45 ' />
                    &nbsp; &nbsp;
                    <div>
                        <h6>Use Coinz</h6>
                        <h6 className="text-xs">You can use {loyaltySetting.setClaimAmount} % of <span className="font-bold">{claimedCoinz ? userCoinz - claimedCoinz : userCoinz} coinz</span> </h6>
                    </div>
                </div>
                <div className='flex items-center space-x-4'>
                    Apply
                </div>
            </article>
            <article
                className='animation-shake flex justify-between items-center h-[90px] mx-4 rounded-3xl p-6 mt-4 bg-base-200'
            >
                <div className='flex items-center'>
                    <RiCouponFill size={30} className='-rotate-45 ' />
                    &nbsp; &nbsp;
                    <div>
                        <h6>Use Couponz</h6>
                        <h6 className="text-xs">You can use <span className="font-bold">5 Couponz </span> </h6>
                    </div>
                </div>
                <div className='flex items-center space-x-4 text-sm'>
                    Coming Soon
                </div>
            </article>
            {
                editBillModal && (
                    <BottomPopUp show={editBillModal} onClose={closeBillModal}>
                        <AddAmountModal />
                    </BottomPopUp>
                )
            }
        </>
    )
};

const MemoUseCoinzPopup = memo(UseCoinzPopup);
export default MemoUseCoinzPopup