import { redirect } from "next/navigation";
import type { BusinessDetails, IBusinessData } from "@/components/types/businessData";
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
            data["business"] = response.data as unknown as BusinessDetails; 
            bizId = response.data.businessId;
        } else {
            data["business"] = {} as BusinessDetails;
        }
    }

    if (!bizId) {
        redirect('/');
    }
    const settingsResponse = await apiRpc.businesses.themes[":businessId"].$get({
        param:{
            businessId:bizId,
        }
    })
    const settings = await settingsResponse.json();
    data["settings"] = settings?.data?.theme || {};
    console.log('data',data)
    console.log('bizId',bizId)
    return {data, bizId};
}
