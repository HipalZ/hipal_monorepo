import { apiRpc } from "@hi/common";
import { toast } from "react-toastify";

// Shared types you already have
type CartItem = any;

export async function menuPos_placeOrder({
  businessId,
  tableName,
  cart,
  userId,
  customerPhone,
}: {
  businessId: string;
  tableName: string;
  cart: CartItem[];
  userId?: string;
  customerPhone?: string;
}) {
  // POS ordering
  const res = await apiRpc.pos.save_kot.$post({
    json: {
      tableName,
      businessId,
      internalCart: cart,
      customerPhone,
      userId,
    },
  });
  if (res.status === 200 || res.status === 201) {
    toast.success("Order placed");
  } else {
    const j = await res.json().catch(() => ({}) as any);
    toast.error(j?.message || "Failed to place order");
  }
  return res;
}

export async function menuShare_shareCart({
  businessId,
  tableName,
  cart,
  name,
  phone,
  userId,
}: {
  businessId: string;
  tableName: string;
  cart: CartItem[];
  name?: string;
  phone?: string;
  userId?: string;
}) {
  // Non-POS share cart (existing)
  const res = await apiRpc.cart.create.$post({
    json: { businessId, userId, tableName, cart, name, phone },
  });
  if (res.status === 200 || res.status === 201) {
    toast.success("Cart shared successfully");
  } else {
    const j = await res.json().catch(() => ({}) as any);
    toast.error(j?.message || "Failed to share cart");
  }
  return res;
}

export async function other_shareCart({
  businessId,
  cart,
  meta,
}: {
  businessId: string;
  cart: CartItem[];
  meta?: Record<string, any>;
}) {
  // OTHER flow endpoint (adjust to your API)
  const res = await apiRpc.other.share_cart.$post({
    json: { businessId, cart, meta },
  });
  if (res.status === 200 || res.status === 201) {
    toast.success("Cart shared");
  } else {
    const j = await res.json().catch(() => ({}) as any);
    toast.error(j?.message || "Share failed");
  }
  return res;
}

export async function jewellery_shareSelection({
  businessId,
  cart,
  userId,
  id,
  phone,
  name,
}: {
  businessId: string;
  cart: CartItem[];
  userId?: string;
  id: string;
  phone?: string;
  name?: string;
}) {
  // JEWELLERY flow endpoint (no tableName)
  const res = await apiRpc.jewellery.carts.$post({
    json: {
      id: businessId,
      cart: cart,
      userId: userId,
      businessId: businessId,
      name,
      phone,
    },
  });
  if (res.status === 200 || res.status === 201) {
    toast.success("Selection shared");
  } else {
    const j = await res.json().catch(() => ({}) as any);
    toast.error(j?.message || "Failed to share selection");
  }
  return res;
}
