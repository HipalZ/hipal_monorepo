import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useReports from "@/components/store/useReports.ts";
import { formatDate } from "@/components/utils/helper.ts";
import { useApiErrorHandler } from "./useApiErrorHandler.ts";
import { formatDateToIST } from "@hipal/server/src/utils/reportHelper/dateFormater.ts";

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryCount: number;
  itemCount?: number;
  /** Gross amount (before discount) */
  totalAmount: number;
  totalDiscount: number;
  gst?: number;
  serviceCharge?: number;
  /** Total tax (GST + service charge) */
  totalTax: number;
  /** Final total (reconciles with Sales) — use for Net Revenue */
  totalSales?: number;
}

export interface BusinessCategoryReport {
  businessId: string;
  businessName: string;
  categories: CategoryReport[];
}

export interface ParentCategoryReportRow {
  parentCategoryId: string;
  parentCategoryName: string;
  itemCount: number;
  grossAmount: number;
  discount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number;
  finalAmount: number;
  children?: { categoryName: string; finalAmount: number; itemCount: number }[];
}

export interface BusinessParentCategoryReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  parentCategories: ParentCategoryReportRow[];
  childCategoryTotals?: unknown[];
  sumItemFinalAmount: number;
  sumParentFinalAmount: number;
  validationPassed: boolean;
  validationMessage?: string;
}

export const useCategoryReports = () => {
  const setCategoryReports = useReports((s) => s.setCategoryReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.category.$post({
        json: payload,
      });
      const categoryData = await handleEnvelope(response);
      setCategoryReports((categoryData as BusinessCategoryReport[]) || []);
      return response;
    },

    onError: (data) => {
      console.log(data);
      toast.error("Failed to fetch reports");
    },
  });

  return {
    isPending,
    getCategoryReports: mutateAsync,
    clearReportData: () => setCategoryReports([]),
  };
};

export const useGetReportsXlsx = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.category.download_xlsx.$post({
        json: payload,
      });
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fromStr = formatDate(Number(variables.from));
      const toStr = formatDate(Number(variables.to));
      const fileName = `category reports ${fromStr} to ${toStr}.xlsx`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return { isPending, getReportsXlsx: mutateAsync };
};

export const useParentCategoryReports = () => {
  const setParentCategoryReports = useReports((s) => s.setParentCategoryReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload & { includeChildBreakdown?: boolean }) => {
      const response = await apiRpc.report.parent_category.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
          includeChildBreakdown: payload.includeChildBreakdown ?? true,
        },
      });
      const data = await handleEnvelope(response);
      setParentCategoryReports((data as BusinessParentCategoryReport[]) || []);
      return response;
    },
    onError: () => {
      toast.error("Failed to fetch parent category reports");
    },
  });
  return {
    isPending,
    getParentCategoryReports: mutateAsync,
    clearReportData: () => setParentCategoryReports([]),
  };
};

export const useGetParentCategoryReportsXlsx = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.parent_category.download_xlsx.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fromStr = formatDate(Number(variables.from));
      const toStr = formatDate(Number(variables.to));
      const fileName = `Parent Category Reports ${fromStr} to ${toStr}.xlsx`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Failed to download parent category report");
    },
  });
  return { isPending, getParentCategoryReportsXlsx: mutateAsync };
};

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export type ItemReportMode = "zone" | "kitchen";

export interface ItemReport {
  categoryId: string;
  itemName: string;
  itemCount: number;
  quantity: number;
  /** Net amount (after discount, before tax) */
  amount: number;
  discount: number;
  /** GST only */
  gst?: number;
  /** Allocated service charge */
  serviceCharge?: number;
  /** Total tax (GST + service charge) */
  tax: number;
  /** Final total (net + GST + service charge) — use for Net Revenue to reconcile with Sales */
  totalSales?: number;
  /** When reportMode === 'zone': area(s) where dish was ordered */
  zoneNames?: string[];
  /** When reportMode === 'kitchen': kitchen id and name */
  kitchenId?: string;
  kitchenName?: string;
}

export interface BusinessItemReport {
  businessId: string;
  /** Date range start (API sends `from`) */
  from: string;
  to: string;
  businessName: string;
  /** 'zone' = zone-wise (dish + area); 'kitchen' = kitchen-wise (dish per kitchen) */
  reportMode?: ItemReportMode;
  items: ItemReport[];
}

/** Item row from item-by-section API (section-scoped). */
export interface ItemBySectionRow {
  itemName: string;
  categoryId: string;
  itemCount: number;
  amount: number;
  discount: number;
  tax: number;
  totalSales: number;
}

/** One section (zone or kitchen) with items. */
export interface ItemBySectionSection {
  sectionId: string;
  sectionName: string;
  items: ItemBySectionRow[];
}

/** Per-business response from item-by-section API. */
export interface BusinessItemBySectionReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  reportFlow: "zone" | "kitchen";
  sections: ItemBySectionSection[];
}

export const useItemReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setItemReports = useReports((s) => s.setItemReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item.$post({
        json: payload,
      });
      const raw = await handleEnvelope(response);
      if (!raw || !Array.isArray(raw)) {
        throw new Error("Invalid data format received");
      }
      const itemsData = (raw as Record<string, unknown>[]).map(
        (b): BusinessItemReport => ({
          businessId: String(b.businessId ?? ""),
          from: String(b.from ?? (b as { form?: string }).form ?? ""),
          to: String(b.to ?? ""),
          businessName: String(b.businessName ?? "Unknown"),
          reportMode: (b.reportMode === "zone" || b.reportMode === "kitchen" ? b.reportMode : undefined) as ItemReportMode | undefined,
          items: Array.isArray(b.items)
            ? (b.items as Record<string, unknown>[]).map((it) => ({
                categoryId: String(it.categoryId ?? ""),
                itemName: String(it.itemName ?? ""),
                itemCount: Number(it.itemCount ?? 0),
                quantity: Number(it.quantity ?? it.itemCount ?? 0),
                amount: Number(it.amount ?? 0),
                discount: Number(it.discount ?? 0),
                gst: it.gst != null ? Number(it.gst) : undefined,
                serviceCharge: it.serviceCharge != null ? Number(it.serviceCharge) : undefined,
                tax: Number(it.tax ?? 0),
                totalSales: it.totalSales != null ? Number(it.totalSales) : undefined,
                zoneNames: Array.isArray(it.zoneNames) ? (it.zoneNames as string[]) : undefined,
                kitchenId: it.kitchenId != null ? String(it.kitchenId) : undefined,
                kitchenName: it.kitchenName != null ? String(it.kitchenName) : undefined,
              })) as ItemReport[]
            : [],
        }),
      );
      setItemReports(itemsData);
      const totalItems = itemsData.reduce(
        (acc, business) => acc + business.items.length,
        0,
      );
      toast.success(
        `Report generated successfully! Found ${totalItems} items.`,
      );
      return response;
    },
    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getItemReports: mutateAsync,
    clearReportData: () => setItemReports([]),
    resetError: reset,
  };
};

export const useGetItemReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item.download_csv.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `item-reports-${fromStr}-to-${toStr}.xlsx`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(` file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download CSV file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate CSV file. Please try again.");
    },
  });

  return {
    isPending,
    getItemReportsCsv: mutateAsync,
    resetError: reset,
  };
};

export const useItemBySectionReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setItemBySectionReports = useReports((s) => s.setItemBySectionReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item_by_section.$post({
        json: payload,
      });
      const raw = await handleEnvelope(response);
      if (!raw || !Array.isArray(raw)) {
        throw new Error("Invalid data format received");
      }
      const data = (raw as Record<string, unknown>[]).map(
        (b): BusinessItemBySectionReport => ({
          businessId: String(b.businessId ?? ""),
          from: String(b.from ?? (b as { form?: string }).form ?? ""),
          to: String(b.to ?? ""),
          businessName: String(b.businessName ?? "Unknown"),
          reportFlow:
            b.reportFlow === "zone" || b.reportFlow === "kitchen"
              ? b.reportFlow
              : "kitchen",
          sections: Array.isArray(b.sections)
            ? (b.sections as Record<string, unknown>[]).map((sec) => ({
                sectionId: String(sec.sectionId ?? ""),
                sectionName: String(sec.sectionName ?? ""),
                items: Array.isArray(sec.items)
                  ? (sec.items as Record<string, unknown>[]).map((it) => ({
                      itemName: String(it.itemName ?? ""),
                      categoryId: String(it.categoryId ?? ""),
                      itemCount: Number(it.itemCount ?? 0),
                      amount: Number(it.amount ?? 0),
                      discount: Number(it.discount ?? 0),
                      tax: Number(it.tax ?? 0),
                      totalSales: Number(it.totalSales ?? 0),
                    }))
                  : [],
              }))
            : [],
        }),
      );
      setItemBySectionReports(data);
      const totalSections = data.reduce(
        (acc, business) => acc + business.sections.length,
        0,
      );
      toast.success(
        `Item by section report generated! ${totalSections} section(s).`,
      );
      return response;
    },
    onError: (error) => {
      console.error("Item by section report error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch item by section report. Please try again.");
      toast.error("Failed to fetch report. Please try again.");
    },
  });

  return {
    isPending,
    getItemBySectionReports: mutateAsync,
    clearReportData: () => setItemBySectionReports([]),
    resetError: reset,
  };
};

export const useGetItemBySectionReportsExcel = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item_by_section.download_xlsx.$post({
        json: payload,
      });
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fromStr = formatDate(Number(variables.from));
      const toStr = formatDate(Number(variables.to));
      const fileName = `item-by-areas ${fromStr} to ${toStr}.xlsx`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Item by Areas Excel downloaded.");
    },
    onError: () => {
      toast.error("Failed to download Item by Areas Excel.");
    },
  });
  return { isPending: isPending, getItemBySectionReportsExcel: mutateAsync };
};

/** Consolidated report block (per-business) - matches server ConsolidatedBusinessBlock */
export interface ConsolidatedBusinessBlock {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  summary: {
    netSale: number;
    grossSale: number;
    totalOrdersPaid: number;
    duesGetBack: number;
    pendingDuesSubtotal: number;
  };
  parentCategories: Array<{
    parentCategoryName: string;
    subTotal: number;
    discount: number;
    netAmount: number;
    tax: number;
    grossAmount: number;
  }>;
  categories: Array<{
    categoryName: string;
    subTotal: number;
    discountAmount: number;
    netAmount: number;
    tax: number;
    grossAmount: number;
  }>;
  paymentTypes: Array<{
    paymentType: string;
    amount: number;
    totalBills: number;
  }>;
  duesSettlement: Array<{
    paymentType: string;
    duesGetBackAmount: number;
    totalBills: number;
  }>;
  dues: {
    totalDues: number;
    totalDuesGetBack: number;
    duesOrdersCount: number;
  };
  complimentaryDiscounts: {
    totalComplementary: number;
    totalDiscountsAll: number;
  };
  tips: Array<{
    paymentType: string;
    amount: number;
    totalBills: number;
  }>;
}

export const useConsolidateReports = () => {
  const setConsolidateReports = useReports((s) => s.setConsolidateReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.consolidate.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });
      const data = await handleEnvelope(response);
      setConsolidateReports((data as ConsolidatedBusinessBlock[]) || []);
      toast.success("Consolidated report loaded.");
      return response;
    },
    onError: () => {
      toast.error("Failed to fetch consolidated report");
    },
  });
  return {
    isPending,
    getConsolidateReports: mutateAsync,
    clearReportData: () => setConsolidateReports([]),
  };
};

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface DiscountReport {
  discountName: string;
  discountCount: number;
  amount: number;
}

export interface BusinessDiscountReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  discounts: DiscountReport[];
}

export const useDiscountReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setDiscountReports = useReports((s) => s.setDiscountReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.discount.$post({
        json: payload,
      });
      const discountData = await handleEnvelope(response);
      if (!discountData || !Array.isArray(discountData)) {
        throw new Error("Invalid data format received");
      }
      setDiscountReports((discountData as BusinessDiscountReport[]) || []);
      const totalDiscounts = discountData.reduce(
        (acc, business) => acc + business.discounts.length,
        0,
      );
      toast.success(
        `Report generated successfully! Found ${totalDiscounts} discount types.`,
      );
      return response;
    },

    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getDiscountReports: mutateAsync,
    clearReportData: () => setDiscountReports([]),
    resetError: reset,
  };
};

export const useGetDiscountReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.discount.download_csv.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `discount-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download CSV file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate CSV file. Please try again.");
    },
  });

  return {
    isPending,
    getDiscountReportsCsv: mutateAsync,
    resetError: reset,
  };
};

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface AddonReport {
  addOnName: string;
  addOnCount: number;
  quantity: number;
  amount: number;
  totalSales: number;
}

export interface BusinessAddonReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  addOns: AddonReport[];
}

export const useAddonReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setAddonReports = useReports((s) => s.setAddonReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.add_on.$post({
        json: payload,
      });
      const addonData = await handleEnvelope(response);
      if (!addonData || !Array.isArray(addonData)) {
        throw new Error("Invalid data format received");
      }
      setAddonReports((addonData as BusinessAddonReport[]) || []);
      const totalAddons = addonData.reduce(
        (acc, business) => acc + business.addOns.length,
        0,
      );
      toast.success(
        `Report generated successfully! Found ${totalAddons} addon types.`,
      );
      return response;
    },

    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getAddonReports: mutateAsync,
    clearReportData: () => setAddonReports([]),
    resetError: reset,
  };
};

export const useGetAddonReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.add_on.download_csv.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `addon-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download CSV file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate CSV file. Please try again.");
    },
  });

  return {
    isPending,
    getAddonReportsCsv: mutateAsync,
    resetError: reset,
  };
};

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface ServiceChargeReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  serviceCharge: number;
}

export const useServiceChargeReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setServiceChargeReports = useReports((s) => s.setServiceChargeReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.service_charge.$post({
        json: payload,
      });
      const serviceChargeData = await handleEnvelope(response);

      if (!serviceChargeData || !Array.isArray(serviceChargeData)) {
        throw new Error("Invalid data format received");
      }
      setServiceChargeReports(
        (serviceChargeData as ServiceChargeReport[]) || [],
      );
      const totalServiceCharges = serviceChargeData.reduce(
        (acc, business) => acc + business.serviceCharge,
        0,
      );
      toast.success(
        `Report generated successfully! Total service charge: ${new Intl.NumberFormat(
          "en-IN",
          { style: "currency", currency: "INR" },
        ).format(totalServiceCharges)}.`,
      );
      return response;
    },

    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getServiceChargeReports: mutateAsync,
    clearReportData: () => setServiceChargeReports([]),
    resetError: reset,
  };
};

export const useGetServiceChargeReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.service_charge.download_csv.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `service-charge-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download CSV file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate CSV file. Please try again.");
    },
  });

  return {
    isPending,
    getServiceChargeReportsCsv: mutateAsync,
    resetError: reset,
  };
};

type GetReportsCombinedPayload = {
  businessIds: (string | undefined)[];
  from: number;
  to: number;
};

export const useDownloadUnifiedExcel = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetReportsCombinedPayload) => {
      // 👇 update this path to match your backend route binding
      const response = await apiRpc.report.combine.$post({
        json: {
          businessIds: payload.businessIds,
          from: payload.from,
          to: payload.to,
        },
      });

      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);

      const fromStr = formatDateToIST(Number(variables.from));
      const toStr = formatDateToIST(Number(variables.to));
      const fileName = `Combine reports ${fromStr} to ${toStr}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Excel download failed", error);
    },
  });

  return {
    isPendingExcel: isPending,
    downloadUnifiedExcel: mutateAsync,
  };
};

// src/hooks/useDeletedItemsReport.ts
import { useState } from "react";

export type DeletedItemRow = {
  businessId: string;
  businessName: string;
  kotId: string;
  kotInvoiceNumber: number | null;
  kotDate: number;
  tableName: string;
  waiterName: string;
  customerPhone: string;
  itemKey: string;
  dishName: string;
  portionName: string;
  extrasSummary: string;
  quantity: number;
  rate: number;
  amount: number;
  isOpenItem: boolean;
  deletedBy: string;
  reasonOfDeletion: string;
};

export type DeletedItemSummaryRow = {
  businessId: string;
  businessName: string;
  itemKey: string;
  dishName: string;
  portionName: string;
  extrasSummary: string;
  deleteCount: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  deletedByList: string[];
  reasons: string[];
};

type DeletedItemsApiResponse = {
  rows: DeletedItemRow[];
  summary: DeletedItemSummaryRow[];
};

export type GetDeletedItemsPayload = {
  businessIds: string[];
  from: number;
  to: number;
};

export const useGetDeletedItems = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItemRow[]>([]);
  const [deletedItemsSummary, setDeletedItemsSummary] = useState<
    DeletedItemSummaryRow[]
  >([]);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetDeletedItemsPayload) => {
      // Adjust this path if your client name differs
      const response = await apiRpc.report.deleted_items.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deleted items");
      }

      const json = (await response.json()) as {
        err: boolean;
        data: DeletedItemsApiResponse;
        message?: string;
      };

      if (json.err) {
        throw new Error(json.message || "Failed to fetch deleted items");
      }

      return json.data;
    },
    onSuccess: (data) => {
      setDeletedItems(data.rows ?? []);
      setDeletedItemsSummary(data.summary ?? []);
    },
  });

  return {
    isPending,
    deletedItems,
    deletedItemsSummary,
    getDeletedItems: mutateAsync,
  };
};

export const useDownloadDeletedItemsXlsx = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: GetDeletedItemsPayload) => {
      const response = await apiRpc.report.deleted_items.download_xlsx.$post({
        json: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to download deleted items XLSX");
      }

      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const fromStr = new Date(variables.from).toLocaleDateString("en-IN");
      const toStr = new Date(variables.to).toLocaleDateString("en-IN");
      const fileName = `Deleted Items Summary ${fromStr} to ${toStr}.xlsx`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (err) => {
      console.error("Failed to download deleted items XLSX", err);
    },
  });

  return {
    isPending,
    downloadDeletedItemsXlsx: mutateAsync,
  };
};

// Dish Type Report (VEG/NON_VEG/etc.)
interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface DishTypeReport {
  type: string;              // VEG, NON_VEG, EGG, JAIN, etc.
  itemCount: number;         // total quantity sold
  grossAmount: number;      // before discount
  discount: number;
  gst: number;               // GST only
  serviceCharge: number;     // allocated service charge
  tax: number;               // total tax (GST + service charge)
  netSales: number;          // final revenue
}

export interface BusinessDishTypeReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  dishTypes: DishTypeReport[];
}

export interface ItemVariantReport {
  itemName: string;
  dishId: string;
  portionName: string;
  portionId: string | null;
  itemCount: number;
  grossAmount: number;
  discount: number;
  tax: number;
  netSales: number;
}

export interface BusinessItemVariantReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  itemVariants: ItemVariantReport[];
}

export const useDishTypeReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setDishTypeReports = useReports((s) => s.setDishTypeReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      // Convert string timestamps to numbers for API
      const response = await apiRpc.report.item["dish-type"].$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });
      const dishTypeData = await handleEnvelope(response);
      if (!dishTypeData || !Array.isArray(dishTypeData)) {
        throw new Error("Invalid data format received");
      }
      setDishTypeReports((dishTypeData as BusinessDishTypeReport[]) || []);
      const totalTypes = dishTypeData.reduce(
        (acc, business) => acc + business.dishTypes.length,
        0,
      );
      toast.success(
        `Report generated successfully! Found ${totalTypes} dish type${totalTypes !== 1 ? 's' : ''}.`,
      );
      return response;
    },

    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getDishTypeReports: mutateAsync,
    clearReportData: () => setDishTypeReports([]),
    resetError: reset,
  };
};

export const useGetDishTypeReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      // Use the dedicated dish type download endpoint
      const response = await apiRpc.report.item.download_csv_dish_type.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDateToIST(Number(variables.from));
        const toStr = formatDateToIST(Number(variables.to));
        const fileName = `Dish Type Reports ${fromStr} to ${toStr}.xlsx`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`File "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate file. Please try again.");
    },
  });

  return {
    isPending,
    getDishTypeReportsCsv: mutateAsync,
    resetError: reset,
  };
};

export const useItemVariantReports = () => {
  const { setError, setOpenErrorModal } = useError();
  const setItemVariantReports = useReports((s) => s.setItemVariantReports);
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item_variant.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });
      const itemVariantData = await handleEnvelope(response);
      if (!itemVariantData || !Array.isArray(itemVariantData)) {
        throw new Error("Invalid data format received");
      }
      setItemVariantReports((itemVariantData as BusinessItemVariantReport[]) || []);
      const totalVariants = itemVariantData.reduce(
        (acc, business) => acc + business.itemVariants.length,
        0,
      );
      toast.success(
        `Report generated successfully! Found ${totalVariants} item variant${totalVariants !== 1 ? 's' : ''}.`,
      );
      return response;
    },
    onError: (error) => {
      console.error("Report generation error:", error);
      setOpenErrorModal(true);
      setError("Failed to fetch reports. Please try again.");
      toast.error("Failed to fetch reports. Please try again.");
    },
  });

  return {
    isPending,
    getItemVariantReports: mutateAsync,
    clearReportData: () => setItemVariantReports([]),
    resetError: reset,
  };
};

export const useGetItemVariantReportsCsv = () => {
  const { isPending, mutateAsync, reset } = useMutation({
    mutationFn: async (payload: GetReportsPayload) => {
      const response = await apiRpc.report.item_variant.download_xlsx.$post({
        json: {
          businessIds: payload.businessIds,
          from: Number(payload.from),
          to: Number(payload.to),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      try {
        if (!blob || blob.size === 0) {
          throw new Error("Empty file received");
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        const fromStr = formatDateToIST(Number(variables.from));
        const toStr = formatDateToIST(Number(variables.to));
        const fileName = `Item Variant Reports ${fromStr} to ${toStr}.xlsx`;

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`File "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download file");
      }
    },
    onError: (error) => {
      console.error("CSV generation error:", error);
      toast.error("Failed to generate file. Please try again.");
    },
  });

  return {
    isPending,
    getItemVariantReportsCsv: mutateAsync,
    resetError: reset,
  };
};