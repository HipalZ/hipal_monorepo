import useBusinessData from "@/components/store/useBusinessData";
import type { CampaignSection } from "@/components/templates/events/birthdayCampaignPreview";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetEvents = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const getEvents = async () => {
    const response = await apiRpc.event.getevents.$get({
      query: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    return res.data;
  };

  const { isPending, data: campaignSections } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: !!businessId,
  });

  return { isPending, campaignSections };
};

export const usePutEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CampaignSection) => {
      const response = await apiRpc.event.updateevent.$put({
        json: {
          ...data,
          eventId: data._id,
        },
      });
      const res = await response.json();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const usePostEvents = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessData((s) => s.businessData?._id);

  return useMutation({
    mutationFn: async (data: CampaignSection) => {
      const response = await apiRpc.event.addevent.$post({
        json: {
          ...(data?._id && { _id: data._id }),
          title: data?.title,
          heading: data?.heading ?? "",
          description: data?.description ?? "",
          ...(data?.image && { image: data.image }),
          isActive: data?.isActive ?? false,
          businessId,
        },
      });
      const res = await response.json();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
