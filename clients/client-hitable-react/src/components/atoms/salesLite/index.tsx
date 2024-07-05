import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import useTimings from "@/components/store/useTimings";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react"
import { CiGlobe } from "react-icons/ci";
import DateRangePickerMemo from "../dateRangePicker";
import { apiRpc } from "@hi/common";
import { ISalesLite } from "@/components/types/hiClientzData";
import { getDate } from "@/components/utils/helpers";
import './index.css'

const SalesLite = () => {
    const { selectedBiz } = useHiClientZ((s) => ({
        selectedBiz: s.selectedBiz,
    }));
    const businessId = selectedBiz?.businessId?._id;
    const { salesData, setSalesData, setLoading } = useLiteStore((s) => ({
        salesData: s.salesData,
        setSalesData: s.setSalesData,
        setLoading: s.setLoading,
    }));
    const { timeStampStart, timeStampEnd } = useTimings((s) => ({
        timeStampStart: s.timeStampStart,
        timeStampEnd: s.timeStampEnd,
    }))
    const handleSales = async () => {
        setLoading(true)
        try {
            const res = await apiRpc.payments[":id"].salesDashboard.$get({
                param: { id: businessId },
                query: {
                    businessId: businessId,
                    from: timeStampStart.toString(),
                    to: timeStampEnd.toString(),
                }
            })
            const response = (await res.json()).data as ISalesLite
            if (res.status === 200) {
                setSalesData(response)
                return response;
            } else {
                return {};
            }
        } catch (err) {
            console.log(err);
            return {};
        } finally {
            setLoading(false)
        }
    }

    useQuery({
        queryKey: ['onlineAlerts', businessId, timeStampStart, timeStampEnd],
        queryFn: handleSales,
        enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
    });

    return (
        <>
            <DateRangePickerMemo />
            <section className="payment_layout">
                <article className="card_payment_overview">
                    <center className="absolute left-1/2 top-4 -translate-x-1/2">
                        {getDate(timeStampStart)}
                    </center>
                    <div className="sales_payment_background_effect1" />
                    <div className="sales_payment_background_effect2" />
                    <div className="sales_payment_background_effect3" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[0.125rem] bg-white h-[50%] mt-10"></div>
                    </div>
                    <section>
                        <h3 className="absolute left-4 bottom-14 opacity-60">
                            Sales
                        </h3>
                        <h1 className="absolute text-3xl left-4 bottom-6">
                            ₹ {salesData?.totalSale}
                        </h1>
                    </section>
                    <section>
                        <h3 className="absolute right-4 bottom-14 opacity-60">
                            Total Discounts
                        </h3>
                        <h1 className="absolute text-3xl right-4 bottom-6">
                            ₹ {salesData?.totalDiscount}
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
                            ₹ {salesData?.totalOnlineSale}
                        </h1>
                    </article>

                    <article className='online_card2'>
                        <div className="sales_payment_background_effect5"></div>
                        <p className="flex">
                            <CiGlobe className="mr-2" />
                            <small>On floor</small>
                        </p>
                        <h1 className="mt-6 text-2xl">
                            ₹ {salesData?.totalOfflineSale}
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
                        ₹ {salesData?.coinzIssued}
                    </h6>
                </article>
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b>
                        Coinz used
                    </b>
                    <h6>
                        ₹ {salesData?.coinzRedeemed}
                    </h6>
                </article>
            </section>
        </>

    )
}

const SalesLiteMemo = memo(SalesLite)
export default SalesLiteMemo