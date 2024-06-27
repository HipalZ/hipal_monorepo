import React, { memo, useCallback, useState } from 'react';
import Globe from "@/assets/payment/globe.png";
import style from "./addAmount.module.css";
import Image from 'next/image';
import { TfiPlus } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import useTableData from '@/components/store/useTableData';
import axios from '@/utils/axios';
import useBusinessDetails from '@/components/store/useBusinessDetails';
import { cn } from '@/components/utils/helpers';

const AddAmountModal = memo(() => {
	const businessId = useBusinessDetails((s)=>s.businessDetails?._id)
    const customLink = useBusinessDetails((s)=>s.businessDetails?.customLink)
    const router = useRouter();
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);

    const saveAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value === "" ? 0 : parseInt(value));
    }
    const { tableName } = useTableData()

    const proceedToPayment = useCallback(() => {
        if (amount === 0) {
            toast.error('Please enter amount');
            return;
        }
        setLoading(true);
        if (amount > 0) {
            router.push(`/r/${customLink}/payment?amount=${amount}`);
        }
    }, [amount, customLink, router]);

    const callTheWaiter = useCallback(async () => {
        if (!tableName) {
            toast.error('Please Scan the table to call waiter');
            return;
        }
        if (loading) {
            return toast.error('Please wait for a moment');
        }

        setLoading(true);
        try {
            const config = {
                method: 'POST',
                url: '/v1/payments/createWaiterAlert',
                data: {
                    businessId: businessId,
                    tableName: tableName,
                    message: 'Please settle my table',
                    alertType: 'WAITER',
                    status: 'WAITER'
                }
            };
            const response = await axios(config);
            if (response.status === 200) {
                toast.success('Waiter will be there soon. Thank you!!');
            }
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors && Array.isArray(errors)) {
                errors.forEach((error: { message: string }) => {
                    console.log(error.message);
                    toast.error('Please Scan the table to call waiter');
                });
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [businessId, tableName]);
    return (
        <section className='h-[80vh] overflow-y-auto overflow-x-hidden'>
            <header>
                <center className='pt-4 text-xl font-semibold'>
                    HiPay
                </center>
            </header>
            <section className='relative mt-[30vh]'>
                <div className={`${style.top_ring}`} />
                <div className={`${style.mid_ring}`} />
                <div className={`${style.bottom_ring}`} />
                <figure className={style.globe_payment}>
                    <Image width={193} height={193} src={Globe} alt="globe" />
                </figure>
                <TfiPlus className={`${style.plus_pay_right}`} size={48} />
                <TfiPlus className={`${style.plus_pay_left}`} size={24} />

                <section className='absolute mx-6 space-y-4 -bottom-[16rem] w-[88%]'>
                    <p className='-mb-4 text-primary'>Add bill amount</p>
                    <input
                        placeholder='Enter Amount'
                        value={amount || ''}
                        onChange={saveAmount}
                        className='w-full px-4 py-3 border rounded-2xl border-primary focus:outline-none'
                        type="tel"
                        maxLength={6}
                        minLength={1}
                        required
                    />
                    <div className='flex items-end justify-between gap-4'>
                        <button disabled={loading} onClick={callTheWaiter} className="w-full px-8 py-3 text-sm border rounded-full border-primary">
                            {loading ? (
                                <span className="loader_spinner !border-t-primary"></span>
                            ) : (
                                'Call Captain'
                            )}
                        </button>
                        <button 
                            disabled={loading} 
                            onClick={proceedToPayment} 
                            className={cn('w-full px-4 py-3 rounded-full text-base-100', loading ? 'opacity-50 pointer-events-none bg-gray-400' : 'bg-primary')}
                        >
                            {loading ? (
                                <span className="loader_spinner !border-t-primary"></span>
                            ) : (
                                'Next'
                            )}
                        </button>
                    </div>
                </section>
            </section>
        </section>
    );
})

export default AddAmountModal
