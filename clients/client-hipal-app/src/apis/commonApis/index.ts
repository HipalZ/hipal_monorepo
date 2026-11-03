import { redirect } from "next/navigation";
import type {
  BusinessDetails,
  IBusinessData,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const cachedRequestInit: RequestInit & { next: { revalidate: number } } = {
  cache: "force-cache",
  next: { revalidate: 300 },
};

export async function fetchCommonData(
  businessId: string,
): Promise<{ data: IBusinessData; bizId: string }> {
  let bizId = businessId;
  const data = {} as IBusinessData;

  if (!objectIdRegex.test(businessId)) {
    const res = await apiRpc.businesses.n[":customLink"].$get({
      param: { customLink: businessId },
    }, {
      init: cachedRequestInit,
    });
    const response = (await res.json()) as unknown as {
      data: IBusinessData;
      message: string;
      error: boolean;
    };
    if (response.data !== null) {
      data["business"] = response.data as unknown as BusinessDetails;
      bizId = response.data.businessId;
    } else {
      data["business"] = {} as BusinessDetails;
    }
  } else {
    const res = await apiRpc.businesses.get.Single[":businessId"].$get({
      param: { businessId },
    }, {
      init: cachedRequestInit,
    });
    const response = (await res.json()) as unknown as {
      data: IBusinessData;
      message: string;
      error: boolean;
    };
    data["business"] = response.data as unknown as BusinessDetails;
  }

  if (!bizId) {
    redirect("/");
  }

  const settingsResponse = await apiRpc.businesses.themes[":businessId"].$get({
    param: {
      businessId: bizId,
    },
  }, { init: cachedRequestInit });
  const settings = await settingsResponse.json();
  data["settings"] = settings?.data?.theme || {};

  return { data, bizId };
}

export const getBusinessData = async (customLink: string) => {
  if (!customLink) {
    return redirect("/");
  }
  try {
    const res = await apiRpc.businesses.n[":customLink"].$get({
      param: { customLink },
    }, {
      init: cachedRequestInit,
    });

    const response = (await res.json()) as unknown as {
      data: BusinessDetails;
      message: string;
      error?: boolean;
      err?: boolean;
    };

    if (response.error || !response.data) {
      throw new Error("Failed to fetch business data");
    }

    if (response.err) {
      console.error("Error fetching business data:", response);
      redirect("/");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching business data:", error);
    redirect("/");
  }
};

export const getMenuData = async (tableName: string, businessId: string) => {
  const response = await apiRpc.menu.fetch_table_menu.$get({
    query: {
      tableName: tableName,
      businessId: businessId,
    },
  });
  const menuData = await response.json();
  if (response.status === 400) {
    console.error("Error fetching menu data:", menuData);
    // redirect("/");
  }
  if (response.status === 200) {
    return menuData.data;
  }
  return null;
};

export const getMenuWithoutTableName = async (businessId: string) => {
  const response = await apiRpc.menu.fetch_table_menu.$get({
    query: {
      businessId: businessId,
    },
  });
  const menuData = await response.json();
  if (response.status === 400) {
    console.error("Error fetching menu data:", menuData);
    // redirect("/");
  }
  if (response.status === 200) {
    return menuData.data;
  }
  return null;
};

export const getPropertyImages = async (businessId: string) => {
  const response = await apiRpc.bucket.images.fetch_bucket_by_business.$get({
    query: {
      businessId: businessId,
    },
  });
  return response.json();
};
