import useBusinessData from "@/components/store/useBusinessData";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type {
  ICustomerRecord,
  IUserGroup,
  SummarizedPeopleData,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useSummarizedPeopleData = (from: number, to: number) => {
  const businessData = useBusinessData((state) => state.businessData);
  const { setPeopleData, setOpenDatePickerModal } = useHiPeopleStore(
    (state) => ({
      setPeopleData: state.setPeopleData,
      setOpenDatePickerModal: state.setOpenDatePickerModal,
    }),
  );
  const getSummarizedPeopleData = useCallback(
    async (from: number, to: number) => {
      if (!businessData?._id) return [];
      const res = await apiRpc.payments.businessDashboard.$get({
        query: {
          businessId: businessData._id,
          from: from.toString(),
          to: to.toString(),
        },
      });

      const data = (await res.json()).data as SummarizedPeopleData;
      if (res.status === 400) {
        toast.error("Please select a valid date range");
        return [];
      }
      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized");
        return [];
      }
      if (res.status === 200 || res.status === 201) {
        setPeopleData(data);
        setOpenDatePickerModal(false);
        return data;
      }
    },
    [businessData?._id, from, to],
  );

  const { isLoading } = useQuery({
    queryKey: ["getSummarizedPeopleData", businessData?._id, from, to],
    queryFn: () => getSummarizedPeopleData(from, to),
    enabled: !!businessData?._id && !!from && !!to,
  });

  return { isLoading };
};

export const useGetAllPeoples = () => {
  const businessData = useBusinessData((state) => state.businessData);

  const getAllPeoples = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.payments.users.Analytics.$get({
      query: {
        businessId: businessData._id,
      },
    });

    const data = (await res.json()).data as ICustomerRecord[];
    if (res.status === 400) {
      toast.error("Please select a valid date range");
      return [];
    }
    if (res.status === 401 || res.status === 403) {
      toast.error("Unauthorized");
      return [];
    }
    if (res.status === 200 || res.status === 201) {
      return data;
    }
  }, [businessData?._id]);

  const { data: peopleData, isLoading } = useQuery({
    queryKey: ["getAllPeoples", businessData?._id],
    queryFn: getAllPeoples,
    enabled: !!businessData?._id,
  });

  return { peopleData, isLoading };
};

export const useGetGroupData = (enabled: boolean) => {
  const businessData = useBusinessData((state) => state.businessData);

  const getGroupData = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.groups.$get({
      query: {
        businessId: businessData._id,
      },
    });

    const data = (await res.json()).data as IUserGroup[];
    if (res.status === 400) {
      toast.error("No group data found");
      return [];
    }
    if (res.status === 401 || res.status === 403) {
      toast.error("Unauthorized");
      return [];
    }
    if (res.status === 200 || res.status === 201) {
      return data;
    }
  }, [businessData?._id]);

  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ["getGroupData", businessData?._id],
    queryFn: getGroupData,
    enabled: !!businessData?._id && enabled,
  });

  return { groupData, groupLoading };
};
export const useAddUserToGroup = () => {
  const { reset,clearAllUsers } = useHiPeopleStore((state) => ({
    reset: state.reset,
    clearAllUsers: state.clearAllUsers,
  }));

  const handleApiResponse = (data: any) => {
    if (data.err) {
      toast.error(data.message);
      return;
    }
    if (data) {
      toast.success("User added to group successfully");
      clearAllUsers()
      reset();
    }
  };

  const { mutateAsync: mutateAddUserToGroup, isPending: isAddingUserPending } =
    useMutation({
      mutationFn: async ({
        groupId,
        userIds,
      }: { groupId: string; userIds: string[] }) => {
        const res = await apiRpc.groups.addUsers.$post({
          json: {
            groupId,
            userIds,
          },
        });
        return res.json();
      },
      onSuccess: (data) => {
        handleApiResponse(data);
      },
    });

  return {
    mutateAddUserToGroup,
    isAddingUserPending,
  };
};
