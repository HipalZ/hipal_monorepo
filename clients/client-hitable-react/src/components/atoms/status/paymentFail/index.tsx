import { timestampToTime } from "@/components/utils/helpers";
import { MdCreditCard } from "react-icons/md";

function PaymentFail({ ...props }) {

    return (
        <div className="mx-6 bg-[#FF3A3A]/10 rounded-2xl">
            <div className="flex justify-between">
                <div className="py-4 mx-4">
                    <button
                        type="button"
                        className={"font-normal relative text-black rounded-full bg-base-100"}
                    >
                        <div className="inline-flex items-center justify-start">
                            <div
                                className={"w-[1.5rem] absolute left-1 h-[1.5rem] bg-[#FF3A3A] rounded-full"}
                            >
                                <MdCreditCard className="mt-1 ml-1 text-base-100" />
                            </div>
                            <div className="capitalize font-[500] text-lg text-[#FF3A3A]/80 pl-2 ml-6 mr-4">
                                Payment Failed
                            </div>
                        </div>
                    </button>
                </div>
                <div className="font-normal text-base-content/40 text-[0.875rem] mt-6 mr-6 leading-[1rem]">
                    {timestampToTime(props.time)}
                </div>
            </div>
            <div className="flex justify-between pb-4">
                <div className="mx-6 -mt-3">
                    <div className="font-[500] mt-1 text-base-content text-[1rem] leading-[1.25rem]">
                        {props.tableName ? props.tableName : ""}
                    </div>
                    <div className="capitalize font-normal mt-1 text-base-content/40 text-[0.875rem] leading-[1rem]">
                        {props.message}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentFail;
