import { Alert } from "@/components/types/hiClientzData";
import { CiGlobe } from "react-icons/ci";
import callwaiter from '@/assets/img/callwaiter.png';
import { useLiteStore } from "@/components/store/useLiteStore";
import { timestampToDateTime } from "@/components/utils/helpers";
import { PiCoinsFill } from "react-icons/pi";
import { IoCloseCircleSharp } from "react-icons/io5";
import axios from "@/components/utils/axios";

interface IOfflineProp {
    offlineAlertData: Alert[];
}

const OfflineAlertCard = (props: IOfflineProp) => {
    const { offlineAlertData } = props;
    const { removeOfflineAlert, setViewData,clickViewMore,setClickViewMore } = useLiteStore()

    const handleViewMore = (alert:Alert) => {
        setViewData(alert)
        setClickViewMore(!clickViewMore);
    }

    const handleRemoveAlert = async (id: string) => {
        try {
            const config = {
                method: "PUT",
                url: `/v1/payments/:pid/order/${id}`,
            };
            const response = await axios(config);
            console.log('off',response);
            if (response.status === 200) {
                removeOfflineAlert(id);
            }
        } catch (err) {
            console.log(err);
            return {};
        }
    }

    return (
        <main className="lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-[5rem]">
            {Array.from(offlineAlertData) &&  offlineAlertData?.length > 0 && offlineAlertData.map((alert: Alert) => {
                return (
                    <section key={alert?._id}>
                        {alert?.alertType === "WAITER" ? <div className="bg-white h-[7rem] rounded-xl mx-4 p-4 my-4">
                            <section className="flex justify-between mb-2 relative">
                                <article className="flex items-center bg-[#ffe9cf] px-2 w-[8rem] rounded-full">
                                    <img src={callwaiter} alt="callwaiter" />
                                    &nbsp;&nbsp;
                                    <h1 className="text-xs">Call the waiter</h1>
                                </article>
                                <article>
                                    <h1 className="text-xs text-gray-500">{timestampToDateTime(alert?.date)}</h1>
                                </article>
                                <IoCloseCircleSharp onClick={() => handleRemoveAlert(alert?._id)} size={24} className="inline absolute -right-6 -top-6 text-red-400" />
                            </section>
                            <div className="flex justify-between">
                                <section>
                                    <article className="space-y-1 ml-2">
                                        <h1 className="text-base">User Name:{alert?.name || 'HI'}</h1>
                                        <p>{alert?.message}</p>
                                    </article>
                                </section>
                                <section className="text-right">
                                    <h1>{alert?.tableName}</h1>
                                </section>
                            </div>
                        </div>
                            : <div className="bg-white h-[10.5rem] rounded-xl mx-4 p-4 my-4">
                                <section className="flex justify-between mb-2">
                                    <article className="flex items-center bg-[#ffe9cf] px-2 w-[8.5rem] rounded-full">
                                        <span><CiGlobe /></span>
                                &nbsp;
                                <h1 className="text-xs">Confirm On floor</h1>
                                    </article>
                                    <article>
                                        <h1 className="text-xs text-gray-500">{timestampToDateTime(alert?.order_id?.date)}</h1>
                                    </article>
                                </section>
                                <div className="flex justify-between">
                                    <section>
                                        <article className="space-y-1 ml-2">
                                            <h1 className="text-base">Bill value : ₹ {alert?.order_id?.billValue}</h1>
                                            <h1 className="text-base">Discount : ₹ {alert?.order_id?.claimedCoins}</h1>
                                            <h6 className="text-xs">Tips : ₹ {alert?.order_id?.tips}</h6>
                                        </article>
                                        {alert?.coinsApplied ? <article className="flex justify-start items-center bg-gray-200 my-2 rounded-full w-fit px-3 py-">
                                            <span><PiCoinsFill size={20} /></span>
                                        &nbsp;
                                        <h1 className="text-xs">{alert?.order_id?.claimedCoins} Used</h1>
                                        </article> : null}
                                    </section>
                                    <section className="text-right">
                                        <article className="space-y-1">
                                            <h1 className="text-base text-gray-700">{alert?.order_id?.tableName}</h1>
                                            <h6 className="text-2xl font-semibold">₹ {alert?.order_id?.total}</h6>
                                        </article>
                                        <button onClick={()=>handleViewMore(alert)} className="bg-black text-white py-1 px-6 mt-6 rounded-full">
                                            <h1 className="text-xs">View</h1>
                                        </button>
                                    </section>
                                </div>
                            </div>}
                    </section>
                )
            })}
        </main>
    )
};

export default OfflineAlertCard;