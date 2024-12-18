"use client";
import { memo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLogin } from "@/components/store/useLogin";
import AddAmountModal from "./addAmountModal";
import CallTheWaiterComponent from "./callTheWaiter";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData from "@/components/store/useTableData";
import { useCart } from "@/components/store/useCart";
import { useSearch } from "@/components/store/useSearch";
import { useUserToken } from "@hi/common/src/useUserToken";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { MdReceiptLong } from "react-icons/md";
import { BsHandIndexThumb } from "react-icons/bs";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import { PiArrowBendUpLeftBold } from "react-icons/pi";

const MemoCategoryPageBtn = () => {
  const accessToken = useUserToken.getState().accessToken;
  const { businessId } = useBusinessDetails((s) => ({
    businessId: s.businessDetails?._id,
  }));
  const { isSearchActive } = useSearch();
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const setIsPayment = useLogin((s) => s.setIsPayment);
  const router = useRouter();
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const { setShowCart, showCart, setCartPage, inputModal, setInputModal } =
    useCart();

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [setIsPayment]);

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);

  const proceedToPayment = useCallback(() => {
    setDirection("category");
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
    setCartPage("order");
    setShowCart(!showCart);
  }, [setDirection, accessToken, customLink, showCart]);

  const triggerCallWaiter = useCallback(() => {
    console.log("triggerCallWaiter");
    setDirection("category");
    if (!tableName) {
      return router.push(`/${customLink}/scan`);
    }
    if (!accessToken) {
      return router.push(`/${customLink}/user/signup`);
    }
    openCallWaiterModal();
  }, [
    setDirection,
    accessToken,
    businessId,
    router,
    customLink,
    tableName,
    openCallWaiterModal,
  ]);

  return (
    <>
      {!isSearchActive && (
        <section
          className=" px-2  fixed z-50 bottom-0 w-full 
           max-w-[30rem] bg-[#FCFCFC] shadow-lg
          transform md:-translate-x-1/2 md:left-1/2
          overflow-hidden py-4 text-black flex gap-2 justify-evenly"
          style={{ boxShadow: "4px 4px 4px 4px #00000040" }}
        >
          <Link href={`/${customLink}/explore`} className="">
            <section className="border border-[#B0B0B0] p-2 rounded-md">
              <PiArrowBendUpLeftBold size={24} />
            </section>
          </Link>
          <button
            type="button"
            onClick={triggerCallWaiter}
            className="border border-[#B0B0B0] p-2 rounded-md"
          >
            <FiSearch size={24} />
          </button>
          <button
            type="button"
            onClick={triggerCallWaiter}
            className="border border-[#B0B0B0] p-2 rounded-md gap-1 flex items-center"
          >
            <BsHandIndexThumb size={24} />
            <span className="text-sm">Call Captain</span>
          </button>
          <button
            type="button"
            onClick={proceedToPayment}
            className="border border-[#B0B0B0] p-2 rounded-md flex items-center"
          >
            <MdReceiptLong size={24} />
            <span className="text-sm"> My Orders</span>
          </button>
        </section>
      )}

      {inputModal && (
        <BottomPopUp show={inputModal} onClose={closeModal} linearGradTheme>
          <AddAmountModal />
        </BottomPopUp>
      )}

      {callWaiterModal && (
        <ItemDescriptionPopup
          heading="Help"
          show={callWaiterModal}
          onClose={closeCallWaiterModal}
        >
          <CallTheWaiterComponent onClose={closeCallWaiterModal} />
        </ItemDescriptionPopup>
      )}
    </>
  );
};

const CategoryPageBtn = memo(MemoCategoryPageBtn);
export default CategoryPageBtn;
