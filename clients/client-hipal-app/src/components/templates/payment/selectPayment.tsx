import React, { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { SlCreditCard } from 'react-icons/sl';
import { MdCurrencyRupee } from 'react-icons/md';
import BottomButton from '@/components/molecules/bottomButton';
import QRcodeImg from "@/assets/payment/mobileqr.png"
import HandPay from "@/assets/payment/handcash.png"
import online from "@/assets/payment/mobilepay.png"
import background from "@/assets/payment/background-rainbow.png"
import Grid from '@/assets/payment/grid.png';
import { PageStates } from '.';

interface Business {
    isPaymentIntegrated: boolean;
}

interface Data {
    business?: Business;
}

interface PaymentComponentProps {
    data: Data;
    billValue: number;
    claimedCoinz: number;
    tips: number;
    handleCreateOrder: (amount: number, mode:string) => void;
    selectedMode: PageStates;
    setSelectedMode: (mode: PageStates) => void;
    selectedPay: boolean;
}

const PaymentComponent: React.FC<PaymentComponentProps> = memo(({ data, billValue, claimedCoinz, tips, handleCreateOrder, selectedMode, setSelectedMode, selectedPay }) => {

    const [currentImage, setCurrentImage] = useState<string>(QRcodeImg.src);

    useEffect(() => {
        const images = [QRcodeImg.src, HandPay.src, online.src];
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            setCurrentImage(images[currentIndex]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);



    const createOrder = (amount: number, mode: PageStates) => {
        setSelectedMode(mode)
        handleCreateOrder(amount, mode)
    };

    return (
        <section className='h-[85vh]'>
            <div style={{
                backgroundImage: `url(${background.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '35vh',
                position: 'relative',
                maxWidth: '30rem',
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: '-2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                }}>
                    <Image className='card_up_down' src={currentImage} alt="Payment Image" width={200} height={200} />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-13rem',
                        left: '50%',
                        transform: 'translate(-50%, -10%)',
                        width: '100vw',
                        zIndex: -1
                    }}
                >
                    <Image width={480} height={200} src={Grid} alt="Payment Image" />
                </div>
                <center className='absolute text-2xl -bottom-[4rem] pt-4 transform bg-base-100 w-full h-[7rem] -translate-x-1/2 translate-y-[90%] left-1/2'>
                    How do you want to settle ?
                </center>
            </div>
            <section className='absolute bottom-0 flex w-[92%] gap-4 mx-4'>
                <article className={`${data?.business?.isPaymentIntegrated ? '' : 'opacity-50 pointer-events-none'} w-full max-w-[11.625rem] h-[15.65rem] relative bg-white rounded-2xl overflow-hidden`}>
                    <center style={{
                        backgroundImage: `url(${HandPay.src})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                        className='bg-[#EACBBF] rounded-b-[3rem] h-1/2' />
                    <div className='px-4 pt-2 text-xs leading-2'>
                        Hassel free & easy payments from your favorite UPI, Card or net banking
                    </div>
                    <button onClick={() => createOrder(billValue, 'OFFLINE')} className='absolute px-4 py-1 text-white bg-black rounded-full bottom-2 left-2'>
                        Pay waiter
                    </button>
                </article>
                <article className='w-full max-w-[11.625rem] h-[15.65rem] relative bg-white rounded-2xl overflow-hidden'>
                    <center style={{
                        backgroundImage: `url(${online.src})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} className='bg-[#F7C846] rounded-b-[3rem] h-1/2' />
                    <div className='px-4 pt-2 text-xs leading-2'>
                        Hassel free & easy payments from your favorite UPI, Card or net banking
                    </div>
                    <button onClick={() => createOrder(billValue, 'ONLINE')} className='absolute px-4 py-1 text-white bg-black rounded-full bottom-2 left-2'>
                        Pay online
                    </button>
                </article>
            </section>
        </section>
    );
});

export default PaymentComponent;
// <article
// onClick={() => handleMode('ONLINE')}
// className={`${data?.business?.isPaymentIntegrated ? '' : 'opacity-50 pointer-events-none'} flex items-center py-4 space-x-2 border-2 hover:border-primary rounded-2xl`}
// >
// <input
//     type="radio"
//     name="paymentMode"
//     checked={selectedMode === 'ONLINE'}
//     value="ONLINE"
//     onChange={() => handleMode('ONLINE')}
//     className='mx-4'
//     disabled={!data?.business?.isPaymentIntegrated}
// />
// <span className='rounded-full bg-base-200'>
//     <SlCreditCard size={30} />
// </span>
// <h1>
//     <span className='text-base font-semibold'>Pay Online</span>
//     <br />
//     <span>UPI | Debit card | Credit Card</span>
// </h1>
// </article>
// <article
// onClick={() => handleMode('OFFLINE')}
// className='flex items-center py-4 space-x-2 border-2 hover:border-primary rounded-2xl'
// >
// <input
//     type="radio"
//     name="paymentMode"
//     checked={selectedMode === 'OFFLINE'}
//     value="OFFLINE"
//     onChange={() => handleMode('OFFLINE')}
//     className='mx-4'
// />
// <span className='rounded-full bg-base-200'>
//     <MdCurrencyRupee size={20} />
// </span>
// <h1>
//     <span className='text-base font-semibold'>Pay Offline</span>
//     <br />
//     <span>Cash</span>
// </h1>
// </article>