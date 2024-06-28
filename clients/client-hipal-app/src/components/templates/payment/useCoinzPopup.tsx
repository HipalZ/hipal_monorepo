import { IoMdCard } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { memo, useCallback, useState } from "react";
import AddAmountModal from "@/components/molecules/bottomButton/addAmountModal";
import BottomPopUp from "@/components/atoms/bottomPopUp";

interface IUseCoinzPopup {
    claimedCoinz: number,
    openModal: () => void,
    userCoinz: number
}

const UseCoinzPopup = (props: IUseCoinzPopup) => {
    const { claimedCoinz, openModal, userCoinz } = props;
    const [editBillModal, setEditBillModal] = useState(false);
    
    const openBillModal = useCallback(() => {
        setEditBillModal(true);
    }, [setEditBillModal]);
    
    const closeBillModal = useCallback(() => {
        setEditBillModal(false);
    }, [setEditBillModal]);
    
    return (
        <>
            <center className="flex items-center justify-center my-2">
                <button onClick={openBillModal} className="px-2 py-1 text-sm border rounded-full border-primary">
                    <CiEdit className="inline-block" />
                    <span className="px-2 py-2">
                        Edit Bill Value
                    </span>
                </button>
            </center>
            <h1 className="mx-4 font-semibold">Rewardz</h1>
            <article
                onClick={openModal}
                className='animation-shake flex justify-between items-center border border-primary h-[90px] mx-4 rounded-3xl p-6 mt-4'
            >
                <div className='flex items-center'>
                    <IoMdCard size={30} className='-rotate-45 ' />
                    &nbsp; &nbsp;
                    <div>
                        <h6>Use Coinz</h6>
                        <h6>{claimedCoinz} coinz applied</h6>
                    </div>
                </div>
                <div className='flex items-center space-x-4'>
                    <h6>
                        {userCoinz - claimedCoinz}
                    </h6>
                    <MdKeyboardArrowRight size={30} />
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

export default memo(UseCoinzPopup);