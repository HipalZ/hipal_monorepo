import { apiRpc } from "@hi/common";
import { useCallback } from "react";
import { useCreateRegistration } from "@/hooks/useTemplates";
import { useErrorHandling } from "@/components/utils/errorHandling";
import { useMerchantDetails } from "@/hooks/merchantSecret";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import usePayment from "@/components/store/usePayment";
import useWhatsapp from "@/components/store/useWhatsapp";

export const usePaymentHelpers = () => {
  const { merchantDetails, setShowError, setPaymentSuccessFull } = useWhatsapp(
    (s) => ({
      merchantDetails: s.merchantDetails,
      setShowError: s.setShowError,
      setPaymentSuccessFull: s.setPaymentSuccessFull,
    }),
  );
  const { wabaregistration } = useCreateRegistration();
  const { setIsLoading } = useWhatsappTempStore((s) => ({
    setIsLoading: s.setIsLoading,
  }));
  const { user } = useOwnerLogin((s) => ({
    user: s.user,
  }));
  const { errorText } = useErrorHandling();
  const { setRazorPayPaymentId, setRazorPayOrderId, setRazorPaySignature } =
    usePayment();
  useMerchantDetails();

  const businessDetails = useBusinessData((s) => s.businessData);

  // after getting the order id from the backend, we will create the razorpay options
  const creatingRazorPayOptions = async (orderId: string) => {
    if (!orderId) {
      setIsLoading(false); // Ensure isLoading is turned off if there's no orderId
      return;
    }
    let isScriptLoaded = false;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    const timeoutId = setTimeout(() => {
      if (!isScriptLoaded) {
        toast.error("Facing Internet Issue! Please try again.");
        setIsLoading(false);
        document.body.removeChild(script);
      }
    }, 10000);

    script.onload = () => {
      isScriptLoaded = true;
      clearTimeout(timeoutId);
      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: 3999,
        currency: "INR",
        name: businessDetails?.name,
        description: "Transaction",
        image: businessDetails?.logo,
        order_id: orderId,
        handler: (response) => {
          handlePaymentSuccess(response);
          window.onpopstate = null;
        },
        modal: {
          subscription_card_change: true,
          remember_customer: true,
          escape: false,
          backdropclose: false,
          handleback: false,
          ondismiss: () => {
            handlePaymentDismiss();
            window.onbeforeunload = null; // Remove the event listener on dismiss
            window.onpopstate = null;
            setIsLoading(false); // Set isLoading to false after dismiss
          },
        },

        notes: {
          address: "Paltribe solutions",
          businessId: businessDetails?._id,
          total: 3999,
          billValue: 3999,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);

      // Add event listener to prevent back navigation
      history.pushState(null, "", location.href); // Push initial state with an empty string for title
      window.onbeforeunload = (event) => {
        event.preventDefault();
        // Redirect to a specific URL
        window.location.href = `/app/business/${businessDetails?._id}/whatzapp`;
      };
      window.onpopstate = (event) => {
        event.preventDefault();
        // Redirect to a specific URL
        window.location.href = `/app/business/${businessDetails?._id}/whatzapp`;
      };

      rzp1.open();

      // Remove the event listener when the user starts the payment process
      document.addEventListener("rzp_payment_start", () => {
        window.onbeforeunload = null;
        setIsLoading(false); // Set isLoading to false once payment starts
      });

      rzp1.on("payment.failed", (response) => {
        handlePaymentFailure(response);
        window.onbeforeunload = null;
        window.onpopstate = null; // Remove the event listener on payment failure
        setIsLoading(false); // Set isLoading to false on payment failure
      });
    };

    script.onerror = () => {
      toast.error("Failed to load Razorpay. Please try again later.");
      setIsLoading(false); // Set isLoading to false if script loading fails
    };
  };

  // send payment response to the backend for verification
  const sendPaymentResponse = useCallback(
    async (response: any) => {
      setIsLoading(true);

      const res = await apiRpc.whatsapp.whatsapp_valid_payment[
        ":merchantId"
      ].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          response,
        },
      });
      if (!res.ok) {
        return errorText(res.status);
      }
      await res.json();

      if (res.status === 200) {
        toast.success("Payment successful");
        setRazorPaySignature("");
        setRazorPayOrderId("");
        setRazorPayPaymentId("");
        setIsLoading(false);
        setPaymentSuccessFull(true);
        await wabaregistration();
        return;
      }
      toast.error("Payment failed");
    },
    [
      setIsLoading,
      merchantDetails.razorpayMerchantId,
      setRazorPaySignature,
      setRazorPayOrderId,
      setRazorPayPaymentId,
      errorText,
      setPaymentSuccessFull,
      wabaregistration,
    ],
  );

  // create razorpay order generates order_id in response
  const createRazorPayOrder = useCallback(
    async (total: number): Promise<string> => {
      const res = await apiRpc.whatsapp.create_whatsapp_order[
        ":merchantId"
      ].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          businessId: businessDetails?._id || "",
          total: total,
          currency: "INR",
          billValue: total,
          userId: user?._id,
        },
      });
      if (!res.ok) {
        setIsLoading(false);
        errorText(res.status);
      }
      const response = (await res.json()) as unknown as {
        data: { order_id: string };
      };
      const orderId = response.data.order_id;
      setRazorPayOrderId(orderId);
      return orderId;
    },
    [
      merchantDetails.razorpayMerchantId,
      businessDetails?._id,
      setIsLoading,
      setRazorPayOrderId,
      user,
      errorText,
    ],
  );

  // handle payment success
  const handlePaymentSuccess = useCallback(
    async (response: any) => {
      setIsLoading(true);
      await sendPaymentResponse(response);
      setRazorPaySignature(response.razorpay_signature);
      setRazorPayOrderId(response.razorpay_order_id);
      setRazorPayPaymentId(response.razorpay_payment_id);
    },
    [
      setRazorPaySignature,
      setRazorPayOrderId,
      setRazorPayPaymentId,
      sendPaymentResponse,
      setIsLoading,
    ],
  );

  // handle payment failure
  const handlePaymentDismiss = useCallback(() => {
    setRazorPaySignature("");
    setRazorPayOrderId("");
    setRazorPayPaymentId("");
    setShowError(true);
    toast.error("Payment failed");
    setTimeout(() => {
      setShowError(false);
    }, 2000);
  }, [
    setRazorPaySignature,
    setRazorPayOrderId,
    setRazorPayPaymentId,
    setShowError,
  ]);

  const handlePaymentFailure = useCallback(
    (response: any) => {
      setRazorPayOrderId(response.error.metadata.order_id);
    },
    [setRazorPayOrderId],
  );

  const handleCreateOrder = async () => {
    const orderId = await createRazorPayOrder(3999);
    setIsLoading(true);
    await creatingRazorPayOptions(orderId);
  };

  return { handleCreateOrder };
};
