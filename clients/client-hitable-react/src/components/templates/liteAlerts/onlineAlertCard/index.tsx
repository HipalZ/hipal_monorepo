import { useLiteStore } from "@/components/store/useLiteStore";
import { Alert } from "@/components/types/hiClientzData";
import axios from "@/components/utils/axios";
import { cn, timestampToDateTime } from "@/components/utils/helpers";
import { memo } from "react";
import { CiGlobe } from "react-icons/ci";
import { IoCloseCircleSharp } from "react-icons/io5";
import { PiCoinsFill } from "react-icons/pi";

interface IOnlineProp {
    selectedNavItem: string;
    onlineAlertData: Alert[];
}

const OnlineAlertCard = memo((props: IOnlineProp) => {
    const { selectedNavItem, onlineAlertData } = props;
    const { removeOnlineAlert, setViewData } = useLiteStore()
    const clickViewMore = useLiteStore((s) => s.clickViewMore);
    const setClickViewMore = useLiteStore((s) => s.setClickViewMore)

    const handleViewMore = (alert: Alert) => {
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
            if (response.status === 200) {
                removeOnlineAlert(id);
            }
        } catch (err) {
            console.log(err);
            return {};
        }
    }

    return (
        <main className="lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-[5rem]">
            {
                Array.isArray(onlineAlertData) && onlineAlertData.length > 0 ? onlineAlertData.map((alert: Alert) => {
                    if(alert?.alertType === "WAITER"){return null}
                    return (
                        <section key={alert?._id} className={cn('relative h-[10.5rem]', "my-4 rounded-xl mx-4 p-4", selectedNavItem === 'online' ? 'bg-white' : 'bg-gray-300')}>
                            <section className="flex justify-between mb-2">
                                <article className={cn("flex items-center px-2 w-[8rem] rounded-full", alert?.alertType === "ONLINE" ? ' bg-green-100' : 'bg-red-100')}>
                                    {alert?.alertType === "ONLINE" ? <span><CiGlobe /></span> : <span><PiCoinsFill /></span>}
                        &nbsp;
                        <h1 className="text-xs">Received {alert?.alertType.toLowerCase()}</h1>
                                </article>
                                <article>
                                    <h1 className="text-xs text-gray-500">{timestampToDateTime(alert?.order_id?.date)}</h1>
                                </article>
                                {selectedNavItem === 'online' ? <IoCloseCircleSharp onClick={() => handleRemoveAlert(alert?._id)} size={24} className="inline absolute -right-2 -top-2 text-red-400" /> : null}
                            </section>
                            <div className="flex justify-between">
                                <section>
                                    <article className="space-y-1 ml-2">
                                        <h1 className="text-base">Bill value : ₹ {alert?.order_id?.billValue}</h1>
                                        <h1 className="text-base">Discount : ₹ {alert?.order_id?.claimedCoins}</h1>
                                        <h6 className="text-sm">Tips : ₹ {alert?.order_id?.tips}</h6>
                                    </article>
                                    {alert?.coinsApplied ? <article className="flex justify-start items-center bg-gray-200 my-2 rounded-full w-fit px-3 py-">
                                        <span><PiCoinsFill size={20} /></span>
                                        &nbsp;
                                        <h1 className="text-xs">{alert?.order_id?.claimedCoins} Used</h1>
                                    </article> : null}
                                </section>
                                <section className="text-right">
                                    <article className="space-y-1">
                                        <h1 className="text-base text-gray-700">{alert?.tableName}</h1>
                                        <h6 className="text-2xl font-semibold">₹ {alert?.order_id?.total}</h6>
                                    </article>
                                    <button onClick={() => handleViewMore(alert)} className="bg-black text-white py-1 px-6 mt-6 rounded-full">
                                        <h1 className="text-xs">{selectedNavItem === 'online' ? 'More' : 'View'}</h1>
                                    </button>
                                    {alert?.alertType !=="ONLINE" && alert?.alertType !=="WAITER" && alert?.completionCode !==null ? <h1 className="mt-2">Code: {alert?.completionCode}</h1>:null}
                                </section>
                            </div>
                        </section>
                    )
                })
                    : <div className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        No Data Found
                  </div>}
        </main>
    )
})

export default OnlineAlertCard;