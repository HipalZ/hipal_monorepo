import { create } from "zustand";

export interface OutletFormState {
  formData: {
    placeId: string;
    placeUrl: string;

    // UI time fields
    endTime: string; // closing time (user selects)
    extendEndTime: string; // extended closing time (user selects)

    // Other outlet fields
    brandName: string;
    branchName: string;
    url: string;

    // Backend numeric time fields (HHmm)
    startBillTime: number; // auto: 1 min after closing
    endBillTime: number; // closing time numeric
    extendBillTime: number; // extended closing numeric

    _id?: string;
  };
  setEntireFormData: (data: Partial<OutletFormState["formData"]>) => void;
  setFormData: (
    key: keyof OutletFormState["formData"],
    value: string | number,
  ) => void;
}

export const useOutletFormStore = create<OutletFormState>((set) => ({
  formData: {
    placeId: "",
    placeUrl: "",

    endTime: "",
    extendEndTime: "",

    brandName: "",
    branchName: "",
    url: "",

    startBillTime: 0,
    endBillTime: 0,
    extendBillTime: 0,

    _id: "",
  },
  setFormData: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
  setEntireFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),
}));

// ---------------- Business form (unchanged) ----------------

export interface BusinessFormState {
  businessFormData: {
    registeredBusinessName: string;
    registrationType: string;
    businessType: string;
    establishmentYear: string;
    companyPan: string;
    gstNumber: string;
    gstYesNo: string;
    accountNumber: string;
    beneficiaryName: string;
    ifscCode: string;
    businessEmail: string;
    businessContact: string;
    authSignatoryName: string;
    contactPanCard: string;
    merchantId: string;
    accessKeyId: string;
    secretKey: string;
    notificationSound: "order" | "alarm";
    _id?: string;
  };
  setBusinessFormData: (
    key: keyof BusinessFormState["businessFormData"],
    value: string,
  ) => void;
  setEntireBusinessFormData: (
    data: Partial<BusinessFormState["businessFormData"]>,
  ) => void;
}

export const useBusinessFormStore = create<BusinessFormState>((set) => ({
  businessFormData: {
    registeredBusinessName: "",
    registrationType: "",
    businessType: "",
    establishmentYear: "",
    companyPan: "",
    gstNumber: "",
    gstYesNo: "",
    accountNumber: "",
    beneficiaryName: "",
    ifscCode: "",
    businessEmail: "",
    businessContact: "",
    authSignatoryName: "",
    contactPanCard: "",
    merchantId: "",
    accessKeyId: "",
    secretKey: "",
    notificationSound: "order",
    _id: undefined,
  },
  setBusinessFormData: (key, value) =>
    set((state) => ({
      businessFormData: {
        ...state.businessFormData,
        [key]: value,
      },
    })),
  setEntireBusinessFormData: (data) =>
    set((state) => ({
      businessFormData: {
        ...state.businessFormData,
        ...data,
      },
    })),
}));
