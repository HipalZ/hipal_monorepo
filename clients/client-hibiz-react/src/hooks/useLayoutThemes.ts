import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";

export const useLayoutThemes = () => {
  const navigate = useNavigate();
  const updateThemeApplied = useBusinessData((s) => s.updateAppliedTheme);
  const { setStep } = useBusinessCtrl();
  const businessData = useBusinessData((s) => s.businessData);

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRpc.businesses[":businessId"].$put({
        json: payload,
        param: {
          businessId: businessData?._id,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success("Colors saved successfully");
        updateThemeApplied(true);
        setStep(0);
        navigate(`/app/business/${businessData?._id}`);
      }
    },
    onError: (error: any) => {
      const { status } = error?.response || {};
      if (status === 400 || status === 403 || status === 409) {
        toast.error("Please try again");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
};
