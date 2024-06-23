import axios from "@/axios";
import { memo, useState } from "react"
import { CiGlobe } from "react-icons/ci";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useTimings from "@/components/store/useTimings";
import { ISalesLite } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helper";

const Overview = memo(() => {
    const params = useParams();
    const businessId = params?.businessId;
    const [salesData, setSalesData] = useState<ISalesLite>()
    const { timeStampStart, timeStampEnd } = useTimings()
    const handleHistoryData = async () => {
        try {
            const config = {
                method: "GET",
                url: `/v1/payments/:id/salesDashboard?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}`,
            };
            const response = await axios(config);
            if (response.status === 200) {
                setSalesData(response?.data?.data)
                return response.data.data;
            } else {
                return {};
            }
        } catch (err) {
            console.log(err);
            return {};
        }
    }

    useQuery({
        queryKey: ['onlineAlerts', businessId, timeStampStart, timeStampEnd],
        queryFn: handleHistoryData,
        enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
    });

    return (
        <>
            <section className="payment_layout">
                <article className="card_payment_overview">
                    <div className="sales_payment_background_effect1" />
                    <div className="sales_payment_background_effect2" />
                    <div className="sales_payment_background_effect3" />
                    <center className="mt-4">{timestampToDateTime(timeStampStart)}</center>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[0.125rem] bg-white h-[50%] mt-10"></div>
                    </div>
                    <section>
                        <h3 className="absolute left-4 bottom-14 opacity-60">
                            Today’s Sales
                        </h3>
                        <h1 className="absolute text-3xl left-4 bottom-6">
                            ₹ {salesData?.totalSale?.toLocaleString('en-IN')}
                        </h1>
                    </section>
                    <section>
                        <h3 className="absolute right-4 bottom-14 opacity-60">
                            Total Discounts
                        </h3>
                        <h1 className="absolute text-3xl right-4 bottom-6">
                            ₹ {salesData?.totalDiscount?.toLocaleString('en-IN')}
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
                            ₹ {salesData?.totalOnlineSale?.toLocaleString('en-IN')}
                        </h1>
                    </article>

                    <article className='online_card2'>
                        <div className="sales_payment_background_effect5"></div>
                        <p className="flex">
                            <CiGlobe className="mr-2" />
                            <small>On floor</small>
                        </p>
                        <h1 className="mt-6 text-2xl">
                            ₹ {salesData?.totalOfflineSale?.toLocaleString('en-IN')}
                        </h1>
                    </article>
                </section>
            </section>
            <section className="flex justify-between gap-4 mx-4 mt-6">
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b> OverAll <br/>
                        Coinz issued
                    </b>
                    <h6>
                        ₹ {salesData?.coinzIssued?.toLocaleString('en-IN')}
                    </h6>
                </article>
                <article className="w-full p-4 border border-[#00000050] rounded-xl">
                    <b> OverAll<br/>
                        Coinz used
                    </b>
                    <h6>
                        ₹ {salesData?.coinzRedeemed?.toLocaleString('en-IN')}
                    </h6>
                </article>
            </section>
        </>

    )
})

export default Overview