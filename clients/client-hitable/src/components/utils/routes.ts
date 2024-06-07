const BASE_ROUTE = 'r';
const LITE_ROUTE = 'l';

const withBusinessId = (businessId: string, route: string) => `/${BASE_ROUTE}/${businessId}${route}`;
const withBusinessIdLite = (businessId: string, route: string) => `/${LITE_ROUTE}/${businessId}${route}`;

export const PAGE_TYPES = {
  LOGIN: 'login',
  ZONE: 'zone',
  TABLES: 'tables',
  LOYALTY: 'loyalty',
  ALERT: 'alert',
  ALERTS: 'alerts',
  TRANSACTIONS: 'transactions',
  STATUS: 'status',
  ORDER: 'orders',
  SINGLE_TABLE: 'single',
  KICK_USER: 'kickUser',
  SWITCH: 'switch',
  PAYMENT: 'payment',
  LOGIN_LITE: 'litelogin',
  TAKE_AWAY: 'takeaway',
  TAKE_AWAY_ID: 'takeawayid',
  SETTING: 'setting',
  SALES: 'sales',
  BILLS: 'bills',
  MERGE: 'merge',
  HISTORY: 'history',
};

export const routePaths = {
  [PAGE_TYPES.TABLES]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/zone/${zoneId}`),
  [PAGE_TYPES.ALERT]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/zone/${zoneId}/alert`),
  [PAGE_TYPES.STATUS]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/zone/${zoneId}/status`),
  [PAGE_TYPES.ORDER]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/zone/${zoneId}/orders`),
  [PAGE_TYPES.HISTORY]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/zone/${zoneId}/history`),
  [PAGE_TYPES.TAKE_AWAY]: (businessId: string, zoneId: string) => withBusinessId(businessId, `/takeaway/${zoneId}`),
};
export const singleRoute = {
  [PAGE_TYPES.LOGIN]: (businessId: string) => withBusinessId(businessId, '/login'),
  [PAGE_TYPES.ZONE]: (businessId: string) => withBusinessId(businessId, '/zone'),
  [PAGE_TYPES.SALES]: (businessId: string) => withBusinessId(businessId, '/sales'),
  [PAGE_TYPES.BILLS]: (businessId: string) => withBusinessId(businessId, '/bills'),
  [PAGE_TYPES.SETTING]: (businessId: string) => withBusinessId(businessId, '/setting'),
  [PAGE_TYPES.LOGIN_LITE]: (businessId: string) => withBusinessIdLite(businessId, '/litelogin'),
  [PAGE_TYPES.LOYALTY]: (businessId: string) => withBusinessIdLite(businessId, `/loyalty`),
  [PAGE_TYPES.ALERTS]: (businessId: string) => withBusinessIdLite(businessId, `/alerts`),
  [PAGE_TYPES.TRANSACTIONS]: (businessId: string) => withBusinessIdLite(businessId, `/transactions`),
};

export const newRoutes = {
  [PAGE_TYPES.SINGLE_TABLE]: (businessId: string, zoneId: string, tableId: string) => withBusinessId(businessId, `/zone/${zoneId}/${tableId}`),
  [PAGE_TYPES.TAKE_AWAY_ID]: (businessId: string, takeawayid: string, orderId: string) =>
    withBusinessId(businessId, `/takeaway/${takeawayid}/${orderId}`),
  [PAGE_TYPES.KICK_USER]: (businessId: string, zoneId: string, tableId: string) => withBusinessId(businessId, `/zone/${zoneId}/${tableId}/kickUser`),
  [PAGE_TYPES.SWITCH]: (businessId: string, zoneId: string, tableId: string) => withBusinessId(businessId, `/zone/${zoneId}/${tableId}/switch`),
  [PAGE_TYPES.MERGE]: (businessId: string, zoneId: string, tableId: string) => withBusinessId(businessId, `/zone/${zoneId}/${tableId}/merge`),
  [PAGE_TYPES.PAYMENT]: (businessId: string, zoneId: string, tableId: string) => withBusinessId(businessId, `/zone/${zoneId}/${tableId}/payment`),
};
