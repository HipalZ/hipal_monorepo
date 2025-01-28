import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
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
  const goNext = useCallback(() => {
    let newUrl = `/${customLink}/explore?pay=${isPayment}`;

    if (direction === "loyalty") {
      newUrl = `/${customLink}/loyalty`;
    } else if (direction === "category") {
      newUrl = `/${customLink}/category?pay=${isPayment}`;
    } else if (direction === "explore") {
      newUrl = `/${customLink}/explore?pay=${isPayment}`;
    } else if (direction === "invoice") {
      newUrl = invoiceUrl;
    } else if (direction === "posPayment") {
      newUrl = urlFrom;
    } else if (direction === "payment") {
      newUrl = `/${customLink}/payment?pay=${isPayment}`;
    } else if (direction === "couponz") {
      newUrl = urlFrom;
    } else if (direction === "explore-googleReview") {
      newUrl = `/${customLink}/explore`;
    }
    window.location.href = newUrl;
  }, [direction, customLink, isPayment, urlFrom, invoiceUrl]);

  return { goNext };
};
