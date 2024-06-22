"use client"
import PlaceholderImg from "@/components/atoms/placeholder";
import { isEmpty } from "lodash-es";
import Image from "next/image";
import celebration from '@/assets/img/celebration-emoji.png'
import { IoMdCard } from "react-icons/io";
import { MdCurrencyRupee, MdKeyboardArrowRight, MdOutlineChevronLeft } from "react-icons/md";
import { getRandomBlurImg } from "@/components/utils/images";
import { ChangeEvent, useState } from "react";
import BottomButton from "@/components/molecules/bottomButton";
import { IBusinessData } from "@/components/types/businessData";
import { useRouter } from "next/navigation";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/utils/axios";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { SlCreditCard } from 'react-icons/sl'
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import usePayment from "@/components/store/usePayment";
import Coinz from '@/assets/img/coinz.png'
import { BsPatchPlusFill } from "react-icons/bs";
import LoyaltyId from "../loyalty/[loyaltyId]";
import useLoyaltyData from "@/components/store/useLoyaltyData";

type PageStates = 'INVOICE' | 'MODE'

const Payment = ({ data }: { data: IBusinessData }) => {

    const [isTipActive, setIsTipActive] = useState<boolean>(false)
    const [claimedCoinz, setClaimedCoinz] = useState(0)
    const [tips, setTips] = useState(0);
    const [showInput, setShowInput] = useState(false);
    const [selectedTip, setSelectedTip] = useState('');
    const [customTip, setCustomTip] = useState('');
    const [selectedMode, setSelectedMode] = useState<PageStates>('INVOICE')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userCoinz, setUserCoinz] = useState(0)
    const [amount, setAmount] = useState(0);
    const { userDetails } = useLogin()
    const router = useRouter()
    const { setRazorPayPaymentId, razorPayOrderId, setRazorPayOrderId, setRazorPaySignature } =
    usePayment()

    const {loyaltySetting} =useLoyaltyData()

	const creatingRazorPayOptions = async (total: number, orderId: string) => {
		if (!orderId) {
			return
		}
		const script = document.createElement('script')
		script.src = 'https://checkout.razorpay.com/v1/checkout.js'
		script.async = true
		document.body.appendChild(script)
		const date = new Date()
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		const dayAndDate = `${day}-${month}-${year}`
		const time = new Date().toLocaleTimeString('it-IT')
		script.onload = () => {
			const options = {
				key: "rzp_test_DZMxVyKgZ9crXx",
				amount: total,
				currency: 'INR',
				name: 'PALTRIBE',
				description: 'Test Transaction',
				image: 'https://example.com/your_logo',
				order_id: orderId,
				handler: (response) => {
					sendPaymentResponse(response)
					setRazorPaySignature(response.razorpay_signature)
					setRazorPayOrderId(response.razorpay_order_id)
					setRazorPayPaymentId(response.razorpay_payment_id)
				},
				prefill: {
					name: userDetails.name,
					email: userDetails.email,
					contact: userDetails.phone,
				},
				modal: {
					subscription_card_change: true,
					remember_customer: true,
					ondismiss: () => {
						setRazorPaySignature('')
						setRazorPayOrderId('')
						setRazorPayPaymentId('')
						toast.error('Payment failed')
					},
				},
				notes: {
					address: 'Paltribe solutions',
					businessId: data?.business?._id,
					total: amount - claimedCoinz + tips,
					claimedCoins: claimedCoinz,
                    billValue: amount,
					tips: tips,
                    loyaltyId: loyaltySetting.loyaltyId,
				
				},
				theme: {
					color: '#3399cc',
				},
			}
			const rzp1 = new (window as any).Razorpay(options)
			rzp1.open()
			rzp1.on(
				'payment.failed',
				(response) => {
					setRazorPayOrderId(response.error.metadata.order_id)
				},
				(error) => {
					console.error(error)
				},
			)
		}
	}

	// verification signature and user reward api
	const sendPaymentResponse = async (response: any) => {
		setIsLoading(true)
		try {
			const res = await axios.post('/v1/payments/validPayment', {
				response,
			})
			if (res.status===200) {
                router.push(`/r/${data?.business?._id}/review?orderId=${res?.data?.data}`)
				setRazorPaySignature('')
				setRazorPayOrderId('')
				setRazorPayPaymentId('')
				toast.success('Payment successful')
                //TODO: clear in pro hipal
                    // setHiCode('')
                    // setTableId('')
                    // setTableName('')
                    // setIsModalOpen(true)
                    // setStatusCode(error.response.status)
			} else {
				toast.error('Payment failed')
			}
		} catch (error) {
			console.log(error)
		} finally {
			setIsLoading(false)
		}
	}

    const clearTheTip = () =>{
        setTips(0)
        setSelectedTip('')
        setCustomTip('')
        setShowInput(false)
        setIsTipActive(false)
    }

	const handleCreateOrder = async (total: number) => {
		setIsLoading(true)
		if (razorPayOrderId?.length) {
			await creatingRazorPayOptions(total, razorPayOrderId)
		} else {
			try {
				const config = {
					method: 'POST',
					url: '/v1/payments/createOrder',
					data: {
						businessId: data?.business?._id,
						total: total,
						currency: 'INR',
                        claimedCoins: claimedCoinz,
                        billValue: amount,
						name: userDetails.name|| "shyam",
						phone: userDetails.phone || "1234567890",
                        tips: tips,
					},
				}
				const response = await axios(config)
				setRazorPayOrderId(response.data.data)
				await creatingRazorPayOptions(total, response.data.data)
			} catch (err) {
				alert('Something is wrong!! please try after sometime')
				setRazorPayPaymentId('')
				setRazorPaySignature('')
			}
		}
		setIsLoading(false)
	}

    const handleTipSelect = (tip:string) => {
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

    const handleCustomTip = (event:ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setCustomTip(value);
        setTips(Number(value));
    };

    const handleSaveTip = () => {
        setShowInput(false);
    };


    const handleMode = (mode:string) => {
        setSelectedMode("MODE");
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

    const handleTotalAmount = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(Number(value))
        if (claimedCoinz) {
            toast.error('Reapply coinz to apply')
            setClaimedCoinz(0)
        }
    }

    const handleApplyCoinz = (event: ChangeEvent<HTMLInputElement>, userCoinz: number) => {
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
        if(selectedMode === 'MODE'){
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
                    {claimedCoinz > 0 ? <h4 className='text-4xl'>₹ {amount - claimedCoinz + tips}</h4> : null}
                    <h4 className={`${claimedCoinz > 0 ? 'line-through' : ''}`}>₹ {amount}</h4>
                </article>
                <div className='my-2'>
                    <h6 className='flex px-4 py-1 m-auto text-sm rounded-lg w-fit bg-base-100 text-base-content'>
                        <span className='text-[2rem]'>
                            <Image src={celebration} alt='celebration' height={25} width={25} />
                        </span>{' '}
                        &nbsp;&nbsp;Special discount for Special members !!!
                    </h6>
                </div>
                <center className="text-2xl">
                    Enter the Amount
                </center>
                <input
                    type='text'
                    onChange={handleTotalAmount}
                    value={amount || ''}
                    placeholder='Enter amount'
                    maxLength={6}
                    className='w-[90%] border border-[#000] pl-4 min-h-[3rem] font-semibold text-[1rem] rounded-[1rem] my-auto !py-2 mx-4 mt-4'
                />
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
                            {userCoinz}
                        </h6>
                        <MdKeyboardArrowRight size={30} />
                    </div>
                </article>
            <div className='flex flex-col pb-20 space-y-2 text-4xl transition-all shadow-none rounded-t-3xl'>
                <h6 className="text-base mx-6 mt-4">Bill Summary</h6>
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
                            <div className="flex items-center">
                                <span onClick={()=>setIsTipActive(true)}><BsPatchPlusFill size={22}/></span>
                                <h1 className='text-[1rem] mx-2'>Tips </h1>
                                {isTipActive ? <span onClick={clearTheTip} className="underline">(Clear Tip)</span> : null}
                            </div>
                            <div className='flex'>
                                <span className='text-base'>
                                    ₹ {tips || 0}
                                </span>
                            </div>
                        </div>
                        {isTipActive ? <div className='flex space-x-2 mx-2'>
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
            <BottomButton onClick={handleMode} themes={data?.settings?.themes}>
                <div className={`${amount >0 ? '' : 'opacity-20 pointer-events-none'}`} >
                    <span>Select Mode</span>
                </div>
            </BottomButton>
            </>  : 
            <>
            <center>
                <Image src={Coinz} alt="Coinz" width={200} height={200}/>
            </center>
            <section className='mx-[1.5rem] mb-[1.5rem]'>
                <center className='text-lg font-semibold text-base-content'>Payment Modes</center>
                <br/>
                <article
                    onClick={() => handleMode('ONLINE')}
                    className={`${data?.business?.isPaymentIntegrated ? '' : 'opacity-50 pointer-events-none'} flex items-center justify-center py-4 space-x-2 border-2 hover:border-primary rounded-2xl`}
                >
                    <input
                        type="radio"
                        name="paymentMode"
                        value="ONLINE"
                        onChange={() => handleMode('ONLINE')}
                        className='mx-4'
                        disabled={!data?.business?.isPaymentIntegrated}
                    />
                    <span className='rounded-full bg-base-200'>
                        <SlCreditCard size={30} />
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
                    className='flex items-center justify-start py-4 space-x-6 rounded-2xl opacity-50 pointer-evens-none'
                >
                    <input
                        type="radio"
                        name="paymentMode"
                        value="OFFLINE"
                        disabled={true}
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
            </section>
            <BottomButton onClick={()=>handleCreateOrder(amount-claimedCoinz+tips)}  themes={data?.settings?.themes}>
                <div className='flex flex-row capitalize space-x-36'>
                    <div className='flex-col'>
                        <div>₹ {amount-claimedCoinz+tips} Total</div>
                    </div>
                    <div className='flex flex-row'>
                        <span className='my-auto'>Pay</span>
                    </div>
                </div>
            </BottomButton>
            </>
            }
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