import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

export interface Tax {
  _id: number;
  name: string;
}

export const useGetAllTaxes = () => {
  const allTaxes = async () => {
    const response = await apiRpc.tax.tax_name.fetch_all.$get({});
    const data = await response.json();
    const allTaxesData = data.data as Tax[];
    return allTaxesData;
  };

  const { isLoading, data: taxes } = useQuery({
    queryKey: ["allTaxes"],
    queryFn: allTaxes,
  });

  return {
    isLoading,
    taxes,
  };
};

export type taxType = "PERCENTAGE" | "FIXED";
export interface TaxById {
  _id: number;
  name: string;
  businessId: string;
  menuId: string;
  isActive: boolean;
  value: number;
  type: taxType;
}

export const useFetchTaxesByBusiness = () => {
  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();

  const fetchTaxesByBusiness = async () => {
    if (!businessId || !menuId) return [];
    const response = await apiRpc.tax.$get({
      query: {
        businessId: businessId,
        menuId: menuId,
      },
    });
    const data = (await response.json()).data as TaxById[];
    return data;
  };

  const { isLoading, data: businessTaxes } = useQuery({
    queryKey: ["fetchTaxesByBusiness", businessId, menuId],
    queryFn: fetchTaxesByBusiness,
    enabled: !!businessId && !!menuId,
  });

  return {
    isLoading,
    businessTaxes,
  };
};

export interface createTaxPayload {
  name: string;
  value: number;
  type: taxType;
  businessId: string;
  menuId: string;
}

export const useCreateTax = () => {
  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();

  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: creatingTax, mutateAsync: createTax } = useMutation({
    mutationFn: async (payload: createTaxPayload) => {
      const response = await apiRpc.tax.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.error?.issues?.[0]?.message || "Unknown error");
        setOpenErrorModal(true);
        toast.error("Failed to create tax");
        return;
      }

      if (data.status === 201 || data.status === 200) {
        queryClient.invalidateQueries({
          queryKey: ["fetchTaxesByBusiness", businessId, menuId],
        });
        toast.success("Tax created successfully");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error creating tax");
      setOpenErrorModal(true);
      toast.error("Error creating tax");
    },
  });

  return {
    creatingTax,
    createTax,
  };
};

export interface updateTaxPayload {
  taxId: string;
  name?: string;
  value?: number;
  isActive?: boolean;
  type: taxType;
  menuId: string;
}

export const useUpdateTax = () => {
  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();

  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: updatingTax, mutateAsync: updateTax } = useMutation({
    mutationFn: async (payload: updateTaxPayload) => {
      const response = await apiRpc.tax.$put({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.error?.issues?.[0]?.message || "Unknown error");
        setOpenErrorModal(true);
        toast.error("Failed to update tax");
        return;
      }

      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["fetchTaxesByBusiness", businessId, menuId],
        });
        toast.success("Tax updated successfully");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error updating tax");
      setOpenErrorModal(true);
      toast.error("Error updating tax");
    },
  });

  return {
    updatingTax,
    updateTax,
  };
};

export interface LinkedOrUnlinkedDishesPayload {
  taxId: string;
  dishIds: string[];
}

export const useLinkedDishesToTax = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: linkingDishes, mutateAsync: linkDishes } = useMutation({
    mutationFn: async (payload: LinkedOrUnlinkedDishesPayload) => {
      const response = await apiRpc.tax.link_dishes.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(
          extraData?.error?.issues?.[0]?.message || "Failed to link dishes",
        );
        setOpenErrorModal(true);
        toast.error("Failed to link dishes");
        return;
      }

      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["getAllDishes"],
        });
        queryClient.invalidateQueries({
          queryKey: ["linkedDishes"],
        });
        toast.success("Dishes linked successfully");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error linking dishes");
      setOpenErrorModal(true);
      toast.error("Error linking dishes");
    },
  });

  return {
    linkingDishes,
    linkDishes,
  };
};

export const useUnlinkedDishesFromTax = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: unlinkingDishes, mutateAsync: unlinkDishes } = useMutation(
    {
      mutationFn: async (payload: LinkedOrUnlinkedDishesPayload) => {
        const response = await apiRpc.tax.unlink_dishes.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues?.[0]?.message || "Failed to link dishes",
          );
          setOpenErrorModal(true);
          toast.error("Failed to unlink dishes");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["getAllDishes"],
          });
          queryClient.invalidateQueries({
            queryKey: ["linkedDishes"],
          });
          toast.success("Dishes unlinked successfully");
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error unlinking dishes");
        setOpenErrorModal(true);
        toast.error("Error unlinking dishes");
      },
    },
  );

  return {
    unlinkingDishes,
    unlinkDishes,
  };
};
