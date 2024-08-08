import useBusinessData from "@/components/store/useBusinessData";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import usePaginationStore from "@/components/store/usePaginationStore";
import type {
  ILoyaltyData,
  INotes,
  TagArray,
  UserDashboardDetails,
  UserTags,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export const useUserDashboard = (userId: string) => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setUserDashboardDetails, selectedNavItem, dateInTimeStamp } =
    useHiPeopleStore((s) => ({
      setUserDashboardDetails: s.setUserDashboardDetails,
      selectedNavItem: s.selectedNavItem,
      dateInTimeStamp: s.dateInTimeStamp,
    }));
  const { pageNumber, setDateLength } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
    setDateLength: s.setDateLength,
  }));

  const getAllUserDashboardData = async (businessId: string) => {
    const userDashboardResponse = await apiRpc.payments.userDashboard.$get({
      query: {
        businessId: businessId,
        userId: userId,
        pageNumber: pageNumber.toString(),
        from: dateInTimeStamp?.from?.toString(),
        to: dateInTimeStamp?.to.toString(),
      },
    });
    const data = await userDashboardResponse.json();
    setUserDashboardDetails(data?.data as UserDashboardDetails);
    setDateLength(data?.data?.bill?.length);
    return data?.data as UserDashboardDetails;
  };

  const { data, isLoading, isError } = useQuery<UserDashboardDetails>({
    queryKey: [
      "userDashboard",
      businessId,
      userId,
      dateInTimeStamp?.from,
      dateInTimeStamp?.to,
      pageNumber,
    ],
    queryFn: () => getAllUserDashboardData(businessId ?? ""),
    enabled:
      !!businessId &&
      !!userId &&
      !!dateInTimeStamp?.from &&
      !!dateInTimeStamp?.to &&
      !!pageNumber &&
      selectedNavItem === "RECENT BILLS",
  });

  return { data, isLoading, isError };
};

export const useTagsNotes = () => {
  const { businessId, userId } = useParams<{
    businessId?: string;
    userId?: string;
  }>();

  const { setDateLength } = usePaginationStore((s) => ({
    setDateLength: s.setDateLength,
  }));

  const { setTagData, selectedNavItem, tagData } = useHiPeopleStore((s) => ({
    setTagData: s.setTagData,
    tagData: s.tagData,
    selectedNavItem: s.selectedNavItem,
  }));

  const getAllUserTags = async (businessId: string, userId: string) => {
    const userTagsResponse = await apiRpc.payments.tagAndNotes.$get({
      query: {
        businessId: businessId,
        userId: userId,
      },
    });
    const data = await userTagsResponse.json();
    setTagData(data?.data as TagArray[]);
    setDateLength(data?.data?.length);
    return data?.data;
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userTags", businessId, userId],
    queryFn: () => getAllUserTags(businessId ?? "", userId ?? ""),
    enabled: !!businessId && !!userId && selectedNavItem === "TAGS & NOTES",
  });

  return { data, isLoading, isError };
};

export const useGetUserNotes = () => {
  const { businessId, userId } = useParams<{
    businessId?: string;
    userId?: string;
  }>();

  const getAllNotes = async () => {
    const userNotesResponse = await apiRpc.tags.note[":businessId"][
      ":userId"
    ].$get({
      param: {
        businessId: businessId,
        userId: userId,
      },
    });
    const data = await userNotesResponse.json();
    return data?.data as INotes[];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userNotes", businessId, userId],
    queryFn: getAllNotes,
    enabled: !!businessId && !!userId,
  });

  return { data, isLoading, isError };
};

export const userCoinzDetails = () => {
  const { businessId, userId } = useParams<{
    businessId?: string;
    userId?: string;
  }>();

  const { pageNumber, setDateLength } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
    setDateLength: s.setDateLength,
  }));

  const { existingLoyalty } = useBusinessData((s) => ({
    existingLoyalty: s.existingLoyalty,
  }));

  const { setUserCoinzDetails, selectedNavItem, dateInTimeStamp } =
    useHiPeopleStore((s) => ({
      setUserCoinzDetails: s.setUserCoinzDetails,
      selectedNavItem: s.selectedNavItem,
      dateInTimeStamp: s.dateInTimeStamp,
    }));

  const getUserCoinz = async (businessId: string) => {
    const userCoinzResponse = await apiRpc.payments.user.coinsUsage.$get({
      query: {
        businessId: businessId,
        userId: userId?.toString(),
        loyaltyId: existingLoyalty?.loyaltyId,
        from: dateInTimeStamp?.from?.toString(),
        to: dateInTimeStamp?.to?.toString(),
        pageNumber: pageNumber.toString(),
      },
    });
    const data = await userCoinzResponse.json();
    setUserCoinzDetails(data?.data);
    setDateLength(Object.keys(data?.data)?.length);
    return data?.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "userCoinz",
      businessId,
      userId,
      dateInTimeStamp?.from,
      dateInTimeStamp?.to,
      pageNumber,
      selectedNavItem,
    ],
    queryFn: () => getUserCoinz(businessId ?? ""),
    enabled:
      !!businessId &&
      !!userId &&
      !!dateInTimeStamp?.from &&
      !!dateInTimeStamp?.to &&
      !!pageNumber &&
      selectedNavItem === "COINZ USAGE",
  });

  return { data, isLoading, isError };
};

// updating the user tags comments and adding tagIds
export const useUserUpdateTags = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { singleBillData, setOpenBillPopup, setIsLoading } = useHiPeopleStore(
    (s) => ({
      singleBillData: s.singleBillData,
      setOpenBillPopup: s.setOpenBillPopup,
      setIsLoading: s.setIsLoading,
    }),
  );
  setIsLoading(true);
  const updateUserTags = async (tags: string[]) => {
    const userTagsResponse = await apiRpc.payments.updatePayment[
      ":paymentId"
    ].$put({
      query: {
        businessId: businessId,
      },
      param: {
        paymentId: singleBillData?._id,
      },
      json: {
        businessId: businessId || "",
        tagIds: tags
          .filter((tag) => tag?._id?.toString())
          .map((tag) => tag?._id?.toString()),
        userId: singleBillData.userId.toString(),
        comment: singleBillData.comment,
      },
    });
    const data = await userTagsResponse.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: updateUserTags,
    onSuccess: () => {
      setOpenBillPopup(false);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error updating user tags:", error);
      setIsLoading(false);
    },
  });

  return mutation;
};

// updating the userPayment Tags, notes
export const useUserPaymentTags = () => {
  const queryClient = useQueryClient();
  const {
    setOpenEditTagPopup,
    openEditTagPopup,
    setTagNotes,
    setRemainder,
    setDuration,
    setTime,
    setDisplayToCaptain,
  } = useHiPeopleStore((s) => ({
    setOpenEditTagPopup: s.setOpenEditTagPopup,
    openEditTagPopup: s.openEditTagPopup,
    setTagNotes: s.setTagNotes,
    setRemainder: s.setRemainder,
    setDuration: s.setDuration,
    setTime: s.setTime,
    setDisplayToCaptain: s.setDisplayToCaptain,
  }));
  const updateUserPaymentTags = async (payload) => {
    const userTagsResponse = await apiRpc.tags.update[":userId"].$put({
      json: payload,
      param: {
        tagId: payload?.tagId,
        userId: payload?.userId,
      },
    });
    const data = await userTagsResponse.json();
    return data?.data;
  };
  const mutation = useMutation({
    mutationFn: updateUserPaymentTags,
    onSuccess: () => {
      toast.success("Tag updated successfully");
      setOpenEditTagPopup(!openEditTagPopup);
      setTagNotes("");
      setRemainder("");
      setDuration("");
      setTime("");
      setDisplayToCaptain(false);
      queryClient.invalidateQueries({});
    },
    onError: (error) => {
      console.error("Error updating user tags:", error);
    },
  });
  return mutation;
};

// for getting loyalty id for using in one api
export const useLoyaltyData = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setExistingLoyalty, setIsLoyaltyExists } = useBusinessData((s) => ({
    setExistingLoyalty: s.setExistingLoyalty,
    setIsLoyaltyExists: s.setIsLoyaltyExists,
  }));
  const getLoyaltyData = async (businessId: string) => {
    const response = await apiRpc.businesses[":businessId"].loyalty.$get({
      param: {
        businessId: businessId,
      },
    });
    const data = await response.json();
    setExistingLoyalty(data?.data as ILoyaltyData);
    const isData = Object.keys(data?.data).length > 0;
    setIsLoyaltyExists(isData);
    return data?.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["loyaltyData", businessId],
    queryFn: () => getLoyaltyData(businessId ?? ""),
    enabled: !!businessId,
  });

  return { data, isLoading, isError };
};

// get all tags in displaying list of tags
export const useAllTags = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setTags, tags } = useHiPeopleStore((s) => ({
    setTags: s.setTags,
    tags: s.tags,
  }));
  const getAllTags = async (businessId: string) => {
    const response = await apiRpc.tags.$get({
      query: {
        businessId: businessId,
      },
    });
    const data = await response.json();
    setTags(data?.data as UserTags[]);
    return data?.data as UserTags[];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["allTags", businessId],
    queryFn: () => getAllTags(businessId ?? ""),
    enabled: !!businessId && tags?.length === 0,
  });

  return { data, isLoading, isError };
};

// removing tag from user
export const useRemoveTag = () => {
  const { userId } = useParams<{ userId?: string }>();
  const selectedDeleteTagId = useHiPeopleStore((s) => s.selectedDeleteTagId);
  const queryClient = useQueryClient();

  const deleteTag = async () => {
    const response = await apiRpc.tags[":tagId"][":userId"].$delete({
      param: {
        tagId: selectedDeleteTagId,
        userId: userId || selectedDeleteTagId,
      },
    });
    const data = await response.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allTags"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userTags"],
      });
    },
    onError: (error) => {
      console.error("Error deleting tag:", error);
    },
  });

  return mutation;
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const {
    setOpenCreateTagPopup,
    setTagName,
    setTagNotes,
    setDisplayToCaptain,
    setDuration,
    setTime,
    setRemainder,
    setHistory,
    setSingleTagData,
  } = useHiPeopleStore((s) => ({
    setOpenCreateTagPopup: s.setOpenCreateTagPopup,
    setTagName: s.setTagName,
    setTagNotes: s.setTagNotes,
    setDisplayToCaptain: s.setDisplayToCaptain,
    setDuration: s.setDuration,
    setTime: s.setTime,
    setRemainder: s.setRemainder,
    setHistory: s.setHistory,
    setSingleTagData: s.setSingleTagData,
  }));
  const createTag = async (payload) => {
    const response = await apiRpc.tags.$post({
      json: payload,
    });
    const data = await response.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      toast.success("Tag created successfully");
      setOpenCreateTagPopup(false);
      setTagName("");
      setTagNotes("");
      setDisplayToCaptain(false);
      setDuration("");
      setTime("");
      setRemainder("");
      setHistory([]);
      setSingleTagData({});
      queryClient.invalidateQueries({
        queryKey: ["allTags"],
      });
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
    },
  });

  return mutation;
};

export const useAddNotes = () => {
  const queryClient = useQueryClient();
  const { setImageFiles, setImg, setTitleNotes, setDescriptionNotes } =
    useHiPeopleStore((s) => ({
      setImageFiles: s.setImageFiles,
      setImg: s.setImg,
      setTitleNotes: s.setTitleNotes,
      setDescriptionNotes: s.setDescriptionNotes,
    }));
  const createNotes = async (payload: INotes) => {
    const response = await apiRpc.tags.note.$post({
      json: payload,
    });
    const data = await response.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: createNotes,
    onSuccess: () => {
      setImageFiles([]);
      setImg({});
      setTitleNotes("");
      setDescriptionNotes("");
      queryClient.invalidateQueries({
        queryKey: ["userNotes"],
      });
    },
    onError: (error) => {
      console.error("Error creating notes:", error);
    },
  });

  return mutation;
};
