import { apiRpc } from "@hi/common";
import { memo, useCallback } from "react";
import { useMerchantDetails } from "@/hooks/merchantSecret";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import usePayment from "@/components/store/usePayment";
import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useErrorHandling } from "@/components/utils/errorHandling";
import { useTempStore } from "@/components/store/useTempStore";

const pricingPlans = [
  {
    id: "5000",
    name: "Wallet",
    price: 5000,
    marketingPrice: 0.89,
    utilityPrice: 0.2,
    messages: 5000,
    isPopular: false,
    features: [
      "Custom Templates",
      "Analytics",
      "Marketing Templates 5,600+ msgs Approx (or)",
      "Utility Templates 25,000 msgs Approx",
    ],
  },
  {
    id: "10000",
    name: "Piggy Bank",
    price: 10000,
    marketingPrice: 0.89,
    utilityPrice: 0.2,
    messages: 10000,
    isPopular: false,
    features: [
      "Custom Templates",
      "Advanced Analytics",
      "Marketing Templates 11,200+ msgs Approx (or)",
      "Utility Templates 50,000 msgs Approx",
    ],
  },
  {
    id: "25000",
    name: "Vault",
    price: 25000,
    marketingPrice: 0.85,
    utilityPrice: 0.2,
    messages: 25000,
    isPopular: true,
    features: [
      "Custom Templates",
      "Advanced Analytics",
      "Marketing Templates 29,000+ Approx (or)",
      "Utility Templates 1,25,000 msgs Approx",
    ],
  },
  {
    id: "50000",
    name: "Treasure Box",
    price: 50000,
    marketingPrice: 0.85,
    utilityPrice: 0.2,
    messages: 50000,
    isPopular: false,
    features: [
      "Custom Templates",
      "Advanced Analytics",
      "Marketing Templates 58,800+ Approx (or)",
      "Utility Templates 2,50,000 msgs Approx",
    ],
  },
];
const MemoWhatzappPayment = () => {
  const [selectedPlan, setSelectedPlan] = useState({
    id: "5000",
    name: "Wallet",
    price: 5000,
    marketingPrice: 0.89,
    utilityPrice: 0.2,
    messages: 5000,
    features: [
      "Custom Templates",
      "Analytics",
      "Marketing Templates 5600+ msgs Approx (or)",
      "Utility Templates 25000 msgs Approx",
    ],
  });
  const { setStep, merchantDetails, setShowError } = useWhatsapp((s) => ({
    setStep: s.setStep,
    merchantDetails: s.merchantDetails,
    setShowError: s.setShowError,
  }));
  const { isLoading, setIsLoading } = useTempStore((s) => ({
    isLoading: s.isLoading,
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
    }, 5000);

    script.onload = () => {
      isScriptLoaded = true;
      clearTimeout(timeoutId);
      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: selectedPlan?.price,
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
          total: selectedPlan?.price,
          billValue: selectedPlan?.price,
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
        setStep(Step.SETUP);
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
      setStep,
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
    const orderId = await createRazorPayOrder(selectedPlan?.price);
    await creatingRazorPayOptions(orderId);
  };

  return (
    <>
      <section className="min-h-[90dvh] p-4 bg-gray-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-4xl font-extrabold text-center text-gray-900">
            WhatsApp Business Messaging Plans
          </h1>
          <p className="mb-8 text-lg text-center text-gray-600">
            Choose the perfect plan for your business communication needs
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedPlan(plan)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPlan?.id === plan.id}
                className={`
            relative h-full bg-white pb-24 rounded-xl shadow-lg overflow-hidden hover:scale-102 hover:shadow-xl
            ${selectedPlan?.id === plan.id ? "ring-4 ring-green-500" : ""}
            focus:outline-none focus:ring-4 focus:ring-green-300
          `}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h2>
                    <p className="text-5xl font-extrabold text-green-600">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Up to {plan.messages.toLocaleString()} messages
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Marketing: ₹{plan.marketingPrice}/msg
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Utility: ₹{plan.utilityPrice}/msg
                    </li>
                  </ul>
                  <div className="pt-6 border-t border-gray-200">
                    <ul className="space-y-3 text-sm text-gray-600">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index?.toString()}
                          className="flex items-start"
                        >
                          <svg
                            className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full p-6 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`
                w-full py-3 px-4 rounded-lg text-sm font-semibold
                ${
                  selectedPlan?.id === plan.id
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-green-600 border-2 border-green-600 hover:bg-green-50"
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
              `}
                  >
                    {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-12 text-center">
        <BottomButton
          fixed
          buttons={[
            { text: "Pay", onClick: handleCreateOrder, type: "button" },
          ]}
        />
      </div>
      {isLoading && <LoadingSpinner />}
    </>
  );
};

const WhatzappPayment = memo(MemoWhatzappPayment);
export default WhatzappPayment;
