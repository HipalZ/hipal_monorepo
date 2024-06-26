import { memo } from "react";
import { BsPatchPlusFill } from "react-icons/bs";

interface IBillSummary{
    billValue: number,
    claimedCoinz: number,
    tips: number,
    isTipActive: boolean,
    setIsTipActive: (value: boolean) => void,
    clearTheTip: () => void,
    handleTipSelect: (tip: string) => void,
    selectedTip: string,
    customTip: string,
    showInput: boolean,
    handleCustomTip: (e: any) => void,
    handleSaveTip: () => void
}

const BillSummary = memo((props:IBillSummary) => {
    const { billValue, claimedCoinz, tips, isTipActive, setIsTipActive, clearTheTip, handleTipSelect, selectedTip, customTip, showInput, handleCustomTip, handleSaveTip } = props;
    return (
        <div className='flex flex-col pb-20 space-y-2 text-4xl transition-all shadow-none rounded-t-3xl'>
            <h6 className="mx-6 mt-4 text-base">Bill Summary</h6>
            <div className='relative mx-6 text-[1.25rem] text-base-content border border-primary py-4 rounded-2xl'>
                <div className='text-base font-semibold flex justify-between mx-4 mb-4 capitalize text-base-content leading-[1.25rem]'>
                    <h1>Total bill amount</h1>
                    <h1>₹ {billValue}</h1>
                </div>
                {claimedCoinz > 0 && (
                    <div className='flex justify-between mx-4 mt-1 text-sm capitalize text-base-content'>
                        <h1 className='text-[1rem]'>Hi-Coinz</h1>
                        <div className='flex'>
                            <span className='text-base'>
                                ₹ {claimedCoinz || 0}
                            </span>
                        </div>
                    </div>
                )}
                <div className='mx-2 mt-2'>
                    <div className='flex justify-between m-2 text-sm capitalize text-base-content'>
                        <div className="flex items-center">
                            <span onClick={() => setIsTipActive(true)}><BsPatchPlusFill size={22} /></span>
                            <h1 className='text-[1rem] mx-2'>Tips </h1>
                            {isTipActive ? <span onClick={clearTheTip} className="underline">(Clear Tip)</span> : null}
                        </div>
                        <div className='flex'>
                            <span className='text-base'>
                                ₹ {tips || 0}
                            </span>
                        </div>
                    </div>
                    {isTipActive ? <div className='flex mx-2 space-x-2'>
                        {['10', '20', '50', 'Other'].map((tip, index) => (
                            <button
                                key={index}
                                onClick={() => handleTipSelect(tip)}
                                className={`px-4 py-1 rounded-lg text-base ${selectedTip === tip ? 'bg-primary text-white' : 'bg-gray-200'}`}
                            >
                                {tip}
                            </button>
                        ))}
                    </div> : null}
                    {selectedTip === 'Other' && showInput && (
                        <div className='flex mt-4 space-x-6'>
                            <input
                                type="text"
                                onChange={handleCustomTip}
                                value={customTip}
                                maxLength={5}
                                placeholder='Enter tip amount'
                                className='w-[70%] border border-[#000] pl-4 font-semibold text-[1rem] rounded-[1rem]'
                            />
                            <button
                                onClick={handleSaveTip}
                                className='px-4 py-2 text-base text-white rounded-lg bg-primary'
                            >
                                Save
                    </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
});

export default BillSummary;