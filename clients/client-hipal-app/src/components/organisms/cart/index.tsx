"use client";

import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { toast } from "react-toastify";

import { cn } from "@/components/utils/helpers";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";

import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useTableData from "@/components/store/useTableData";
import useBusinessDetails from "@/components/store/useBusinessDetails";

import glassTable from "@/assets/cart/glassTable.png";

import { useUserToken } from "@hi/common/src/useUserToken";
import { useCallTheCaptain } from "@/components/hooks/useCartHook";

// ✅ Flow router + per-flow API handlers
import {
  menuPos_placeOrder,
  menuShare_shareCart,
  other_shareCart,
  jewellery_shareSelection,
} from "./cartFlows";
import Buttons from "./CartButtons";

// Lazy parts
const EmptyCart = dynamic(() => import("./emptyCart"), { ssr: false });
const PaymentAlert = dynamic(() => import("./paymentAlert"), { ssr: false });
const CartItem = dynamic(() => import("./cartItem"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const CartWarning = dynamic(() => import("./cartWarning"), { ssr: false });
const ShareCartButtons = dynamic(() => import("./shareCartButtons"), {
  ssr: false,
});
const ItemDescriptionPopup = dynamic(
  () => import("@/components/atoms/dishDescription/itemDescription"),
  { ssr: false },
);
const HiCodeValidate = dynamic(() => import("./hicodeValidate"), {
  ssr: false,
});
const Orders = dynamic(() => import("./orders"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const Cart = () => {
  const { cart, cartHistory } = useCartStore();
  const { mutate, isPending } = useCallTheCaptain();

  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);

  const setShowCart = useCart((s) => s.setShowCart);
  const cartPage = useCart((s) => s.cartPage);
  const setCartPage = useCart((s) => s.setCartPage);
  const setInputModal = useCart((s) => s.setInputModal);
  const setOrderPlaced = useCart((s) => s.setOrderPlaced);

  const tableName = useTableData((s) => s.tableName);
  const hiCode = useTableData((s) => s.hiCode);
  const hiCodePopup = useTableData((s) => s.hiCodePopup);
  const setHiCodeUser = useTableData((s) => s.setHiCodeUser);
  const setTableName = useTableData((s) => s.setTableName);
  const setHiCodePopup = useTableData((s) => s.setHiCodePopup);
  const setHiCode = useTableData((s) => s.setHiCode);

  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);

  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((state) => state.userDetails);
  const setDirection = useLogin((s) => s.setDirection);

  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const [showPayAlert, setShowPayAlert] = useState<boolean>(false);

  // OUTLET TYPE + simple helper
  const outletType = (outletInfo?.outLetType || "OTHER").toUpperCase() as
    | "MENU"
    | "RESTAURANT"
    | "OTHER"
    | "JEWELLERY";
  const cartHasTableRequirement =
    outletType === "MENU" || outletType === "RESTAURANT";

  // Sanitize cart payload before network
  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  const payPopCorn = useCallback(() => {
    setInputModal(true);
  }, [setInputModal]);

  const triggerCallWaiter = useCallback(() => {
    // For MENU/RESTAURANT we use table flow; for others still allow "help" action
    setDirection("category");

    if (cartHasTableRequirement && !tableName) {
      toast.error("Please scan QR");
      return router.push(`/${customLink}/scan`);
    }

    if (!accessToken) {
      setCheckLogin(true);
      return;
    }

    const payload = {
      businessId: businessId,
      tableName: tableName || "N/A",
      message: "I need help",
      alertType: "WAITER",
      status: "WAITER",
      name: userDetails?.name || "user",
      userId: userDetails?._id,
    };

    mutate(payload);
  }, [
    setDirection,
    accessToken,
    router,
    customLink,
    tableName,
    businessId,
    mutate,
    setCheckLogin,
    userDetails,
    cartHasTableRequirement,
  ]);

  const triggerModal = useCallback(() => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCart(false);
      useCartStore.setState({ cart: [] });
    }, 5000);
  }, [setOrderPlaced, setShowCart]);

  /* ------------------------------------------------------------------ */
  /*                   FLOW-SPECIFIC HANDLERS (separate)                */
  /* ------------------------------------------------------------------ */

  const ensureLogin = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true);
      return false;
    }
    return true;
  }, [accessToken, setCheckLogin]);

  const guardTableIfNeeded = useCallback(() => {
    if (cartHasTableRequirement && !tableName) {
      toast.error("Please scan QR");
      router.push(`/${customLink}/scan`);
      return false;
    }
    return true;
  }, [cartHasTableRequirement, tableName, router, customLink]);

  const handleMenuPosPlaceOrder = useCallback(async () => {
    if (!ensureLogin()) return;
    if (!guardTableIfNeeded()) return;

    try {
      await menuPos_placeOrder({
        businessId: outletInfo?.businessId!,
        tableName: tableName!,
        cart: sanitizedCart,
        userId: userDetails?._id,
        customerPhone: userDetails?.phone,
      });
      // Light success UX — open/close modal flow like before
      setShowCart(true);
      triggerModal();
      // If API returns hiCode in future, you can set via setHiCode(...)
    } catch (e) {
      console.error("Menu POS place order failed", e);
    }
  }, [
    ensureLogin,
    guardTableIfNeeded,
    outletInfo?.businessId,
    tableName,
    sanitizedCart,
    userDetails?._id,
    userDetails?.phone,
    setShowCart,
    triggerModal,
  ]);

  const handleMenuShareCart = useCallback(async () => {
    if (!ensureLogin()) return;
    if (!guardTableIfNeeded()) return;

    try {
      await menuShare_shareCart({
        businessId: outletInfo?.businessId!,
        tableName: tableName!,
        cart: sanitizedCart,
        name: userDetails?.name || "Guest",
        phone: userDetails?.phone,
        userId: userDetails?._id,
      });
      setShowCart(true);
      triggerModal();
    } catch (e) {
      console.error("Menu share cart failed", e);
    }
  }, [
    ensureLogin,
    guardTableIfNeeded,
    outletInfo?.businessId,
    tableName,
    sanitizedCart,
    userDetails?.name,
    userDetails?.phone,
    userDetails?._id,
    setShowCart,
    triggerModal,
  ]);

  const handleOtherShareCart = useCallback(async () => {
    if (!ensureLogin()) return;
    try {
      await other_shareCart({
        businessId: outletInfo?.businessId!,
        cart: sanitizedCart,
      });
      setShowCart(true);
      triggerModal();
    } catch (e) {
      console.error("OTHER share cart failed", e);
    }
  }, [
    ensureLogin,
    outletInfo?.businessId,
    sanitizedCart,
    setShowCart,
    triggerModal,
  ]);

  const handleJewelleryShareSelection = useCallback(async () => {
    if (!ensureLogin()) return;
    try {
      await jewellery_shareSelection({
        id: outletInfo?.businessId!,
        cart: sanitizedCart,
        userId: userDetails?._id,
        businessId: outletInfo?.businessId!,
        name: userDetails?.name || "Guest",
        phone: userDetails?.phone,
      });
      setShowCart(true);
      triggerModal();
    } catch (e) {
      console.error("Jewellery share selection failed", e);
    }
  }, [
    ensureLogin,
    outletInfo?.businessId,
    sanitizedCart,
    userDetails?._id,
    userDetails?.name,
    userDetails?.phone,
    setShowCart,
    triggerModal,
  ]);

  // For HiCodeValidate modal we still pass a single placeOrder function.
  // It decides based on current flow:
  const placeOrderUnified = useCallback(async () => {
    if (
      outletInfo?.isPosEnabled &&
      (outletType === "MENU" || outletType === "RESTAURANT")
    ) {
      await handleMenuPosPlaceOrder();
      return;
    }
    if (outletType === "MENU" || outletType === "RESTAURANT") {
      await handleMenuShareCart();
      return;
    }
    if (outletType === "JEWELLERY") {
      await handleJewelleryShareSelection();
      return;
    }
    // fallback OTHER
    await handleOtherShareCart();
  }, [
    outletInfo?.isPosEnabled,
    outletType,
    handleMenuPosPlaceOrder,
    handleMenuShareCart,
    handleJewelleryShareSelection,
    handleOtherShareCart,
  ]);

  const handleBack = useCallback(() => {
    if (cartPage === "cart") {
      setShowCart(false);
    } else {
      setCartPage("cart");
    }
  }, [cartPage, setShowCart, setCartPage]);

  return (
    <div
      className={cn(
        "overflow-y-auto h-[100dvh] hide-scrollbar text-[#000000] bg-[#ffffff] relative",
      )}
    >
      {/* CART PAGE */}
      {cartPage === "cart" && (
        <section className="relative h-[calc(91dvh+5px)]">
          {/* Header */}
          <div className="bg-white z-[500] sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <article className="flex items-center gap-2">
              {outletInfo?.outLetType === "OTHER" ? (
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className="px-2 rounded-xl bg-[#000000] text-[#ffffff] on_active_bounce"
                >
                  <FaArrowLeft
                    size={28}
                    className="p-2 rounded-full cursor-pointer text-[#ffffff]"
                  />
                </button>
              ) : null}
              <h2 className="text-lg font-medium">Live cart</h2>
            </article>

            {hiCode && (
              <div className="!text-sm text-black inline-flex items-center gap-2">
                <Image src={glassTable} alt="Table" />
                <span>code {hiCode}</span>
              </div>
            )}

            <article className="flex items-center text-black">
              <MdOutlineShoppingCart size={24} />
              <span className="text-sm">{cart?.length} items</span>
            </article>
          </div>

          {/* Body */}
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex-1 divide-y divide-gray-100 pb-[5rem]">
              {cart?.length > 0 ? (
                cart?.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>

            {/* Footer (sticky) */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
              {/* POS cancel note */}
              {outletInfo?.isPosEnabled && outletInfo?.placeOrderButton ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full p-2 mt-auto mb-2 text-sm text-center text-rose-600 bg-rose-50"
                >
                  Orders once placed, cannot be cancelled!
                </motion.div>
              ) : null}

              {/* ✅ Flow-driven buttons */}
              <Buttons
                outletType={outletType}
                isPosEnabled={!!outletInfo?.isPosEnabled}
                cartPage={cartPage}
                cart={cart}
                cartHistory={cartHistory}
                isPending={isPending}
                shareCart={!!outletInfo?.shareCart}
                placeOrderButton={!!outletInfo?.placeOrderButton}
                // common handlers
                onBack={handleBack}
                onTriggerWaiter={triggerCallWaiter}
                onPayPopcorn={payPopCorn}
                setShowCart={setShowCart}
                setCartPage={setCartPage}
                // flow handlers
                onMenuPosPlaceOrder={handleMenuPosPlaceOrder}
                onMenuShareCart={handleMenuShareCart}
                onOtherShareCart={handleOtherShareCart}
                onJewelleryShareSelection={handleJewelleryShareSelection}
              />
            </div>
          </div>
        </section>
      )}

      {/* ORDER PAGE */}
      {cartPage === "order" && <Orders />}

      {cart.length > 0 && outletInfo?.outLetType === "OTHER" && (
        <ShareCartButtons />
      )}

      {/* HiCode validate modal (uses unified flow) */}
      {hiCodePopup && (
        <ItemDescriptionPopup
          show={hiCodePopup}
          onClose={() => setHiCodePopup(false)}
          bottomCross
        >
          <HiCodeValidate placeOrder={placeOrderUnified} />
        </ItemDescriptionPopup>
      )}

      {/* Pay alert modal */}
      {showPayAlert && (
        <ItemDescriptionPopup
          show={showPayAlert}
          onClose={() => setShowPayAlert(false)}
        >
          <PaymentAlert onClick={() => setShowPayAlert(false)} />
        </ItemDescriptionPopup>
      )}

      {/* HISTORY page footer for non-cart pages (matches your original conditional placement) */}
      {tableName && outletInfo?.outLetType !== "OTHER" && (
        <Buttons
          outletType={outletType}
          isPosEnabled={!!outletInfo?.isPosEnabled}
          cartPage={cartPage}
          cart={cart}
          cartHistory={cartHistory}
          isPending={isPending}
          shareCart={!!outletInfo?.shareCart}
          placeOrderButton={!!outletInfo?.placeOrderButton}
          // common handlers
          onBack={handleBack}
          onTriggerWaiter={triggerCallWaiter}
          onPayPopcorn={payPopCorn}
          setShowCart={setShowCart}
          setCartPage={setCartPage}
          // flow handlers
          onMenuPosPlaceOrder={handleMenuPosPlaceOrder}
          onMenuShareCart={handleMenuShareCart}
          onOtherShareCart={handleOtherShareCart}
          onJewelleryShareSelection={handleJewelleryShareSelection}
        />
      )}
    </div>
  );
};

const MemoCart = memo(Cart);
export default MemoCart;
