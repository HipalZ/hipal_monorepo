import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface ICheckInQrs {
  _id: string;
  name: string;
  businessId: string;
  downloadLink: string;
  date: number;
  isDeleted: boolean;
}

export const useGetCheckInQrs = (businessId: string) => {
  const gettingQrCodes = async (businessId: string) => {
    const response = await apiRpc.qrs.check_in.$get({
      query: {
        businessId: businessId,
      },
    });
    const qrCodes: ICheckInQrs[] = (await response.json()).data || [];
    console.log("Check-in QR Codes:", qrCodes);
    return qrCodes as ICheckInQrs[];
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["check-in-qrs", businessId],
    queryFn: () => gettingQrCodes(businessId),
    enabled: !!businessId,
  });
  return {
    checkInQrs: data,
    isLoadingCheckInQrs: isLoading,
    refetchCheckInQrs: refetch,
  };
};

interface ICheckInPayload {
  name: string;
  businessId: string;
}

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError((state) => ({
    setError: state.setError,
    setOpenErrorModal: state.setOpenErrorModal,
  }));
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: ICheckInPayload) => {
      const response = await apiRpc.qrs.check_in.$post({
        json: {
          name: data.name,
          businessId: data.businessId,
        },
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Check-in QR creation failed");
        return console.error("Check-in QR creation failed");
      }

      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Check-in QR already exists");
        return console.error("Check-in QR already exists");
      }
      if (data.status === 403) {
        setOpenErrorModal(true);
        setError("You do not have permission to create a check-in QR");
        return console.error(
          "You do not have permission to create a check-in QR",
        );
      }
      if (data.status === 201 || data.status === 200) {
        toast.success("Check-in QR created successfully!");
        queryClient.invalidateQueries({
          queryKey: ["check-in-qrs", variables.businessId],
        });
      }
    },
    onError: (error) => {
      console.error("Error creating check-in QR:", error);
    },
  });
  return {
    createCheckIn: mutateAsync,
    isCreatingCheckIn: isPending,
  };
};

interface IUpdateCheckInPayload {
  _id: string;
  name: string;
}

export const useUpdateCheckIn = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError((state) => ({
    setError: state.setError,
    setOpenErrorModal: state.setOpenErrorModal,
  }));
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: IUpdateCheckInPayload) => {
      const response = await apiRpc.qrs.check_in[":qrId"].$put({
        param: {
          qrId: data._id,
        },
        json: {
          name: data.name,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Check-in QR update failed");
        return console.error("Check-in QR update failed");
      }

      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Check-in QR already exists");
        return console.error("Check-in QR already exists");
      }
      if (data.status === 403) {
        setOpenErrorModal(true);
        setError("You do not have permission to update a check-in QR");
        return console.error(
          "You do not have permission to update a check-in QR",
        );
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Check-in QR updated successfully!");
        queryClient.invalidateQueries({
          queryKey: ["check-in-qrs"],
        });
      }
    },
    onError: (error) => {
      console.error("Error updating check-in QR:", error);
    },
  });
  return {
    updateCheckIn: mutateAsync,
    isUpdatingCheckIn: isPending,
  };
};

export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError((state) => ({
    setError: state.setError,
    setOpenErrorModal: state.setOpenErrorModal,
  }));
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (qrId: string) => {
      const response = await apiRpc.qrs.check_in.$delete({
        json: {
          qrId: qrId,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Check-in QR deletion failed");
        return console.error("Check-in QR deletion failed");
      }

      if (data.status === 403) {
        setOpenErrorModal(true);
        setError("You do not have permission to delete a check-in QR");
        return console.error(
          "You do not have permission to delete a check-in QR",
        );
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Check-in QR deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: ["check-in-qrs"],
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting check-in QR:", error);
    },
  });
  return {
    deleteCheckIn: mutateAsync,
    isDeletingCheckIn: isPending,
  };
};

export interface ICheckInUsers {
  businessId: string;
  from?: string;
  to?: string;
  pageNumber?: string;
}

export interface ICheckInUserData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  date: number;
  qrId: string;
  businessId: string;
  code: string;
}

export const useFetchCheckInUsers = (data: ICheckInUsers) => {
  const response = useCallback(async (data: ICheckInUsers) => {
    const queryPayload = {
      businessId: data.businessId,
      from: data.from,
      to: data.to,
    };
    if (data.qrId) queryPayload.qrId = data.qrId;
    const res = await apiRpc.qrs.check_in_user.$get({
      query: queryPayload,
    });
    const checkInUsers: ICheckInUserData[] = (await res.json()).data || [];
    return checkInUsers;
  }, []);

  const { isLoading, data: checkInUsersData } = useQuery({
    queryKey: [
      "check-in-users",
      data.businessId,
      data.from,
      data.to,
      data.pageNumber,
    ],
    queryFn: () => response(data),
    enabled: !!data.businessId && !!data.from && !!data.to,
  });

  return {
    checkInUsers: checkInUsersData,
    isLoadingCheckInUsers: isLoading,
  };
};

export const useGetCHeckIn = () => {
  const businessId = useParams().businessId;

  const getCheckin = async () => {
    const response = await apiRpc.qrs.check_in.$get({
      query: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    return res.data;
  };

  const { isLoading: gettingCheckInQrs, data: checkInQrsData } = useQuery({
    queryKey: ["check-in-qr", businessId],
    queryFn: getCheckin,
    enabled: !!businessId,
  });
  return { gettingCheckInQrs, checkInQrsData };
};

interface ICheckInCsvPayload {
  businessId: string;
  from?: string;
  to?: string;
  qrId?: string;
}

export const useDownloadCheckInCsv = () => {
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: ICheckInCsvPayload) => {
      const newPayload = {
        businessId: payload.businessId,
        from: payload.from,
        to: payload.to,
        ...(payload.qrId ? { qrId: payload.qrId } : {}),
      };
      const response = await apiRpc.qrs.check_in_user.download_csv.$get({
        query: newPayload,
      });
      return response.blob();
    },
    onSuccess: async (blob, variables) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      const fromStr = formatDate(Number(variables.from));
      const toStr = formatDate(Number(variables.to));
      const fileName = `checkin_users_${fromStr}_to_${toStr}.csv`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully!");
    },
    onError: (error) => {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV file");
    },
  });

  return {
    downloadCheckInCsv: mutateAsync,
    isDownloadingCsv: isPending,
  };
};
