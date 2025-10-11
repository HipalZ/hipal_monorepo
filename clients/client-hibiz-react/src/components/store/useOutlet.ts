import { createWithEqualityFn } from "zustand/traditional";

export interface OutletFormState {
  formData: {
    placeId: string;
    placeUrl: string;
    billingStartTime: string;
    billingEndTime: string;
    brandName: string;
    branchName: string;
    url: string;
    _id?: string;
  };
  setEntireFormData: (data: Partial<OutletFormState["formData"]>) => void;
  setFormData: (key: keyof OutletFormState["formData"], value: string) => void;
}

export const useOutletFormStore = createWithEqualityFn<OutletFormState>(
  (set) => ({
    formData: {
      billingStartTime: "",
      billingEndTime: "",
      brandName: "",
      branchName: "",
      url: "",
      _id: "",
      placeId: "",
      placeUrl: "",
    },
    setFormData: (key: keyof OutletFormState["formData"], value: string) =>
      set((state) => ({
        formData: {
          ...state.formData,
          [key]: value,
        },
      })),
    setEntireFormData: (data: Partial<OutletFormState["formData"]>) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        },
      })),
  }),
);

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

export const useBusinessFormStore = createWithEqualityFn<BusinessFormState>(
  (set) => ({
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
  }),
);
