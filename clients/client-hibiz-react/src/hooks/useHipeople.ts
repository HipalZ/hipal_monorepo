import useShowErrorToasts from "@/components/atom/errorToasts";
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

  const { setTagData, setTags } = useHiPeopleStore((s) => ({
    setTagData: s.setTagData,
    setTags: s.setTags,
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
    setTags(data?.data as UserTags[]);
    setDateLength(data?.data?.length);
    return data?.data;
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userTags", businessId, userId],
    queryFn: () => getAllUserTags(businessId ?? "", userId ?? ""),
    enabled: !!businessId && !!userId,
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
  const queryClient = useQueryClient();
  const { businessId } = useParams<{ businessId?: string }>();
  const {
    userComment,
    singleBillData,
    setUserComment,
    setOpenBillPopup,
    setIsLoading,
    setAppliedUserTags,
    removeTagIds,
  } = useHiPeopleStore((s) => ({
    userComment: s.userComment,
    singleBillData: s.singleBillData,
    setOpenBillPopup: s.setOpenBillPopup,
    setIsLoading: s.setIsLoading,
    setUserComment: s.setUserComment,
    setAppliedUserTags: s.setAppliedUserTags,
    removeTagIds: s.removeTagIds,
  }));

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
          .filter((tag) => tag && tag._id)
          .map((tag) => tag._id.toString()),
        userId: singleBillData.userId.toString(),
        removeTagIds: removeTagIds,
        comment: userComment,
      },
    });
    const data = await userTagsResponse.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: updateUserTags,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      setOpenBillPopup(false);
      setIsLoading(false);
      setUserComment("");
      setAppliedUserTags([]);
      queryClient.invalidateQueries({
        queryKey: ["userDashboard"],
      });
      toast.success("data updated successfully");
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
      queryClient.invalidateQueries({
        queryKey: ["userTags"],
      });
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
  const { setTags } = useHiPeopleStore((s) => ({
    setTags: s.setTags,
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
    enabled: !!businessId,
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
      josn: {},
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
  const errorToasts = useShowErrorToasts();
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
    setTags,
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
    setTags: s.setTags,
  }));
  const createTag = async (payload) => {
    const response = await apiRpc.tags.$post({
      json: payload,
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData?.error);
      errorToasts(errorData?.error);
      throw new Error(errorData?.error?.message || "Failed to create tag");
    }
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
      setTags([]);
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
  const errorToasts = useShowErrorToasts();
  const {
    setImageFiles,
    setImg,
    setTitleNotes,
    setDescriptionNotes,
    setOpenAddNotes,
  } = useHiPeopleStore((s) => ({
    setImageFiles: s.setImageFiles,
    setImg: s.setImg,
    setTitleNotes: s.setTitleNotes,
    setDescriptionNotes: s.setDescriptionNotes,
    setOpenAddNotes: s.setOpenAddNotes,
  }));

  const createNotes = async (payload: INotes) => {
    const response = await apiRpc.tags.note.$post({
      json: payload,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData?.error);
      errorToasts(errorData?.error);
      throw new Error(errorData?.error?.message || "Failed to create tag");
    }

    const data = await response.json();
    return { data: data?.data, status: response.status };
  };

  const mutation = useMutation({
    mutationFn: createNotes,
    onSettled: (result, error) => {
      if (result?.status && result.status >= 200 && result.status < 300) {
        // If the status code is in the 2xx range, execute the success actions
        setImageFiles([]);
        setImg({});
        setTitleNotes("");
        setDescriptionNotes("");
        setOpenAddNotes(false);
        queryClient.invalidateQueries({
          queryKey: ["userNotes"],
        });
      } else if (error) {
        // Log the error
        console.error("Error creating notes:", error);
      }
    },
  });

  return mutation;
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();
  const errorToasts = useShowErrorToasts();
  const {
    setImageFiles,
    setImg,
    setTitleNotes,
    setDescriptionNotes,
    singleNotesData,
    setOpenEditNotes,
  } = useHiPeopleStore((s) => ({
    setImageFiles: s.setImageFiles,
    setImg: s.setImg,
    setTitleNotes: s.setTitleNotes,
    setDescriptionNotes: s.setDescriptionNotes,
    singleNotesData: s.singleNotesData,
    setOpenEditNotes: s.setOpenEditNotes,
  }));
  const updateNotes = async (payload: INotes) => {
    const response = await apiRpc.tags.note[":noteId"].$put({
      json: payload,
      param: {
        noteId: singleNotesData?._id,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log("errorData", errorData?.error);
      errorToasts(errorData?.error);
      throw new Error(errorData?.error?.message || "Failed to create tag");
    }
    const data = await response.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: updateNotes,
    onSettled: (data, error) => {
      if (!error) {
        setOpenEditNotes(false);
        setImageFiles([]);
        setImg({});
        setTitleNotes("");
        setDescriptionNotes("");
        queryClient.invalidateQueries({
          queryKey: ["userNotes"],
        });
      } else {
        console.error("Error updating notes:", error);
      }
    },
  });

  return mutation;
};

export const useDeleteNotes = () => {
  const queryClient = useQueryClient();
  const { selectedDeleteNoteId } = useHiPeopleStore((s) => ({
    selectedDeleteNoteId: s.selectedDeleteNoteId,
  }));
  const deleteNotes = async () => {
    const response = await apiRpc.tags.note.remove[":noteId"].$delete({
      param: {
        noteId: selectedDeleteNoteId,
      },
      json: {},
    });
    const data = await response.json();
    return data?.data;
  };

  const mutation = useMutation({
    mutationFn: deleteNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotes"],
      });
    },
    onError: (error) => {
      console.error("Error deleting notes:", error);
    },
  });

  return mutation;
};

export function useUploadCustomers() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: {
      businessId: string;
      users: { name: string; phone: string; dob?: string }[];
    }) => {
      const res = await apiRpc.script.bulk.upload_customers.$post({
        json: payload,
      });
      return res.data;
    },

    onSuccess: (data) => {
      toast.success("Customers uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["getAllPeoples"] });
    },

    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload customers";
      toast.error(msg);
    },
  });

  return mutation;
}
