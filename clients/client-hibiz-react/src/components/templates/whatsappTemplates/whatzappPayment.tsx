import BottomButton from '@/components/atom/bottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import usePayment from '@/components/store/usePayment';
import useWhatsapp, { Step } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useErrorHandling } from '@/components/utils/errorHandling';
import { usePaltribeMerchantDetails } from '@/hooks/merchantSecret';
import { apiRpc } from '@hi/common';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const TAX_RATE = 0.18;

const pricingPlans = [
  {
    id: '10',
    name: 'Test Wallet',
    price: 1,
    marketingPrice: 0.89,
    utilityPrice: 0.13,
    messages: 10,
    isPopular: false,
    features: ['Custom Templates', 'Analytics', 'Marketing Templates 1,170+ msgs Approx (or)', 'Utility Templates 5,000+ msgs Approx'],
  },
  {
    id: '1000',
    name: 'Wallet',
    price: 1000,
    marketingPrice: 0.89,
    utilityPrice: 0.13,
    messages: 1000,
    isPopular: false,
    features: ['Custom Templates', 'Analytics', 'Marketing Templates 1,170+ msgs Approx (or)', 'Utility Templates 5,000+ msgs Approx'],
  },
  {
    id: '2500',
    name: 'Piggy Bank',
    price: 2500,
    marketingPrice: 0.89,
    utilityPrice: 0.13,
    messages: 2500,
    isPopular: false,
    features: ['Custom Templates', 'Advanced Analytics', 'Marketing Templates 2,900+ msgs Approx (or)', 'Utility Templates 12,500+ msgs Approx'],
  },
  {
    id: '5000',
    name: 'Vault',
    price: 5000,
    marketingPrice: 0.89,
    utilityPrice: 0.13,
    messages: 5000,
    isPopular: true,
    features: ['Custom Templates', 'Advanced Analytics', 'Marketing Templates 5,500+ Approx (or)', 'Utility Templates 25,000+ msgs Approx'],
  },
  {
    id: '10000',
    name: 'Treasure Box',
    price: 10000,
    marketingPrice: 0.89,
    utilityPrice: 0.13,
    messages: 10000,
    isPopular: false,
    features: ['Custom Templates', 'Advanced Analytics', 'Marketing Templates 11,760+ Approx (or)', 'Utility Templates 50,000+ msgs Approx'],
  },
];

const MemoWhatzappPayment = () => {
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[2]);

  const queryClient = useQueryClient();
  const { setStep, merchantDetails, setShowError } = useWhatsapp((s) => ({
    setStep: s.setStep,
    merchantDetails: s.merchantDetails,
    setShowError: s.setShowError,
  }));
  const { isLoading, setIsLoading } = useWhatsappTempStore((s) => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
  }));
  const { user } = useOwnerLogin((s) => ({
    user: s.user,
  }));
  const { errorText } = useErrorHandling();
  const { setRazorPayPaymentId, setRazorPayOrderId, setRazorPaySignature } = usePayment();
  usePaltribeMerchantDetails();

  const businessDetails = useBusinessData((s) => s.businessData);

  // Helper to calculate total with tax
  const calculateTotal = (price: number) => {
    return Math.round(price + price * TAX_RATE);
  };

  // after getting the order id from the backend, we will create the razorpay options
  const creatingRazorPayOptions = async (orderId: string) => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // Calculate the total amount (Base + Tax)
    const finalAmount = calculateTotal(selectedPlan?.price || 0);

    let isScriptLoaded = false;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    const timeoutId = setTimeout(() => {
      if (!isScriptLoaded) {
        toast.error('Facing Internet Issue! Please try again.');
        setIsLoading(false);
        document.body.removeChild(script);
      }
    }, 10000);

    script.onload = () => {
      isScriptLoaded = true;
      clearTimeout(timeoutId);
      const options = {
        key: merchantDetails.razorpayKeyId,
        amount: finalAmount, // Updated to use Total Amount
        currency: 'INR',
        name: businessDetails?.name,
        description: 'Transaction',
        image: businessDetails?.logo,
        order_id: orderId,
        handler: (response: any) => {
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
            window.onbeforeunload = null;
            window.onpopstate = null;
            setIsLoading(false);
          },
        },

        notes: {
          address: 'Paltribe solutions',
          businessId: businessDetails?._id,
          total: finalAmount, // Updated Total
          billValue: finalAmount, // Updated Bill Value
          tax: finalAmount - (selectedPlan?.price || 0), // Optional: Add tax breakdown to notes
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp1 = new (window as any).Razorpay(options);

      // Add event listener to prevent back navigation
      history.pushState(null, '', location.href);
      window.onbeforeunload = (event) => {
        event.preventDefault();
        window.location.href = `/app/business/${businessDetails?._id}/whatzapp`;
      };
      window.onpopstate = (event) => {
        event.preventDefault();
        window.location.href = `/app/business/${businessDetails?._id}/whatzapp`;
      };

      rzp1.open();

      document.addEventListener('rzp_payment_start', () => {
        window.onbeforeunload = null;
        setIsLoading(false);
      });

      rzp1.on('payment.failed', (response: any) => {
        handlePaymentFailure(response);
        window.onbeforeunload = null;
        window.onpopstate = null;
        setIsLoading(false);
      });
    };

    script.onerror = () => {
      toast.error('Failed to load Razorpay. Please try again later.');
      setIsLoading(false);
    };
  };

  // send payment response to the backend for verification
  const sendPaymentResponse = useCallback(
    async (response: any) => {
      setIsLoading(true);

      const res = await apiRpc.whatsapp.whatsapp_valid_payment[':merchantId'].$post({
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
        toast.success('Payment successful');
        setRazorPaySignature('');
        setRazorPayOrderId('');
        setRazorPayPaymentId('');
        setIsLoading(false);
        setStep(Step.SETUP);
        // The wallet credit + history row are written by the Razorpay webhook,
        // which lands a moment after the client gets its success callback.
        // Invalidate immediately and once more after a short delay to cover
        // that race — otherwise the user sees a stale (empty) list.
        const refreshWallet = () => {
          queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
          queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
        };
        refreshWallet();
        setTimeout(refreshWallet, 2500);
        return;
      }
      toast.error('Payment failed');
    },
    [
      setIsLoading,
      merchantDetails.razorpayMerchantId,
      setRazorPaySignature,
      setRazorPayOrderId,
      setRazorPayPaymentId,
      errorText,
      setStep,
      queryClient,
    ],
  );

  // create razorpay order generates order_id in response.
  //   total     → GST-inclusive amount actually charged via Razorpay.
  //   billValue → base amount (without GST) that should be credited to the
  //               WhatsApp wallet. Backend uses this for the $inc on
  //               `currentBalance`.
  const createRazorPayOrder = useCallback(
    async (total: number, billValue: number): Promise<string> => {
      const res = await apiRpc.whatsapp.create_whatsapp_order[':merchantId'].$post({
        param: {
          merchantId: merchantDetails.razorpayMerchantId,
        },
        json: {
          businessId: businessDetails?._id || '',
          total: total,
          currency: 'INR',
          billValue: billValue,
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
    [merchantDetails.razorpayMerchantId, businessDetails?._id, setIsLoading, setRazorPayOrderId, user, errorText],
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
    [setRazorPaySignature, setRazorPayOrderId, setRazorPayPaymentId, sendPaymentResponse, setIsLoading],
  );

  // handle payment failure
  const handlePaymentDismiss = useCallback(() => {
    setRazorPaySignature('');
    setRazorPayOrderId('');
    setRazorPayPaymentId('');
    setShowError(true);
    toast.error('Payment failed');
    setTimeout(() => {
      setShowError(false);
    }, 2000);
  }, [setRazorPaySignature, setRazorPayOrderId, setRazorPayPaymentId, setShowError]);

  const handlePaymentFailure = useCallback(
    (response: any) => {
      setRazorPayOrderId(response.error.metadata.order_id);
    },
    [setRazorPayOrderId],
  );

  const handleCreateOrder = async () => {
    // `basePrice` is what the user actually buys (credited to wallet).
    // `finalAmount` is base + 18% GST (charged via Razorpay).
    const basePrice = selectedPlan?.price || 0;
    const finalAmount = calculateTotal(basePrice);
    const orderId = await createRazorPayOrder(finalAmount, basePrice);
    setIsLoading(true);
    await creatingRazorPayOptions(orderId);
  };

  return (
    <>
      <section className="min-h-[90dvh] bg-gray-100 p-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-center text-4xl font-extrabold text-gray-900">WhatsApp Business Messaging Plans</h1>
          <p className="mb-8 text-center text-lg text-gray-600">Choose the perfect plan for your business communication needs</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => {
              // UI Logic: Calculate amounts for display
              const taxAmount = plan.price * TAX_RATE;
              const totalAmount = plan.price + taxAmount;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPlan?.id === plan.id}
                  className={`hover:scale-102 relative h-full overflow-hidden rounded-xl bg-white pb-24 shadow-lg hover:shadow-xl ${selectedPlan?.id === plan.id ? 'ring-4 ring-green-500' : ''} focus:outline-none focus:ring-4 focus:ring-green-300`}
                >
                  {plan.isPopular && (
                    <div className="absolute right-0 top-0 rounded-bl-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">Most Popular</div>
                  )}
                  <div className="space-y-6 p-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>

                      {/* MODIFIED: Display Price Breakdown */}
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <p className="text-4xl font-extrabold text-gray-900">₹{plan.price.toLocaleString('en-IN')}</p>
                          <span className="text-sm text-gray-500">+ 18% GST</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">Total Payable: ₹{totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      {/* End of Modification */}
                    </div>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>Marketing</title>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Marketing: ₹{plan.marketingPrice}/msg
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>Utility</title>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Utility: ₹{plan.utilityPrice}/msg
                      </li>
                    </ul>
                    <div className="border-t border-gray-200 pt-6">
                      <ul className="space-y-3 text-sm text-gray-600">
                        {plan.features.map((feature, index) => (
                          <li key={index?.toString()} className="flex items-start">
                            <svg
                              className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <title>Features</title>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="absolute bottom-0 w-full bg-gray-50 p-6">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full rounded-lg px-4 py-3 text-sm font-semibold ${
                        selectedPlan?.id === plan.id
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'border-2 border-green-600 bg-white text-green-600 hover:bg-green-50'
                      } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                    >
                      {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div className="mt-12 text-center">
        {/* Helper text for final confirmation */}
        <p className="mb-2 text-sm text-gray-500">
          Total Amount to Pay: <strong>₹{calculateTotal(selectedPlan?.price || 0).toLocaleString('en-IN')}</strong> (Inc. GST)
        </p>
        <BottomButton fixed buttons={[{ text: 'Pay Now', onClick: handleCreateOrder, type: 'button' }]} />
      </div>
      {isLoading ? <LoadingSpinner /> : null}
    </>
  );
};

const WhatzappPayment = memo(MemoWhatzappPayment);
export default WhatzappPayment;
