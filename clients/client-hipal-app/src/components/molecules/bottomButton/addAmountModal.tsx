import React, { memo, useState } from 'react';
import Globe from "@/assets/payment/globe.png";
import style from "./addAmount.module.css";
import Image from 'next/image';
import { TfiPlus } from "react-icons/tfi";
import { useParams, useRouter } from "next/navigation";
import { toast } from 'react-toastify';

const AddAmountModal = () => {
    const params = useParams();
    const businessId = params?.businessId;
    const router = useRouter();
    const [amount, setAmount] = useState(0);

    const saveAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value === "" ? 0 : parseInt(value));
    }

    const proceedToPayment = () => {
        if (amount === 0) {
            toast.error('Please enter amount');
            return;
        }
        if (amount > 0) {
            router.push(`/r/${businessId}/payment?amount=${amount}`);
        }
    }

    return (
        <section className='h-[80vh] overflow-y-auto overflow-x-hidden'>
            <header>
                <center className='pt-4 text-xl'>
                    HiPay
                </center>
            </header>
            <section className='relative mt-[35vh]'>
                <div className={`${style.top_ring}`} />
                <div className={`${style.mid_ring}`} />
                <div className={`${style.bottom_ring}`} />
                <figure className={style.globe_payment}>
                    <Image width={193} height={193} src={Globe} alt="globe" />
                </figure>
                <TfiPlus className={`${style.plus_pay_right}`} size={48} />
                <TfiPlus className={`${style.plus_pay_left}`} size={24} />
                <section className='absolute mx-6 space-y-6 -bottom-[12rem] w-[88%]'>
                    <input 
                        placeholder='Enter Amount'
                        value={amount}
                        onChange={saveAmount}
                        className='w-full px-4 py-3 border rounded-2xl border-primary focus:outline-none' 
                        type="tel" 
                        maxLength={6} 
                        minLength={1} 
                        required 
                    />
                    <button onClick={proceedToPayment} className='w-full px-4 py-3 rounded-full bg-primary text-base-100'>
                        Next
                    </button>
                </section>
            </section>
        </section>
    );
}

export default memo(AddAmountModal);
