import { redirect } from "next/navigation";
import { IBiz, IBusinessData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export async function fetchCommonData(businessId: string): Promise<{ data: IBusinessData, bizId: string }> {
    let bizId = businessId;
    const data = {} as IBusinessData;

    if (!objectIdRegex.test(businessId)) {
        const res = await apiRpc.businesses.n[":customLink"].$get({
            param: { customLink: businessId }
        });
        const response = await res.json() as unknown as { data: IBusinessData; message: string; error: boolean };
        if (response.data !== null) {
            data["business"] = response.data as unknown as IBiz; 
            bizId = response.data._id;
        } else {
            data["business"] = {} as IBiz;
        }
    }

    if (!bizId) {
        redirect('/');
    }

    const settingsResponse = await apiRpc.settings.$get({
        query: { businessId: bizId }
    });
    const settings = await settingsResponse.json();
    data["settings"] = settings?.data[0] || {};


    return {data, bizId};
}
