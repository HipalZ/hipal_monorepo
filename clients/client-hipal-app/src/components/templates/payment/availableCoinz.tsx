import BottomPopUp from "@/components/atoms/bottomPopUp";
import BottomButton from '@/components/molecules/bottomButton'
import { memo } from "react";

interface IAvailableCoinz {
    isModalOpen: boolean,
    closeModal: () => void,
    userCoinz: number,
    claimedCoinz: number,
    handleApplyCoinz: (e: any, userCoinz: number) => void,
    handleCoins: () => void
    maxCoinz
}

const AvailableCoinz = memo((props: IAvailableCoinz) => {
    const { isModalOpen, closeModal, userCoinz, claimedCoinz, handleApplyCoinz, handleCoins } = props;
    return (
        <BottomPopUp show={isModalOpen} onClose={closeModal}>
            <div className='h-[15rem] p-6'>
                <h1 className='text-xl font-semibold'>
                    Available Coins : {claimedCoinz ? userCoinz - claimedCoinz : userCoinz}
                </h1>
                {claimedCoinz > 0 ? <p className="mt-1 text-xs">Max Coinz can claim upto  {claimedCoinz}</p>: null}
                <br />
                <input
                    onChange={(e) => handleApplyCoinz(e, userCoinz)}
                    type='tel'
                    value={claimedCoinz}
                    placeholder={`Enter the coinz to apply`}
                    min={0}
                    max={userCoinz}
                    className='border border-[#000] pl-4 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-[1rem] min-w-389 min-w-[95%] my-auto !py-2 '
                />
            </div>
            <BottomButton>
                <button className="w-full px-4 py-3 rounded-full bg-primary text-base-100" onClick={handleCoins}>
                    Next
                    </button>
            </BottomButton>
        </BottomPopUp>
    )
});

export default AvailableCoinz;