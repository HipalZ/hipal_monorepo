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
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
}

export interface BusinessCategoryReport {
  businessId: string;
  businessName: string;
  categories: CategoryReport[];
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
      toast.error('Failed to fetch reports');
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
      link.setAttribute('download', fileName);
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

interface GetReportsPayload {
  from: string;
  to: string;
  businessIds: string[];
}

export interface ItemReport {
  categoryId: string;
  itemName: string;
  itemCount: number;
  quantity: number;
  amount: number;
  discount: number;
  tax: number;
}

export interface BusinessItemReport {
  businessId: string;
  form: string;
  to: string;
  businessName: string;
  items: ItemReport[];
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
      const itemsData = await handleEnvelope(response);
      if (!itemsData || !Array.isArray(itemsData)) {
        throw new Error('Invalid data format received');
      }
      setItemReports((itemsData as BusinessItemReport[]) || []);
      const totalItems = itemsData.reduce((acc, business) => acc + business.items.length, 0);
      toast.success(`Report generated successfully! Found ${totalItems} items.`);
      return response;
    },
    onError: (error) => {
      console.error('Report generation error:', error);
      setOpenErrorModal(true);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports. Please try again.');
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
          throw new Error('Empty file received');
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `item-reports-${fromStr}-to-${toStr}.xlsx`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(` file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error('Download error:', downloadError);
        toast.error('Failed to download CSV file');
      }
    },
    onError: (error) => {
      console.error('CSV generation error:', error);
      toast.error('Failed to generate CSV file. Please try again.');
    },
  });

  return {
    isPending,
    getItemReportsCsv: mutateAsync,
    resetError: reset,
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
        throw new Error('Invalid data format received');
      }
      setDiscountReports((discountData as BusinessDiscountReport[]) || []);
      const totalDiscounts = discountData.reduce((acc, business) => acc + business.discounts.length, 0);
      toast.success(`Report generated successfully! Found ${totalDiscounts} discount types.`);
      return response;
    },

    onError: (error) => {
      console.error('Report generation error:', error);
      setOpenErrorModal(true);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports. Please try again.');
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
          throw new Error('Empty file received');
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `discount-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error('Download error:', downloadError);
        toast.error('Failed to download CSV file');
      }
    },
    onError: (error) => {
      console.error('CSV generation error:', error);
      toast.error('Failed to generate CSV file. Please try again.');
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
        throw new Error('Invalid data format received');
      }
      setAddonReports((addonData as BusinessAddonReport[]) || []);
      const totalAddons = addonData.reduce((acc, business) => acc + business.addOns.length, 0);
      toast.success(`Report generated successfully! Found ${totalAddons} addon types.`);
      return response;
    },

    onError: (error) => {
      console.error('Report generation error:', error);
      setOpenErrorModal(true);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports. Please try again.');
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
          throw new Error('Empty file received');
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `addon-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error('Download error:', downloadError);
        toast.error('Failed to download CSV file');
      }
    },
    onError: (error) => {
      console.error('CSV generation error:', error);
      toast.error('Failed to generate CSV file. Please try again.');
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
        throw new Error('Invalid data format received');
      }
      setServiceChargeReports((serviceChargeData as ServiceChargeReport[]) || []);
      const totalServiceCharges = serviceChargeData.reduce((acc, business) => acc + business.serviceCharge, 0);
      toast.success(
        `Report generated successfully! Total service charge: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
          totalServiceCharges,
        )}.`,
      );
      return response;
    },

    onError: (error) => {
      console.error('Report generation error:', error);
      setOpenErrorModal(true);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports. Please try again.');
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
          throw new Error('Empty file received');
        }

        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        const fromStr = formatDate(Number(variables.from));
        const toStr = formatDate(Number(variables.to));
        const fileName = `service-charge-reports-${fromStr}-to-${toStr}.csv`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);

        toast.success(`CSV file "${fileName}" downloaded successfully!`);
      } catch (downloadError) {
        console.error('Download error:', downloadError);
        toast.error('Failed to download CSV file');
      }
    },
    onError: (error) => {
      console.error('CSV generation error:', error);
      toast.error('Failed to generate CSV file. Please try again.');
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
