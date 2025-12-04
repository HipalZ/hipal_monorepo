export type AnyPayment = any;

export type BaseContext = {
  businessIds: string[];
  from: number;
  to: number;
  allPayments: AnyPayment[];
  bizNameMap: Record<string, string>;
  kitchenNameMapByBiz: Record<string, Record<string, string>>;
};
