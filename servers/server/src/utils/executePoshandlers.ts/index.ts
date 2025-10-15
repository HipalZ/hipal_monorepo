import { mainPosRoutesHandlers } from "../../handlers/pos";

export async function executePosHandler(
  posName: string,
  action:
    | "setup"
    | "sync_menu"
    | "offline_order"
    | "online_order"
    | "normal_settle"
    | "offline_order_accept"
    | "razorpay_webhook",

  params: Record<string, unknown>,
) {
  try {
    //@ts-ignore
    const handler = mainPosRoutesHandlers[posName]?.[action];
    if (!handler) {
      throw new Error(`Handler not found for ${posName} and action ${action}`);
    }

    const result = await handler(params);
    return result;
  } catch (error) {
    console.error(`[${posName}.${action}] ERROR:`, error);
    return {
      error: (error as Error).message || "Internal error in POS handler",
    };
  }
}
