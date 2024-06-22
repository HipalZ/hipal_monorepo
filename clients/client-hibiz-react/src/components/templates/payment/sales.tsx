import { MdOutlinePictureAsPdf } from "react-icons/md";
import Online from "@/assets/online.png"
import PopUp from "@/components/atom/popUp";
import { memo, useCallback, useState } from "react";
import PaymentModal from "./paymentModal";

const PaymentSales = () => {
    const [open, setOpen] = useState(false)
    const closeModel = useCallback(() => {
        setOpen(false)
    }, [setOpen, open])

    const openModel = useCallback(() => {
        setOpen(true)
    }, [setOpen, open])
    return (
        <>
            <article className="card_payment">
                <div className="sales_payment_background_effect1" />
                <div className="sales_payment_background_effect2" />
                <div className="sales_payment_background_effect3" />
                <div className="absolute opacity-50 left-6 top-6">
                    Today's Sales
                </div>
                <h1 className="absolute text-3xl left-6 top-12">
                    ₹ 3,65,500
                </h1>
                <p className="absolute bottom-6 left-6">
                    <span className="opacity-50">Last Synced</span>  2 hours ago
                </p>
            </article>
            <section className="flex items-center justify-between px-4 pt-2">
                <h3 className="text-2xl font-semibold">
                    Today
                </h3>
                <button className="flex items-center justify-center px-4 py-1 space-x-2 border border-black rounded-2xl">
                    <MdOutlinePictureAsPdf /> <small>Download statement</small>
                </button>
            </section>
            <section className="payment_card_ui">
                <section className="flex justify-between">
                    <section>
                        <figure className="flex items-center space-x-4">
                            <img src={Online} alt="online" />
                            <figcaption className="text-[0.825rem] opacity-50">
                                <h6>#11245</h6>
                                <h6>₹ 2,50,000</h6>
                            </figcaption>
                        </figure>
                    </section>
                    <section>
                        <h3 className="text-2xl text-[#23B371]">₹ 250.55</h3>
                    </section>
                </section>
                <section className="py-4">
                    <b>Rishabh Hurshan</b>{" "}<span className="opacity-50">91*******730</span><br />
                    <small>Bill value : 367.45</small>
                </section>
                <section className="flex gap-4">
                    <button className="flex items-center justify-center px-4 py-1 space-x-2 bg-[#73F88047] text-[#23B371] rounded-2xl">
                        <small>Offline Payment success</small>
                    </button>
                    <button onClick={openModel} className="flex items-center justify-center px-4 py-1 space-x-2 bg-[#73F88047] text-[#23B371] rounded-2xl">
                        <small>250 Coinz used </small>
                    </button>
                </section>
            </section>
            {open &&
                <PopUp onClose={closeModel} show={true}>
                    <PaymentModal />
                </PopUp>
            }</>
    )
}

export default memo(PaymentSales)