import { businessCardTypes } from "@/components/utils/helpers.ts";
import { apiRpc } from "@hi/common";

type OutletType = string | null | undefined;
const isJewellery = (t: OutletType) =>
  (t ?? "").toLowerCase() === businessCardTypes.JEWELLERY;

const toStr = (v: string | number | Date) =>
  typeof v === "string" ? v : String(v);

/** CARTS */
// GET carts
export async function fetchCarts(
  businessId: string,
  outletType: OutletType,
  isPosEnabled: boolean,
) {
  if (isJewellery(outletType)) {
    // GET /jewellery/carts?businessId=
    const res = await apiRpc.jewellery.carts.$get({ query: { businessId } });
    if (res.status !== 200)
      throw new Error("Failed to fetch carts (jewellery)");
    const json = await res.json();
    return json.data as any[];
  }
  if (isPosEnabled) {
    const res = await apiRpc.table.orders[":businessId"].$get({
      param: { businessId },
    });
    if (res.status !== 200) throw new Error("Failed to fetch carts (pos)");
    const json = await res.json();
    return json.data as any[];
  }
  // GET /cart?businessId=
  const res = await apiRpc.cart.$get({ query: { businessId } });
  if (res.status !== 200) throw new Error("Failed to fetch carts");
  const json = await res.json();
  return json.data as any[];
}

// PUT archive cart
export async function archiveCart(cartId: string, outletType: OutletType) {
  if (isJewellery(outletType)) {
    // PUT /jewellery/carts/:id
    const res = await apiRpc.jewellery.carts[":id"].$put({
      param: { id: cartId },
    });
    if (res.status !== 200 && res.status !== 204)
      throw new Error("Failed to archive (jewellery)");
    return true;
  }
  // PUT /cart/archive/:id
  const res = await apiRpc.cart.archive[":id"].$put({ param: { id: cartId } });
  if (res.status !== 200 && res.status !== 204)
    throw new Error("Failed to archive");
  return true;
}

/** ALERTS (live) */
// ONLINE alerts
export async function fetchOnlineAlerts(
  businessId: string,
  outletType: OutletType,
) {
  if (isJewellery(outletType)) {
    // GET /jewellery/payments/alerts?businessId=
    const res = await apiRpc.jewellery.payments.alerts.$get({
      query: { businessId },
    });
    if (res.status !== 200)
      throw new Error("Failed to fetch online alerts (jewellery)");
    const json = await res.json();
    return json.data as any[];
  }
  // GET /payments/:id/paymentAlerts?businessId=&alertType=ONLINE
  const res = await apiRpc.payments[":id"].paymentAlerts.$get({
    param: { id: businessId },
    query: { businessId, alertType: "ONLINE" },
  });
  if (res.status !== 200) throw new Error("Failed to fetch online alerts");
  const json = await res.json();
  return json.data as any[];
}

// OFFLINE alerts
export async function fetchOfflineAlerts(
  businessId: string,
  outletType: OutletType,
) {
  if (isJewellery(outletType)) {
    console.log("outletType", outletType);
    return;
  }
  // GET /payments/:id/offlineAlerts?businessId=&alertType=ALL
  const res = await apiRpc.payments[":id"].offlineAlerts.$get({
    param: { id: businessId },
    query: { businessId, alertType: "ALL" },
  });
  if (res.status !== 200) throw new Error("Failed to fetch offline alerts");
  const json = await res.json();
  return json.data as any[];
}

/** ALERT HISTORY */
export async function fetchAlertHistory(params: {
  businessId: string;
  from: number | string | Date;
  to: number | string | Date;
  pageNumber?: number | string;
  outletType?: OutletType;
}) {
  const { businessId, from, to, pageNumber, outletType } = params;

  if (isJewellery(outletType)) {
    // GET /jewellery/payments/alerts/history?businessId=&from=&to=
    const res = await apiRpc.jewellery.payments.alerts.history.$get({
      query: { businessId, from: toStr(from), to: toStr(to) },
    });
    if (res.status !== 200)
      throw new Error("Failed to fetch alert history (jewellery)");
    const json = await res.json();
    return json.data as any;
  }

  // GET /payments/:id/paymentAlertHistory?businessId=&from=&to=&pageNumber=
  const res = await apiRpc.payments[":id"].paymentAlertHistory.$get({
    param: { id: businessId },
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      pageNumber: pageNumber?.toString() ?? 1,
    },
  });
  if (res.status !== 200) throw new Error("Failed to fetch alert history");
  const json = await res.json();
  return json.data as any;
}

/** CHECK-IN USERS (QR) */
export async function fetchCheckInUsers(params: {
  businessId: string;
  outletType?: OutletType;
  from?: number | string | Date;
  to?: number | string | Date;
  qrId?: string;
}) {
  const { businessId, outletType, from, to, qrId } = params;
  if (isJewellery(outletType)) {
    // GET /jewellery/qrs/check_in_users?businessId=&from=&to=&qrId=
    const res = await apiRpc.jewellery.qrs.check_in_users.$get({
      query: {
        businessId,
        ...(from ? { from: toStr(from) } : {}),
        ...(to ? { to: toStr(to) } : {}),
        ...(qrId ? { qrId } : {}),
      },
    });
    if (res.status !== 200)
      throw new Error("Failed to fetch check-in users (jewellery)");
    const json = await res.json();
    return json.data as any[];
  }
  // GET /qrs/check_in_user?businessId=
  const res = await apiRpc.qrs.check_in_user.$get({ query: { businessId } });
  if (res.status !== 200) throw new Error("Failed to fetch check-in users");
  const json = await res.json();
  return json.data as any[];
}
