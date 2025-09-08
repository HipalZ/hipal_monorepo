import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useStaffLinking = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRpc.hotel.rooms.bulk.$put({
        json: data,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 201 || data.status === 200) {
        toast.success("Staff assigned successfully!");
        queryClient.invalidateQueries({ queryKey: ["getStaffs"] });
        queryClient.invalidateQueries({ queryKey: ["allRooms"] });
      }
    },
    onError: (error) => {
      console.error("Error assigning:", error);
    },
  });
  return {
    mutateAsync,
    isPending,
  };
};
