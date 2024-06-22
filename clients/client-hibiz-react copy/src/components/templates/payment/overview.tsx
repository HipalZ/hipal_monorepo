import { memo } from "react"
import { CiGlobe } from "react-icons/ci";

const Overview = () => {
    return (
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
            <section className="flex gap-4 mx-4 mt-8">

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
                        <small>Online</small>
                    </p>
                    <h1 className="mt-6 text-2xl">
                        ₹ 3,65,500
                    </h1>
                </article>
            </section>
        </section>
    )
}

export default memo(Overview)