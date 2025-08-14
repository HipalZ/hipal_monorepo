"use client";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";

interface data {
  name: string;
  email: string;
  address: string;
  profession: string;
  consent: boolean;
}

interface userCheckinPaylaod {
  userId: string;
  payload: data;
}
export const useSaveUserDetails = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: userCheckinPaylaod) => {
      const response = await apiRpc.users.updateUserInfo[":userId"].$put({
        param: { userId: payload.userId },
        json: payload.payload,
      });
      return response;
    },
    onSuccess: (data) => {
      console.log("User details fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Error fetching user details:", error);
    },
  });
  return {
    isPending,
    mutateAsync,
  };
};

export const useGetUserDetails = (userId: string) => {
  const user = async () => {
    const response = await apiRpc.users.user_profile[":userId"].$get({
      param: { userId },
    });
    const data = await response.json();
    const userDetails = data.data;
    return userDetails;
  };

  const { data, isLoading,refetch } = useQuery({
    queryKey: ["checkInUser", userId],
    queryFn: user,
    enabled: !!userId,
  });

  return { data, isLoading,refetch };
};
