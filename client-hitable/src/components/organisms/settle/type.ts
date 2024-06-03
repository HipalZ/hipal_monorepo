export interface IFinalBill {
    subTotal: number;
    Total: number;
    discount: number;
    CGST: number;
    SGST: number;
    businessName: string;
    claimedAmount: number;
    serviceCharge: number;
    tips: number;
    customerName:string,
    duesPersonId:string,
    customerPhone:string,
    transferBy:string,
    switchedBy:string,
    mergedBy:string,
    kickedOutBy:string,
    discountGivenBy:string,
    discountRemovedBy:string,
    coinsGivenBy:string,
    serviceChargeRemovedBy:string,
    serviceChargeAddedBy:string,
    itemAddedby:string,
    tipsGivenBy:string,
}

export type SettlePageTypes =
    | "SETTLE"
    | "SPLIT"
    | "DISCOUNT"
    | "TIP"
    | "CASH"
    | "HI_COINS"
    | "PRINT_BILL"
    | "DUES"
    | "E_BILL"
    | "SPLIT_PAYMENT"
    | "REMOVE_SERVICE_TAX"
    | "";

export type DishDetails = {
    name?: string;
    qty?: number | undefined;
    quantity?: number | undefined;
    price?: number;
    portions?: {
        price?: string;
    };
    extras?: {
        name?: string;
        price?: string;
        qty?: number;
    }[];
};


export type User = {
    customerPhone: string;
    customerName: string;
};
export interface ILoyaltyUser {
    cgst: number;
    date: string;
    id: string;
    items: [];
    loyaltyId: string;
    claimedAmount: string;
    rewards: number;
    sgst: number;
    status: string;
    total: number;
    subTotal: number;
    userName: string;
    userPhone: string;
    password: number;
    customerPhone: string;
    customerName: string;
}

