import Online from "@/assets/online.png"
import PopUp from "@/components/atom/popUp";
import { memo, useCallback, useState } from "react";
import PaymentModal from "./paymentModal";
import { useQuery } from "@tanstack/react-query";
import axios from "@/axios";
import { useParams } from "react-router-dom";
import useTimings from "@/components/store/useTimings";
import { Alert, HistoryData } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";

const PaymentSales = memo(() => {
    const [open, setOpen] = useState(false)
    const [salesData, setSalesData] = useState<HistoryData>({})
    const [pageNumber, setPageNumber] = useState(1);
    const [totalSales, setTotalSales] = useState(0)
    const [historyData, setHistoryData] = useState<HistoryData[]>([])
    const { timeStampStart, timeStampEnd } = useTimings()
    const params = useParams();
    const businessId = params?.businessId;

    const handleClick = (newPage: number) => {
        if (newPage < 1) return;
        setPageNumber(newPage);
    };

    const closeModel = useCallback(() => {
        setOpen(false)
    }, [setOpen, open])


    const openModel = useCallback((data:Alert) => {
        setOpen(true)
        setSalesData(data)
    }, [setOpen, open])

    // number privacy
    const hideMiddleNumbers = (phone: string) => {
        if (phone.length <= 4) return phone;
        const firstPart = phone.slice(0, 3);
        const lastPart = phone.slice(-3);
        return `${firstPart}****${lastPart}`;
    };

    const handleHistoryData = async () => {
        try {
            const config = {
                method: "GET",
                url: `/v1/payments/:id/bills?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`,
            };
            const response = await axios(config);
            setHistoryData(response.data.data.existingPayments);
            setTotalSales(response.data.data.totalSale);
            return response.data.data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    const defaultClass = "text-base w-10 h-10 flex justify-center items-center bg-[#dad1f8] text-black border rounded-full border-[#2B354D]"

    useQuery({
        queryKey: ['historyAlerts', businessId, timeStampStart, timeStampEnd, pageNumber],
        queryFn: handleHistoryData,
        enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
    });

    return (
        <main className="relative">
            <article className="card_payment">
                <div className="sales_payment_background_effect1" />
                <div className="sales_payment_background_effect2" />
                <div className="sales_payment_background_effect3" />
                <div className="absolute opacity-50 left-6 top-6">
                    Today's Sales
                </div>
                <h1 className="absolute text-3xl left-6 top-12">
                    ₹ {totalSales?.toLocaleString('en-IN')}
                </h1>
                <p className="absolute bottom-6 left-6">
                    <span className="opacity-50">Last Synced</span>  recently
                </p>
            </article>
            <section className="flex items-center justify-between px-4 pt-2">
                <h3 className="text-2xl font-semibold">
                    {/* {timestampToDateTime(timeStampStart)} */}
                </h3>
                {/* <button className="flex items-center justify-center px-4 py-1 space-x-2 border border-black rounded-2xl">
                    <MdOutlinePictureAsPdf /> <small>Download statement</small>
                </button> */}
            </section>
            <section className="grid md:grid-cols-2 lg:grid-cols-3">
                {historyData && historyData?.length > 0 ? historyData.map((data) => {
                    return (
                        <section key={data?._id} className="payment_card_ui" onClick={()=>openModel(data)}>
                            <section className="flex justify-between">
                                <section>
                                    <figure className="flex items-center space-x-4">
                                        <img src={Online} alt="online" />
                                        <figcaption className="text-[0.825rem] opacity-50">
                                            <h6>order id : {data?.order_id?.order_id}</h6>
                                        </figcaption>
                                    </figure>
                                </section>
                                <section>
                                    <h3 className="text-2xl text-[#23B371]">₹ {data?.order_id?.total}</h3>
                                </section>
                            </section>
                            <section className="py-4">
                                <b>{data?.order_id?.name}</b>{" "}<span className="opacity-50">{hideMiddleNumbers(data?.order_id?.phone)}</span><br />
                                <small>Bill value : {data?.order_id?.billValue}</small>
                            </section>
                            <section className="flex gap-4">
                                <button className={cn("flex items-center justify-center px-2 py-1 space-x-2 rounded-2xl",
                                    data?.mode === "online" ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-500'

                                )}>
                                    <small>{data?.mode} Payment</small>
                                </button>
                                <button className="flex items-center justify-center px-2 py-1 space-x-2 bg-[#e7fedc] text-[#23B371] rounded-2xl">
                                    <small>{data?.order_id?.claimedCoins} Coinz used </small>
                                </button>
                            </section>

                        </section>
                    )
                }) : <div className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        No Data Found
            </div>}
            </section>
            <div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
                {historyData && historyData.length >= 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber - 1)}
                        className={defaultClass}
                    >
                        <BiChevronsLeft />
                    </button>
                )}
                <p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
                    {pageNumber}
                </p>
                {historyData && historyData.length > 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber + 1)}
                        className={defaultClass}
                    >
                        <BiChevronsRight />
                    </button>
                )}
            </div>
            {open &&
                <PopUp onClose={closeModel} show={true}>
                    <PaymentModal salesData={salesData}/>
                </PopUp>
            }</main>
    )
})

export default PaymentSales