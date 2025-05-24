import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const useErrorHandling = () => {
  const { setCheckLogin } = usePaymentStore();
  const errorText = (status: number) => {
    let message = "";
    switch (status) {
      case 400:
        message =
          "Oops! Something went wrong with your request. Please check your input and try again.";
        break;
      case 401:
        setCheckLogin(true);
        message = "Session Expired: Please log in again to continue.";
        break;
      case 403:
        message =
          "Forbidden: You do not have permission to access this resource.";
        break;
      case 404:
        message = "Not Found: The requested resource could not be found.";
        break;
      default:
        message = "An unexpected error occurred. Please try again later.";
        break;
    }
    toast.error(message);
    return message;
  };

  return { errorText };
};

export const useGoNext = () => {
  const customLink = useParams()?.businessId as string;
  const { direction, isPayment, invoiceUrl, urlFrom } = useLogin();
  const tableName = useTableData((s) => s.tableName);

  const goNext = useCallback(() => {
    let newUrl = `/${customLink}/explore?pay=${isPayment}`;

    if (direction && direction.startsWith("room")) {
      newUrl = `/${customLink}/hotel/checkin?${direction}`;
    } else {
      switch (direction) {
        case "loyalty":
          newUrl = `/${customLink}/loyalty`;
          break;
        case "category":
          newUrl = `/${customLink}/category?pay=${isPayment}&tableName=${tableName}`;
          break;
        case "explore":
          newUrl = `/${customLink}/explore?pay=${isPayment}`;
          break;
        case "invoice":
          newUrl = invoiceUrl;
          break;
        case "posPayment":
          newUrl = urlFrom;
          break;
        case "payment":
          newUrl = urlFrom;
          break;
        case "couponz":
          newUrl = urlFrom;
          break;
        case "explore-googleReview":
          newUrl = `/${customLink}/explore`;
          break;
        default:
          break;
      }
    }

    window.location.href = newUrl;
  }, [direction, customLink, isPayment, urlFrom, invoiceUrl]);

  return { goNext };
};
