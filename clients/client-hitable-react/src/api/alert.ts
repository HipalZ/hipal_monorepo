import { apiRpc } from "@hi/common";
import { isJewellery, type OutletType } from "./salesQueries";

interface UpdateAlertStatusParams {
  alertId: string;
  staffId: string;
  waiterName?: string;
  outletType: OutletType;
}

export async function updateTheAlertStatus(params: UpdateAlertStatusParams) {
  const { alertId, outletType, waiterName } = params;

  if (isJewellery(outletType)) {
    const res = await apiRpc.jewellery.payments.alerts[":alertId"].reject.$put({
      param: { alertId },
      json: {
        staffId: params.staffId,
      },
    });
    return res;
  }
  const res = await apiRpc.payments[":pid"].rejectOrder[":alertId"].$put({
    json: {
      waiterName: waiterName,
    },
    param: {
      pid: alertId || "",
      alertId: alertId,
    },
  });
  return res;
}

interface payload {
  alertId: string;
  comment: string;
  waiterName: string;
  settleModes: { _id: string; name: string; amount: number }[];
  duesUserId?: string;
}
interface UpdateAlertToConfirmStatusParams {
  payload: payload;
  outletType: OutletType;
}

export async function updateTheAlertToConfirmStatus(
  params: UpdateAlertToConfirmStatusParams,
) {
  const { outletType, payload } = params;
  if (isJewellery(outletType)) {
    const res = await apiRpc.jewellery.payments.alerts[":alertId"].accept.$put({
      param: { alertId: payload.alertId },
      json: payload,
    });
    return res;
  }
  const res = await apiRpc.payments[":pid"].order[":alertId"].$put({
    param: {
      alertId: payload.alertId,
    },
    json: payload,
  });
  return res;
}

interface FetchAlertHistoryPayload {
  payload: {
    businessId: string;
    from?: number | string;
    to?: number | string;
    pageNumber?: number | string;
  };
  outletType?: OutletType;
}

export async function fetchAlertHistory({
  payload,
  outletType,
}: FetchAlertHistoryPayload) {
  if (isJewellery(outletType)) {
    const res = await apiRpc.jewellery.payments.alerts.history.$get({
      query: payload,
    });
    return res;
  }
  const res = await apiRpc.payments[":id"].paymentAlertHistory.$get({
    param: {
      id: payload.businessId,
    },
    query: payload,
  });
  return res;
}
