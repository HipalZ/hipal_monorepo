import { POS_NAME } from "../../constants/posName";
import { hipalzPosSetupHandler, hipalzPosSyncMenuHandler } from "./hipalz";
import {
  hipalzPosNormalSettleHandler,
  hipalzPosOfflineOrderAcceptHandler,
  hipalzPosOfflineOrderHandler,
  hipalzPosOnlineOrderHandler,
} from "./hipalz/orders";
import {
  petPoojaPosSetupHandler,
  petPoojaPosSyncMenuHandler,
} from "./petpooja";

import { hipalzPosRazorpayWebhookHandler } from "./hipalz/payments";

const mainPosRoutesHandlers = {
  [POS_NAME.HIPAL_Z]: {
    setup: hipalzPosSetupHandler,
    sync_menu: hipalzPosSyncMenuHandler,
    offline_order: hipalzPosOfflineOrderHandler,
    normal_settle: hipalzPosNormalSettleHandler,
    offline_order_accept: hipalzPosOfflineOrderAcceptHandler,
    online_order: hipalzPosOnlineOrderHandler,
    razorpay_webhook: hipalzPosRazorpayWebhookHandler,
  },
  [POS_NAME.PETPOOJA]: {
    setup: petPoojaPosSetupHandler,
    sync_menu: petPoojaPosSyncMenuHandler,
  },
};

//

export { mainPosRoutesHandlers };
