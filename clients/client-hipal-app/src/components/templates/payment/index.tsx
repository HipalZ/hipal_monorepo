"use client"
import PlaceholderImg from "@/components/atoms/placeholder";
import { isEmpty } from "lodash-es";
import Image from "next/image";
import celebration from '@/assets/img/celebration-emoji.png'
import { IoMdCard } from "react-icons/io";
import { MdKeyboardArrowRight, MdOutlineChevronLeft } from "react-icons/md";
import { getRandomBlurImg } from "@/components/utils/images";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import BottomButton from "@/components/molecules/bottomButton";
import { IBusinessData } from "@/components/types/businessData";
import { useRouter, useSearchParams } from "next/navigation";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/utils/axios";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import usePayment from "@/components/store/usePayment";
import { BsPatchPlusFill } from "react-icons/bs";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import LoadingSpinner from "@/components/atoms/loadingSpinner";
import useTableData from "@/components/store/useTableData";
import PaymentComponent from "./selectPayment";
import MiddlePopUp from "@/components/atoms/middlePopUp";

export type PageStates = 'INVOICE' | 'MODE' | 'ONLINE' | 'OFFLINE'

const Payment = ({ data }: { data: IBusinessData }) => {
    const [otp, setOtp] = useState(["", "", "", ""])
    const [isTipActive, setIsTipActive] = useState<boolean>(false)
    const [showInput, setShowInput] = useState(false);
    const [selectedTip, setSelectedTip] = useState('');
    const [customTip, setCustomTip] = useState('');
    const [selectedMode, setSelectedMode] = useState<PageStates>('INVOICE')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { userDetails } = useLogin()
    const { billValue, setBillValue, setUserCoinz,
        userCoinz, claimedCoinz, setClaimedCoinz,
        setTips, tips, selectedPay, setSelectedPay } = usePaymentStore()
    const { tableName } = useTableData()
    const [offlineOrderId, setOfflineOrderId] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    const { setRazorPayPaymentId, razorPayOrderId,
        setRazorPayOrderId, setRazorPaySignature, } =
        usePayment()

    // by default setting to zero instead of previous stale data
    useEffect(() => {
        setBillValue(0)
        setClaimedCoinz(0)
        setTips(0)
        setSelectedTip('')
        setCustomTip('')
    }, [])

    const { loyaltySetting } = useLoyaltyData()


    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const handleConfirmCode = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.value.length > 1 || isNaN(Number(e.target.value))) return

        const newOtp = [...otp]
        newOtp[index] = e.target.value

        if (index < inputRefs.length - 1 && e.target.value !== "") {
            inputRefs[index + 1]?.current?.focus()
        }

        setOtp(newOtp)
    }

    const handlePaymentSuccess = (response: any) => {
        sendPaymentResponse(response);
        setRazorPaySignature(response.razorpay_signature);
        setRazorPayOrderId(response.razorpay_order_id);
        setRazorPayPaymentId(response.razorpay_payment_id);
    };

    const handlePaymentDismiss = () => {
        setRazorPaySignature('');
        setRazorPayOrderId('');
        setRazorPayPaymentId('');
        setOfflineOrderId('');
        toast.error('Payment failed');
    };
    const handlePaymentFailure = (response: any) => {
        setRazorPayOrderId(response.error.metadata.order_id);
        console.error(response);
    };

    const creatingRazorPayOptions = async (total: number, orderId: string) => {
        if (!orderId) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const options = {
                key: 'rzp_test_DZMxVyKgZ9crXx',
                amount: total,
                currency: 'INR',
                name: 'PALTRIBE',
                description: 'Test Transaction',
                image: 'https://example.com/your_logo',
                order_id: orderId,
                handler: handlePaymentSuccess,
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone,
                },
                modal: {
                    subscription_card_change: true,
                    remember_customer: true,
                    ondismiss: handlePaymentDismiss,
                },
                notes: {
                    address: 'Paltribe solutions',
                    businessId: data?.business?._id,
                    total: billValue - claimedCoinz + tips,
                    claimedCoins: claimedCoinz,
                    billValue: billValue,
                    tips: tips,
                    loyaltyId: loyaltySetting.loyaltyId,
                    tableName: tableName,
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
            rzp1.on('payment.failed', handlePaymentFailure);
        };
    };

    // verification signature and user reward api
    const sendPaymentResponse = async (response: any) => {
        setIsLoading(true)
        try {
            const res = await axios.post('/v1/payments/validPayment', {
                response,
            })
            if (res.status === 200) {
                router.push(`/r/${data?.business?._id}/review?orderId=${res?.data?.data}`)
                toast.success('Payment successful')
                setRazorPaySignature('')
                setRazorPayOrderId('')
                setRazorPayPaymentId('')
            } else {
                toast.error('Payment failed')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearTheTip = () => {
        setTips(0)
        setSelectedTip('')
        setCustomTip('')
        setShowInput(false)
        setIsTipActive(false)
    }

    const verifyOrder = async () => {
        if (otp.includes('') || otp.length < 4) {
            return toast.error('Please enter the code')
        }
        try {
            const config = {
                method: 'POST',
                url: '/v1/payments/verifyOrder',
                data: {
                    order_id: offlineOrderId,
                    completionCode: otp.join(''),
                },
            }
            const response = await axios(config)
            if (response?.status === 200) {
                toast.success(response.data.message)
                setSelectedPay(false)
                router.push(`/r/${data?.business?._id}/review?orderId=${response?.data?.data?.order_id}`)
            }
        } catch (err) {
            toast.error('invalid code')
            setOtp(["", "", "", ""])
        }
    }

    const handleCreateOfflineOrder = async () => {
        if (tableName === '') {
            toast.error('Please scan to start')
            return router.push(`/scan`)
        }
        try {
            const config = {
                method: 'POST',
                url: '/v1/payments/createOfflineOrder',
                data: {
                    businessId: data?.business?._id,
                    total: billValue - claimedCoinz + tips,
                    claimedCoins: claimedCoinz,
                    billValue: billValue,
                    name: userDetails.name || "user",
                    phone: userDetails.phone || "+91**********",
                    tips: tips,
                    currency: "INR",
                    tableName: tableName,
                },
            }
            const response = await axios(config)
            if (response?.data?.data?.order_id) {
                // gives a string which is orderId
                setOfflineOrderId(response.data.data.order_id)
                setSelectedPay(true)
            }

        } catch (err: any) {
            console.log(err)
            toast.error(err.response?.data?.message || 'Something went wrong')
        }
    }

    const createRazorPayOrder = async (total: number): Promise<string> => {
        const config = {
            method: 'POST',
            url: '/v1/payments/createOrder',
            data: {
                businessId: data?.business?._id,
                total: total,
                currency: 'INR',
                claimedCoins: claimedCoinz,
                billValue: billValue,
                name: userDetails.name || 'user',
                phone: userDetails.phone || '+91**********',
                tips: tips,
                tableName: tableName,
            },
        };
        const response = await axios(config);
        const orderId = response.data.data;
        setRazorPayOrderId(orderId);
        return orderId;
    };


    const handleCreateOrder = async (total: number, mode: string) => {
        if (total <= 0) {
            return toast.error('Invalid amount');
        }
        if (tableName === '') {
            toast.error('Please scan to start')
            return router.push(`/scan`)
        }
        if (mode.toLowerCase() === 'offline') {
            await handleCreateOfflineOrder();
            return;
        }

        setIsLoading(true);

        try {
            const orderId = razorPayOrderId || await createRazorPayOrder(total);
            if (orderId) {
                await creatingRazorPayOptions(total, orderId);
            }
        } catch (error) {
            toast.error('Something went wrong! Please try again later.');
            setRazorPayPaymentId('');
            setRazorPaySignature('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTipSelect = (tip: string) => {
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

    const handleCustomTip = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^0-9.]/g, '');
        setCustomTip(value);
        setTips(Number(value));
    };

    const handleSaveTip = () => {
        setShowInput(false);
    };

    const handleMode = (mode: PageStates) => {
        if(showInput){
            return toast.error('Please save the tip amount')
        }
        setSelectedMode(mode);
    };

    const handleUserCoinz = async () => {
        try {
            const config = {
                method: 'GET',
                url: `/v1/users/:businessId/getUserReward?userPhone=${userDetails.phone}&loyaltyId=${data?.loyalty?.loyaltyId}`,
            }
            const response = await axios(config)
            setUserCoinz(response?.data?.data?.rewards)
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

    const handleApplyCoinz = (event: ChangeEvent<HTMLInputElement>, userCoinz: number) => {
        const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ''));
        const canClaimCoinz = Math.round(billValue * (data?.loyalty?.setClaimAmount / 100) || 0);
        const coinsToSet = canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;

        if (userEnteredValue > coinsToSet) {
            setClaimedCoinz(coinsToSet);
        } else {
            setClaimedCoinz(userEnteredValue);
        }
    };

    const handleBack = () => {
        if (selectedMode === 'MODE') {
            return setSelectedMode('INVOICE')
        }
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
            let audio: HTMLAudioElement
            audio = new Audio("/sounds/Money.mp3")
            audio.play()
            return () => {
                if (audio) {
                    audio.pause()
                    audio.currentTime = 0
                }
            }
        }
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
                        type='text'
                        value={claimedCoinz || ''}
                        placeholder='Enter amount'
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
    }

    useEffect(() => {
        setBillValue(Number(searchParams?.get("amount")))
    }, [])

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
                <center className='absolute mt-2 ml-8 text-xl font-semibold left-1/3'>HiPay</center>
                <br />
                <br />
            </section>
            {selectedMode === "INVOICE" ?
                <>
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
                                    height={100}
                                    width={100}
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
                        {claimedCoinz > 0 ? <h4 className='text-4xl'>₹ {billValue - claimedCoinz}</h4> : null}
                        <h4 className={`${claimedCoinz > 0 ? 'line-through' : ''}`}>₹ {billValue}</h4>
                    </article>
                    <div className='my-2'>
                        <h6 className='flex px-4 py-1 m-auto text-sm rounded-lg w-fit bg-base-100 text-base-content'>
                            <span className='text-[2rem]'>
                                <Image src={celebration} alt='celebration' height={25} width={25} />
                            </span>{' '}
                            &nbsp;&nbsp;Special discount for Special members !!!
                        </h6>
                    </div>
                    {/* <center className="text-2xl">
                        Enter the Amount
                </center>
                    <input
                        type='text'
                        onChange={handleBillAmount}
                        value={billValue || ''}
                        placeholder='Enter amount'
                        maxLength={6}
                        className='w-[90%] border border-[#000] pl-4 min-h-[3rem] font-semibold text-[1rem] rounded-[1rem] my-auto !py-2 mx-4 mt-4'
                    /> */}
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
                    <BottomButton >
                        <div onClick={() => handleMode("MODE")} className={`${billValue > 0 ? '' : 'opacity-20 pointer-events-none'} bg-primary text-base-100 py-3 px-3 rounded-full`} >
                            <span>Proceed to pay ₹ {billValue - claimedCoinz + tips}</span>
                        </div>
                    </BottomButton>
                </> :
                <PaymentComponent data={data} tips={tips}
                    billValue={billValue} claimedCoinz={claimedCoinz}
                    handleCreateOrder={handleCreateOrder} selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode} selectedPay={selectedPay} />
            }
            {renderPopUpContent()}
            {isLoading ? <LoadingSpinner /> : null}
            <MiddlePopUp show={selectedPay} onClose={verifyOrder}>
                <div className="h-full p-4">
                    <center className="text-2xl">Confirmation Code</center>
                    <br />
                    <center>
                        {otp.map((_, index) => (
                            <input
                                type="tel"
                                key={index.toString()}
                                value={otp[index]}
                                onChange={(e) => handleConfirmCode(e, index)}
                                max={1}
                                min={0}
                                ref={inputRefs[index]}
                                className={`border border-black rounded-lg py-2 px-2 text-center text-base-content w-[3rem] h-12 mr-2 focus:outline-none `}
                                required
                            />
                        ))}
                    </center>
                    <br />
                    <center>Enter the code to avail get rewards🥳</center>
                </div>
            </MiddlePopUp>

        </div>
    )
};

export default Payment;