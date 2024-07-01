import BottomPopUp from "@/components/atoms/bottomPopUp";
import BottomButton from '@/components/molecules/bottomButton'
import { ChangeEvent, memo, useState } from "react";

interface IAvailableCoinz {
    isModalOpen: boolean,
    closeModal: () => void,
    userCoinz: number,
    claimedCoinz: number,
    handleApplyCoinz: (value: number) => void,
    maxCoinz :number,
    setMaxCoinz :(value:number) => void,
    billValue : number,
    setClaimAmount: number
}

const AvailableCoinz = memo((props: IAvailableCoinz) => {
    const { isModalOpen, closeModal, userCoinz, claimedCoinz, handleApplyCoinz ,billValue, setMaxCoinz, setClaimAmount} = props;
    const [tempClaimedCoinz, setTempClaimedCoinz] = useState(claimedCoinz);

    const handleChange = (event: ChangeEvent<HTMLInputElement>, userCoinz: number) => {
        const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ''));
        const canClaimCoinz = Math.round(billValue * (setClaimAmount / 100) || 0);
        const coinsToSet = canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;
        if (userEnteredValue > coinsToSet) {
            setMaxCoinz(coinsToSet)
            setTempClaimedCoinz(coinsToSet);
        } else {
            setMaxCoinz(userEnteredValue)
            setTempClaimedCoinz(userEnteredValue);
        }
    };

    // Update global state on button click
    const handleNextClick = () => {
        handleApplyCoinz(tempClaimedCoinz);
    };
    return (
        <BottomPopUp show={isModalOpen} onClose={closeModal}>
            <div className='h-[15rem] p-6'>
                <h1 className='text-xl font-semibold'>
                    Available Coins : {claimedCoinz ? userCoinz - claimedCoinz : userCoinz}
                </h1>
                {tempClaimedCoinz > 0 ? <p className="mt-1 text-xs">Max Coinz can claim upto  {tempClaimedCoinz}</p>: null}
                <br />
                <input
                    onChange={(e) => handleChange(e, userCoinz)}
                    type='tel'
                    value={tempClaimedCoinz}
                    placeholder={`Enter the coinz to apply`}
                    min={0}
                    max={userCoinz}
                    className='border border-[#000] pl-4 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-[1rem] min-w-389 min-w-[95%] my-auto !py-2 '
                />
            </div>
            <BottomButton>
                <button className="w-full px-4 py-3 rounded-full bg-primary text-base-100" onClick={handleNextClick}>
                    Next
                    </button>
            </BottomButton>
        </BottomPopUp>
    )
});

export default AvailableCoinz;