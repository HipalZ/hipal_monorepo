"use client"
import PlaceholderImg from "@/components/atoms/placeholder";
import { isEmpty } from "lodash-es";
import Image from "next/image";
import celebration from '@/assets/img/celebration-emoji.png'
import { IoMdCard } from "react-icons/io";
import { MdCurrencyRupee, MdKeyboardArrowRight, MdOutlineChevronLeft } from "react-icons/md";
import { getRandomBlurImg } from "@/components/utils/images";
import { ChangeEvent, useEffect, useState } from "react";
import BottomButton from "@/components/molecules/bottomButton";
import { IBusinessData } from "@/components/types/businessData";
import { useRouter } from "next/navigation";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/utils/axios";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import MiddlePopUp from "@/components/atoms/middlePopUp";
import { SlCreditCard } from 'react-icons/sl'
import { toast } from "react-toastify";
import confetti from "canvas-confetti";

type PageStates = 'INVOICE' | 'MODE'

const Payment = ({ data }: { data: IBusinessData }) => {
    const [claimedCoinz, setClaimedCoinz] = useState<number>(data?.loyalty?.setClaimAmount)
    const [tips, setTips] = useState(0);
    const [showInput, setShowInput] = useState(false);
    const [selectedTip, setSelectedTip] = useState('');
    const [customTip, setCustomTip] = useState('');
    const [selectedMode, setSelectedMode] = useState<PageStates>('INVOICE')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [openPopUp, setOpenPopUp] = useState(true)
    const [userCoinz, setUserCoinz] = useState(0)
    const [amount, setAmount] = useState(0);
    const { userDetails } = useLogin()
    const router = useRouter()

    // useEffect(() => {
    //     setClaimedCoinz(data?.loyalty?.setClaimAmount || 0)
    // }, [data?.loyalty?.setClaimAmount])


    const handleTipSelect = (tip) => {
        if (tip === 'Other') {
            setSelectedTip(tip);
            setShowInput(true);
            setCustomTip('');
            setTips(0);
        } else {
            setSelectedTip(tip);
            setShowInput(false);
            setTips(Number(tip));
            setCustomTip('');
        }
    };

    const handleCustomTip = (event) => {
        const value = event.target.value;
        setCustomTip(value);
        setTips(Number(value));
    };

    const handleSaveTip = () => {
        setShowInput(false);
    };


    const handleMode = (mode) => {
        setSelectedMode(mode);
    };
    const handleUserCoinz = async () => {
        try {
            const config = {
                method: 'GET',
                url: `/v1/users/:businessId/getUserReward?userPhone=${userDetails.phone}&loyaltyId=${data?.loyalty?.loyaltyId}`,
            }
            const response = await axios(config)
            setUserCoinz(response.data.rewards)
        } catch (err) {
            console.log(err)
        }
    }
    const navigateTermsAgreement = () => {
        router.push('/terms&Conditions')
    }
    const openModal = async () => {
        await handleUserCoinz()
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleTotalAmount = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(Number(value))
        if (claimedCoinz) {
            toast.error('Reapply coinz to apply')
            setClaimedCoinz(0)
        }
    }

    const handleApplyCoinz = (event: Event, userCoinz: number) => {
        const userEnteredValue = Number((event.target as HTMLInputElement).value);
        const canClaimCoinz = Math.round(amount * (data?.loyalty?.setClaimAmount / 100) || 0);
        const coinsToSet = canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;

        if (userEnteredValue > coinsToSet) {
            setClaimedCoinz(coinsToSet);
        } else {
            setClaimedCoinz(userEnteredValue);
        }
    };

    const handleBack = () => {
        router.push(`${routePaths[PAGE_TYPES.CATEGORY](data?.business?._id || '')}`)
    }

    const handleCoins = async () => {
        // if has claim coinz then celebrate
        setIsModalOpen(false)
        if (claimedCoinz !== null && claimedCoinz > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            })
        }
    }

    const handlePayment = () =>{
        console.log('trigger payment')
    }

    const renderPopUpContent = () => {
        return (
            <BottomPopUp show={isModalOpen} onClose={closeModal}>
                <div className='h-[15rem] p-6'>
                    <h1 className='text-xl font-semibold'>
                        Available Coins : {claimedCoinz ? userCoinz - claimedCoinz : userCoinz}
                    </h1>
                    <h6 className='my-1 text-sm opacity-50'>Enter No. of coins</h6>
                    <br />
                    <input
                        onChange={(e) => handleApplyCoinz(e, userCoinz)}
                        type='number'
                        value={claimedCoinz || ''}
                        placeholder='Enter amount'
                        min={0}
                        max={userCoinz}
                        className='border border-[#000] pl-4 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-[1rem] min-w-389 min-w-[95%] my-auto !py-2 '
                    />
                </div>
                <BottomButton onClick={handleCoins}>Next</BottomButton>
            </BottomPopUp>
        )
    }

    return (
        <div className='relative'>
            <section className='sticky top-0 z-20 w-full px-4 pt-4 pb-2 bg-base-100'>
                <article>
                    <span className='float-start'>
                        <button
                            onClick={handleBack}
                            type='button'
                            className='flex flex-row w-10 h-10 mr-auto rounded-full bg-black/40 on_active_bounce'
                        >
                            <div className='flex flex-row m-auto'>
                                <MdOutlineChevronLeft className='text-3xl text-white ' />
                            </div>
                        </button>
                    </span>
                </article>
                <center className='absolute mt-2 ml-8 text-xl font-semibold left-1/3'>You Pay</center>
                <br />
                <br />
                <article className='relative h-[10rem] flex flex-col items-center justify-center mx-4 mt-10 space-y-2 text-xl rounded-3xl bg-primary text-base-100'>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '0',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            aspectRatio: '1',
                        }}
                    >
                        {!isEmpty(data?.business?.logo) ? (
                            <Image
                                src={data?.business?.logo || ''}
                                height={150}
                                width={150}
                                quality={95}
                                objectFit='cover'
                                alt='logo-business'
                                className='object-center w-1/2 border rounded-lg shadow-sm aspect-square'
                                placeholder='blur'
                                blurDataURL={getRandomBlurImg(100, 100)}
                            />
                        ) : (
                            <PlaceholderImg />
                        )}
                    </div>
                    <br />
                    {claimedCoinz > 0 ? <h4 className='text-4xl'>₹ {amount - claimedCoinz}</h4> : null}
                    <h4 className='line-through'>₹ {amount}</h4>
                </article>
                <center className="text-2xl">
                    Enter the Amount
                </center>
                <input
                    type='text'
                    onChange={handleTotalAmount}
                    value={amount || ''}
                    placeholder='Enter amount'
                    maxLength={6}
                    className='w-[95%] border border-[#000] pl-4 min-h-[3rem] font-semibold text-[1rem] rounded-[1rem] my-auto !py-2 mx-4 mt-4'
                />
                <div className='my-2'>
                    <h6 className='flex px-4 py-1 m-auto text-sm rounded-lg w-fit bg-base-100 text-base-content'>
                        <span className='text-[2rem]'>
                            <Image src={celebration} alt='celebration' height={25} width={25} />
                        </span>{' '}
                        &nbsp;&nbsp;Special discount for Special members !!!
                    </h6>
                </div>
                <article
                    onClick={openModal}
                    className='animation-shake flex justify-between items-center border border-primary h-[90px] mx-4 rounded-3xl p-6'
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
                            {userCoinz}
                        </h6>
                        <MdKeyboardArrowRight size={30} />
                    </div>
                </article>
            </section>
            <div className='flex flex-col pb-20 space-y-2 text-4xl transition-all shadow-none rounded-t-3xl'>
                <h6 className="text-base mx-6 mt-4 mb-2">Bill Summary</h6>
                <div className='relative mx-6 text-[1.25rem] text-base-content border border-primary py-4 rounded-2xl'>
                    <div className='text-base font-semibold flex justify-between mx-4 mb-4 capitalize text-base-content leading-[1.25rem]'>
                        <h1>Total bill amount</h1>
                        <h1>₹ {amount}</h1>
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
                            <h1 className='text-[1rem]'>Tips</h1>
                            <div className='flex'>
                                <span className='text-base'>
                                    ₹ {tips || 0}
                                </span>
                            </div>
                        </div>
                        <div className='flex space-x-2 mx-2'>
                            {['10', '20', '50', 'Other'].map((tip, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTipSelect(tip)}
                                    className={`px-4 py-1 rounded-lg text-base ${selectedTip === tip ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                >
                                    {tip}
                                </button>
                            ))}
                        </div>
                        {selectedTip === 'Other' && showInput && (
                            <div className='relative mt-4'>
                                <input
                                    type="number"
                                    onChange={handleCustomTip}
                                    value={customTip}
                                    placeholder='Enter tip amount'
                                    className='w-full border border-[#000] pl-4 font-semibold text-[1rem] rounded-[1rem]'
                                />
                                <button
                                    onClick={handleSaveTip}
                                    className='absolute right-0 top-0 bg-primary text-white px-2 py-0.5 rounded-lg'
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* <section className='mx-[1.5rem] mb-[1.5rem]'>
                <h1 className='text-base font-semibold text-base-content'>Payment Modes</h1>
                <br />
                <article
                    onClick={() => handleMode('ONLINE')}
                    className={`${data?.business?.isPaymentIntegrated ? '' : 'opacity-50 pointer-events-none'} flex items-center justify-start py-4 space-x-6 border-2 hover:border-primary rounded-2xl`}
                >
                    <input
                        type="radio"
                        name="paymentMode"
                        value="ONLINE"
                        checked={selectedMode === 'ONLINE'}
                        onChange={() => handleMode('ONLINE')}
                        className='mx-4'
                        disabled={!data?.business?.isPaymentIntegrated}
                    />
                    <span className='rounded-full bg-base-200'>
                        <SlCreditCard size={20} />
                    </span>
                    <h1>
                        <span className='text-base font-semibold'>Pay Online</span>
                        <br />
                        <span>UPI | Debit card | Credit Card</span>
                    </h1>
                </article>
                <br />
                <article
                    onClick={() => handleMode('OFFLINE')}
                    className='flex items-center justify-start py-4 space-x-6 border-2 hover:border-primary rounded-2xl'
                >
                    <input
                        type="radio"
                        name="paymentMode"
                        value="OFFLINE"
                        checked={selectedMode === 'OFFLINE'}
                        onChange={() => handleMode('OFFLINE')}
                        className='mx-4'
                    />
                    <span className='bg-base-200 rounded-full'>
                        <MdCurrencyRupee size={20} />
                    </span>
                    <h1>
                        <span className='text-base font-semibold'>Pay Offline</span>
                        <br />
                        <span>Cash</span>
                    </h1>
                </article>
            </section> */}
            <BottomButton themes={data?.settings?.themes}>
                <div onClick={handlePayment} className='flex flex-row capitalize space-x-36'>
                    <div className='flex-col'>
                        <div>₹ Total</div>
                    </div>
                    <div className='flex flex-row'>
                        <span className='my-auto'>Proceed To Pay</span>
                    </div>
                </div>
            </BottomButton>
            {renderPopUpContent()}
            <footer
                onKeyDown={navigateTermsAgreement}
                onClick={navigateTermsAgreement}
                className='bg-primary w-full text-base-content h-[3.5rem] flex justify-center items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 '
            >
                <span className='text-base-100'>Terms & agreement</span>
            </footer>
        </div>
    )
};

export default Payment;