"use client";
import { MdOutlineChevronLeft } from "react-icons/md";
import { ChangeEvent, memo, useEffect, useState } from "react";
import { IBusinessData } from "@/components/types/businessData";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/utils/axios";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import usePayment from "@/components/store/usePayment";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import { useQuery } from "@tanstack/react-query";
import { calculateReward } from "@/components/utils/helpers";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const BottomButton = dynamic(() => import("@/components/molecules/bottomButton"), {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
});

const LoadingSpinner = dynamic(() => import("@/components/atoms/loadingSpinner"), {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
});

const PaymentComponent = dynamic(() => import("./selectPayment"), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
});

const AvailableCoinz = dynamic(() => import("./availableCoinz"), {
    ssr: false,
    loading: () => <SkeletonLoader height={250} />,
});

const BillSummary = dynamic(() => import("./billSummary"), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
});

const PaymentCard = dynamic(() => import("./paymentCard"), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
});

const UseCoinzPopup = dynamic(() => import("./useCoinzPopup"), {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
});

export type PageStates = "INVOICE" | "MODE" | "ONLINE" | "OFFLINE";

const Payment = ({ data }: { data: IBusinessData }) => {
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
        setTips, tips, selectedPay } = usePaymentStore()
    const {businessDetails} = useBusinessDetails()
    const { tableName, setTableName } = useTableData()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { loyaltySetting } = useLoyaltyData()

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
        toast.error('Payment failed');
    };
    const handlePaymentFailure = (response: any) => {
        setRazorPayOrderId(response.error.metadata.order_id);
        console.error(response);
    };
    const creatingRazorPayOptions = async (orderId: string) => {
        if (!orderId) {
            return;
        }
        console.log('envvv',process.env.NEXT_PUBLIC_RAZOR_PAY_KEY_ID)
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    
        script.onload = () => {
            const options = {
                key: process.env.NEXT_PUBLIC_RAZOR_PAY_KEY_ID,
                amount: billValue - claimedCoinz + tips,
                currency: 'INR',
                name: 'PALTRIBE',
                description: 'Test Transaction',
                image: 'https://example.com/your_logo',
                order_id: orderId,
                handler: (response) => {
                    handlePaymentSuccess(response);
                    // window.onbeforeunload = null; // Remove the event listener on success
                    window.onpopstate = null; 
                },
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone,
                },
                modal: {
                    subscription_card_change: true,
                    remember_customer: true,
                    escape: false,
                    backdropclose: false,
                    handleback: false,
                    ondismiss: () => {
                        handlePaymentDismiss();
                        window.onbeforeunload = null; // Remove the event listener on dismiss
                        window.onpopstate = null; 
                    },
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
            
            // Add event listener to prevent back navigation
            history.pushState(null, '', location.href); // Push initial state with an empty string for title
            window.onbeforeunload = (event) => {
                event.preventDefault();
                event.returnValue = ''; // Custom message is no longer supported in most browsers
                // Redirect to a specific URL
                window.location.href = `/r/${businessDetails?.customLink}/payment?amount=${billValue}`; // Change to your desired URL
                toast.error('Add the coinz to get the rewards')
            };
            window.onpopstate = (event) => {
                event.preventDefault();
                // Redirect to a specific URL
                window.location.href = `/r/${businessDetails?.customLink}/payment?amount=${billValue}`; // Change to your desired URL
                toast.error('Add the coinz to get the rewards')
            };
    
            rzp1.open();
            
            // Remove the event listener when the user starts the payment process
            document.addEventListener('rzp_payment_start', () => {
                window.onbeforeunload = null;
            });
    
            rzp1.on('payment.failed', (response) => {
                handlePaymentFailure(response);
                window.onbeforeunload = null;
                window.onpopstate = null; // Remove the event listener on payment failure
            });
        };
    };
    

    // verification signature and user reward api
    const sendPaymentResponse = async (response: any) => {
        setIsLoading(true)
        try {
            const res = await axios.post('/v1/payments/validPayment', {
                response,
            })
            const total = billValue - claimedCoinz + tips;
            const coinsObtained = total * (loyaltySetting?.setClaimAmount / 100);
            const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz
            const finalReward = calculateReward(existingCoins,coinsObtained , loyaltySetting?.rewardLimit)
            if (res.status === 200) {
                router.push(`/r/${data?.business?._id}/review?amount=${total}&mode=online&claim=${finalReward?.finalReward}&orderId=${res?.data?.data}`)
                toast.success('Payment successful')
                setRazorPaySignature('')
                setRazorPayOrderId('')
                setRazorPayPaymentId('')
                setTableName('')
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
                const total = billValue - claimedCoinz + tips;
                const coinsObtained = total * (loyaltySetting?.setClaimAmount / 100);
                const existingCoins = claimedCoinz ? userCoinz - claimedCoinz : userCoinz
                const finalReward = calculateReward(existingCoins,coinsObtained , loyaltySetting?.rewardLimit)
                // gives a string which is orderId
                setTableName('')
                router.push(`/r/${data?.business?._id}/review?amount=${total}&mode=offline&claim=${finalReward?.finalReward}&orderId=${response?.data?.data?.order_id}`)
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
                total: billValue - claimedCoinz + tips,
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
            const orderId = await createRazorPayOrder(total);
                await creatingRazorPayOptions(orderId);
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
        if (showInput) {
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
            return response?.data?.data?.rewards
        } catch (err) {
            console.log(err)
        }
    }

    const openModal = async () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const [maxCoinz , setMaxCoinz] = useState(0)
    const handleApplyCoinz = (event: ChangeEvent<HTMLInputElement>, userCoinz: number) => {
        const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ''));
        const canClaimCoinz = Math.round(billValue * (data?.loyalty?.setClaimAmount / 100) || 0);
        const coinsToSet = canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;
        if (userEnteredValue > coinsToSet) {
            setClaimedCoinz(coinsToSet);
            setMaxCoinz(coinsToSet)
        } else {
            setClaimedCoinz(userEnteredValue);
            setMaxCoinz(userEnteredValue)
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
    useEffect(() => {
        setBillValue(Number(searchParams?.get("amount")))
    }, [])

    useQuery({
        queryKey: ['getUserReward', userDetails.phone, data?.loyalty?.loyaltyId],
        queryFn: handleUserCoinz,
        enabled: !!userDetails.phone && !!data?.loyalty?.loyaltyId,
    })

    return (
        <div>
            <section className='z-20 w-full px-4 pt-4 pb-2 bg-base-100'>
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
                    <PaymentCard
                        claimedCoinz={claimedCoinz}
                        billValue={billValue}
                        logo={data?.business?.logo}
                    />
                    <UseCoinzPopup
                        openModal={openModal}
                        userCoinz={userCoinz}
                        claimedCoinz={claimedCoinz}
                    />
                    <BillSummary
                        billValue={billValue}
                        claimedCoinz={claimedCoinz}
                        tips={tips}
                        isTipActive={isTipActive}
                        setIsTipActive={setIsTipActive}
                        clearTheTip={clearTheTip}
                        handleTipSelect={handleTipSelect}
                        selectedTip={selectedTip}
                        customTip={customTip}
                        showInput={showInput}
                        handleCustomTip={handleCustomTip}
                        handleSaveTip={handleSaveTip}
                    />
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
            <AvailableCoinz
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                claimedCoinz={claimedCoinz}
                userCoinz={userCoinz}
                handleCoins={handleCoins}
                handleApplyCoinz={handleApplyCoinz}
                maxCoinz={maxCoinz}
            />
            {isLoading ? <LoadingSpinner /> : null}
        </div>
    )
};

export default memo(Payment);
