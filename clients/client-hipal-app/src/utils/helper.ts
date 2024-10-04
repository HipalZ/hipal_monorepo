import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const useErrorHandling = () => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const errorText = (status: number) => {
    let message = "";
    switch (status) {
      case 400:
        message =
          "Invalid Request: Please check the data you have entered and try again";
        break;
      case 401:
        router.push(`/${customLink}/user/signup`);
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
