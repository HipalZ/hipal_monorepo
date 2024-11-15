import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useErrorHandling = () => {
  const navigate = useNavigate();

  const errorText = (status: number) => {
    let message = "";
    switch (status) {
      case 400:
        message =
          "Oops! Something went wrong with your request. Please check your input and try again.";
        break;
      case 401:
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
