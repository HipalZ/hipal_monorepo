import { useCustomerzData } from "@/components/store/useCustomerzData";
import { formatDate } from "@/components/templates/customerz";
import type { ICustomer } from "@/components/types/businessData";
import { useRouter } from "next/router";
import { memo } from "react";
import { MdPerson } from "react-icons/md";

export const BeforeMemoCustomerzList = (data: { customerData: ICustomer[] }) => {
    const { customerData } = data;
    const {setCustomerzName,setCustomerzPhone} = useCustomerzData();
    const router = useRouter();
    const { businessId } = router.query as {
        businessId: string;
    };
    const customerDetails = (id: string,name:string,phone:string) => {
        setCustomerzName(name)
        setCustomerzPhone(phone)
        router.push(`/business/${businessId}/customerz/${id}`)
    }
    return (
        <article className="mx-6 pb-[6rem] masonry-layout mt-6">
            {customerData?.length
                ? customerData.map((data) => (
                    <div
                        key={data?._id}
                        className="px-4 on_active_bounce masonry-item bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
                    >
                        <div className="flex items-center py-2">
                            <MdPerson className="mr-2" />
                            <h1 className="text-lg">{data.name}</h1>
                        </div>
                        <div onClick={() => customerDetails(data._id, data.name, data.phone)} className="flex items-center justify-between py-2">
                            <span className="text-sm">Dined on {formatDate(new Date(data.date))}</span>
                            <span className="justify-self">view</span>
                        </div>
                    </div>
                ))
                : <center>No Bills Found</center>}
        </article>
    )
}

export const CustomerzList = memo(BeforeMemoCustomerzList);