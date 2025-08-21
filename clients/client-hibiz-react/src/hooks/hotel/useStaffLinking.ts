import { apiRpc } from '@hi/common';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useStaffLinking = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRpc.hotel.rooms.bulk.$post({
        json: data,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 201 || data.status === 200) {
        toast.success('Staff assigned successfully!');
      }
    },
    onError: (error) => {
      console.error('Error assigning:', error);
    },
  });
  return {
    mutateAsync,
    isPending,
  };
};
