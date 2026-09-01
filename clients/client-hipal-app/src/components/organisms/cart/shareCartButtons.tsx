import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { BASE_URL, BUSINESS_KEYID } from "@/configs";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useParams } from "next/navigation";
import Script from "next/script";
import { memo, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

const MemoShareCartButtons = () => {
  const { cart } = useCartStore();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((state) => state.userDetails);
  const setDirection = useLogin((state) => state.setDirection);
  const customLink = useParams()?.businessId as string;
  const { setCheckLogin } = usePaymentStore();
  const [shareState, setShareState] = useState({ showOptions: false, url: "" });

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  const generateCartLink = async () => {
    setDirection("category");
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }

    try {
      const response = await apiRpc.cart.create.$post({
        json: {
          businessId: outletInfo?.businessId,
          userId: userDetails?._id,
          cart: sanitizedCart,
          name: userDetails?.name || "user",
          phone: userDetails?.phone || "",
        },
      });
      const res = await response.json();

      if (!res.err) {
        const newShareURL = `${BUSINESS_KEYID}${customLink}/cart/${res?.data?.cartID}`;
        await shareCart(newShareURL);
      } else {
        toast.error(res.message || "Failed to create cart link");
      }
    } catch (error) {
      console.error("Error  creating cart:", error);
      toast.error("An error occurred while creating the cart link");
    }
  };

  const shareCart = async (urlOverride?: string) => {
    const shareUrl = urlOverride || shareState.url;
    if (!shareUrl) return;
    const message = encodeURIComponent(
      `Hi, I am interested in this item(s). Can I know more details?.\n\n *Customer Cart:* ${shareUrl}\n *Captain View (Internal Use):* ${BASE_URL}/${outletInfo?.businessId}/alerts`
    );

    const whatsappUrl = `https://wa.me/+91${outletInfo?.phone}?text=${message}`;
    window.open(whatsappUrl, "_blank");

    setShareState({ showOptions: false, url: "" });
  };

  return (
    <>
      {sanitizedCart.map(({ dish }) => (
        <Script
          key={dish._id}
          type="application/ld+json"
          id={`structured-data-${dish._id}`}
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: dish.name,
            image: dish.images?.[0] || outletInfo?.logoUrl,
            description: dish.description || "",
            sku: dish._id,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: dish.price,
              availability: dish.availability ? "InStock" : "OutOfStock",
              url: `${BUSINESS_KEYID}${customLink}/${dish._id}`,
            },
          })}
        </Script>
      ))}

      <button
        onClick={generateCartLink}
        type="button"
        className="fixed bottom-4 mx-4 w-[92%] py-3 px-6 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white text-lg font-medium flex items-center justify-center shadow-md gap-2"
      >
        <span>Share in WhatsApp</span>
        <FaWhatsapp size={22} />
      </button>
    </>
  );
};

const ShareCartButtons = memo(MemoShareCartButtons);
export default ShareCartButtons;
