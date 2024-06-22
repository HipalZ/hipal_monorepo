import { memo } from "react"
import { CiGlobe } from "react-icons/ci";

const Overview = () => {
    return (
        <>
            <section className="payment_layout">
                <article className="card_payment_overview">
                    <div className="sales_payment_background_effect1" />
                    <div className="sales_payment_background_effect2" />
                    <div className="sales_payment_background_effect3" />
                    <center className="pt-4">
                        20 spe 2020, 22.00
                    </center>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[0.125rem] bg-white h-[50%] mt-10"></div>
                    </div>
                    <section>
                        <h3 className="absolute left-4 bottom-14 opacity-60">
                            Today’s Sales
                        </h3>
                        <h1 className="absolute text-3xl left-4 bottom-6">
                            ₹ 3,65,500
                        </h1>
                    </section>
                    <section>
                        <h3 className="absolute right-4 bottom-14 opacity-60">
                            Total Discounts
                        </h3>
                        <h1 className="absolute text-3xl right-4 bottom-6">
                            ₹ 3,65,500
                        </h1>
                    </section>
                </article>
                <section className="flex gap-4 mx-4">
                    <article className='online_card1'>
                        <div className="sales_payment_background_effect4"></div>
                        <p className="flex">
                            <CiGlobe className="mr-2" />
                            <small>Online</small>
                        </p>
                        <h1 className="mt-6 text-2xl">
                            ₹ 3,65,500
                        </h1>
                    </article>

                    <article className='online_card2'>
                        <div className="sales_payment_background_effect5"></div>
                        <p className="flex">
                            <CiGlobe className="mr-2" />
                            <small>On floor</small>
                        </p>
                        <h1 className="mt-6 text-2xl">
                            ₹ 3,65,500
                        </h1>
                    </article>
                </section>
            </section>
            <section className="flex justify-between gap-4 mx-4 mt-6">
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b>
                        Coinz issued
                    </b>
                    <h6>
                        ₹ 3,65
                    </h6>
                </article>
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b>
                        Coinz used
                    </b>
                    <h6>
                        ₹ 3,65
                    </h6>
                </article>
            </section>
            <section className="flex justify-between gap-4 mx-4 mt-4">
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b>
                    Couponz issued
                    </b>
                    <h6>
                        ₹ 3,65
                    </h6>
                </article>
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b>
                    Couponz used
                    </b>
                    <h6>
                        ₹ 3,65
                    </h6>
                </article>
            </section>
        </>

    )
}

export default memo(Overview)