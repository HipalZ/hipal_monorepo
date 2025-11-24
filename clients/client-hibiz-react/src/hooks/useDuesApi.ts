import type { ISettleMode } from "@/components/store/useDues";
import type { IMode } from "@/components/templates/payment/selectPaymentMode";
import type { IDuesPersonsData } from "@/components/types/businessData";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const useAllDueUsers = (businessId: string) => {
  const { handleEnvelope } = useApiErrorHandler();
  const getAllUsers = async () => {
    const response = await apiRpc.dues[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await handleEnvelope(response);
    let duesData = res as IDuesPersonsData[];

    duesData = duesData.filter((due) => due.userId !== null);
    return duesData as IDuesPersonsData[];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allDueUsers", businessId],
    queryFn: getAllUsers,
    enabled: !!businessId,
  });

  return { isLoading, data };
};

export const useGetAllModes = (
  businessId: string,
  showPaymentMode: boolean,
) => {
  const { handleEnvelope } = useApiErrorHandler();
  const { isLoading, data: paymentMode } = useQuery({
    queryKey: ["getAllModes"],
    queryFn: async () => {
      const response = await apiRpc.upi_mode.all[":businessId"].$get({
        param: {
          businessId: businessId || "",
        },
      });
      const res = await handleEnvelope(response);

      return (res as IMode[]) || [];
    },
    enabled: !!businessId && !!showPaymentMode,
    staleTime: 1000 * 60,
  });

  return {
    isLoading,
    paymentMode,
  };
};

export const settleDues = async (
  businessId: string,
  userId: string,
  settleModes: ISettleMode[],
) => {
  const response = await apiRpc.dues.settle_dues.$put({
    json: {
      businessId,
      duesUserId: userId,
      settleModes,
    },
  });
  return response.json();
};

export interface DuesHistoryItem {
  _id: string;
  orderId: string | null;
  billInvoiceNumber: number;
  settleAmount: number;
  duesUserId: string;
  date: number | null;
  __v: number;
}

export interface BillItemDish {
  _id: string;
  businessId: string;
  posDishId: string;
  __v: number;
  availability: boolean;
  categoryIds: string[];
  createdAt: string;
  description: string;
  dishTypes: string[];
  ignoreDiscount: string;
  ignoreTax: string;
  images: string[];
  isDeleted: boolean;
  menuId: string;
  name: string;
  portions: any[];
  pos: boolean;
  posTax: string;
  price: number;
  rank: number;
  tags: string[];
  updatedAt: string;
  visibility: boolean;
  active: boolean;
  kitchenId: string;
  tax: number;
  gst: number;
  vat: number;
}

export interface BillItem {
  id: string;
  dish: BillItemDish;
  portion: any | null;
  extras: any[];
  quantity: number;
  isDeleted: boolean;
  discount: number;
  _id: string;
}

export interface SplitMode {
  name: string;
  amount: number;
  _id: string;
}

export interface PaymentItem {
  _id: string;
  businessId: string;
  date: number;
  total: number;
  userId: string;
  mode: string;
  paymentMode: string;
  billValue: number;
  tableName: string;
  order_id: string;
  tips: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  claimedCoins: number;
  razorpayEventId: string;
  waiterName: string;
  posBillId: string;
  earnCoins: number;
  tagIds: string[];
  settleType: string;
  comment: string;
  tax: number;
  serviceCharge: number;
  splitModes: SplitMode[];
  discount: number;
  initialTax: number;
  initialSubTotal: number;
  initialTotal: number;
  finalSubTotal: number;
  discountType: string;
  isDeleted: boolean;
  updatedAt: number;
  billId: string;
  couponDiscount: number;
  billItems: BillItem[];
  pin: string;
  createdAt: string;
  billInvoice: number;
  __v: number;
}

export interface DuesHistoryData {
  duesHistory: DuesHistoryItem[];
  payments: PaymentItem[];
}

export interface GetUserDuesHistoryResponse {
  message: string;
  data: DuesHistoryData;
  err: boolean;
}

export const useUserDuesHistory = (duesUserId: string) => {
  const businessId = useParams().businessId;
  const { handleEnvelope } = useApiErrorHandler();

  const getUserDuesHistory = async (): Promise<GetUserDuesHistoryResponse> => {
    const response = await apiRpc.dues.dues_history[":duesUserId"][
      ":businessId"
    ].$get({
      param: {
        duesUserId: duesUserId,
        businessId: businessId || "",
      },
    });

    const res = await handleEnvelope(response);
    return res as GetUserDuesHistoryResponse;
  };

  const { isLoading, data: userDuesHistory } =
    useQuery<GetUserDuesHistoryResponse>({
      queryKey: ["getUserDuesHistory", duesUserId, businessId],
      queryFn: getUserDuesHistory,
      enabled: !!duesUserId,
    });

  return { isLoading, userDuesHistory };
};
