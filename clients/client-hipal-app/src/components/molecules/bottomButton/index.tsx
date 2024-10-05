"use client";
import {
  type ButtonHTMLAttributes,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MdAccountBalanceWallet, MdOutlineMenuBook } from "react-icons/md";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RiCouponFill, RiHome4Fill } from "react-icons/ri";
import { useUserToken } from "@hi/common/src/useUserToken";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { cn } from "@/components/utils/helpers";

function BottomButton({
  children,
  noTheme,
}: {
  children?: ReactNode;
  noTheme?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const [inputModal, setInputModal] = useState(false);
  const searchParams = useSearchParams();
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const accessToken = useUserToken.getState().accessToken;
  const { setIsPayment } = useLogin();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const isPayment = searchParams.get("pay");
  const customLink = useParams()?.businessId || "";
  const { subscribeModal, reviewPopup } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
    reviewPopup: s.reviewPopup,
  }));

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false);
  }, [inputModal, isPayment]);

  const openModal = useCallback(() => {
    if (!accessToken) {
      setDirection("explore");
      setIsPayment(true);
      router.push(`/${customLink}/user/signup`);
      return;
    }
    setInputModal(true);
  }, [inputModal, tableName]);

  useEffect(() => {
    if (isPayment === "true" && accessToken && tableName && !inputModal) {
      openModal();
    }
  }, []);

  const defaultStyle = useMemo(
    () => "px-2 font-light text-base-100 active:scale-90 on_active_bounce",
    [],
  );

  if (subscribeModal || reviewPopup) {
    return null;
  }

  return (
    <>
      {children ? (
        <center
          style={{
            boxShadow: "0px -8px 16px 0px rgba(0, 0, 0, 0.14)",
          }}
          className={cn(
            noTheme ? "bg-white" : "bg-primary",
            "sticky bottom-0 z-20 py-3 w-full max-w-[30rem]",
          )}
        >
          {children}
        </center>
      ) : (
        <section
          style={{
            boxShadow: "0px -8px 16px 0px rgba(0, 0, 0, 0.14)",
          }}
          className={cn(
            noTheme ? "bg-white" : "bg-primary",
            "fixed z-10 bottom-0 p-3 w-full max-w-[30rem] shadow-lg",
          )}
        >
          <center className="relative flex items-center justify-between text-xs">
            <Link href={`/${customLink}/explore`}>
              <center className={defaultStyle}>
                <RiHome4Fill size={20} className="mb-2" />
                Home
              </center>
            </Link>
            <Link
              href={`/${customLink}/${accessToken ? "loyalty" : "user/signup"}`}
            >
              <center className={defaultStyle}>
                <RiCouponFill size={20} className="mb-2" />
                Rewards
              </center>
            </Link>
            {tableName && (
              <center
                onClick={() => {
                  openModal();
                }}
                onKeyDown={() => {
                  openModal();
                }}
                className={defaultStyle}
              >
                <MdAccountBalanceWallet size={20} className="mb-2" />
                <span className="w-full font-light text-base-100">
                  {!tableName ? "Scan" : "Pay Bill"}
                </span>
              </center>
            )}
            {!tableName && (
              <Link href={`/${customLink}/scan`}>
                <center className={defaultStyle}>
                  <LuScanLine size={20} className="mb-2" />
                  {!tableName ? "Scan" : "Pay Bill"}
                </center>
              </Link>
            )}
            <Link href={`/${customLink}/category`}>
              <center className={defaultStyle}>
                <MdOutlineMenuBook size={20} className="mb-2" />
                {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
              </center>
            </Link>
          </center>
        </section>
      )}
      {inputModal && (
        <BottomPopUp show={inputModal} onClose={closeModal} linearGradTheme>
          <AddAmountModal />
        </BottomPopUp>
      )}
    </>
  );
}

const MemoBottomButton = memo(BottomButton);
export default MemoBottomButton;
