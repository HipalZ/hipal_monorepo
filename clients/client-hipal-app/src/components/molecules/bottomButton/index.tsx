"use client";
import React, { memo, useCallback, useEffect, useState } from "react";
import { MdOutlineAccountBalanceWallet, MdOutlineMenuBook } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useRouter, useSearchParams } from "next/navigation";
import { RiCouponFill } from "react-icons/ri";

function BottomButton({
  children
}: {
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const [inputModal, setInputModal] = useState(false);
  const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const { isLogin, direction, setIsPayment, isPayment } = useLogin()

  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false)
  }, [setInputModal]);

  const openModal = useCallback(() => {
    if (!isLogin) {
      setDirection("explore")
      setIsPayment(true)
      router.push(`/r/${customLink}/user/signup`);
      return;
    }
    setInputModal(true);
  }, [setInputModal, tableName]);

  useEffect(() => {
    if (isPayment && isLogin && tableName) {
      openModal()
    }
  }, [])

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 p-3 w-full max-w-[30rem] bg-primary">
          {children}
        </center>
      ) : (
        <section className="fixed bottom-0 z-20 p-3 w-full max-w-[30rem] bg-primary">
          <center className="relative flex items-center justify-between px-6">
            {
              <Link href={`/r/${customLink}/${isLogin ? 'loyalty' : 'user/signup'}`}>
                <center className="px-2 font-light text-base-100">
                  <RiCouponFill size={22} />
                  Rewards
                </center>
              </Link>
            }
            {
              tableName && (
                <button onClick={openModal} className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100">
                  <MdOutlineAccountBalanceWallet size={36} />
                </button>
              )
            }
            {
              !tableName && (
                <Link href="/scan">
                  <button className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[75%] border rounded-full left-1/2 border-primary bg-base-100">
                    <LuScanLine size={36} />
                  </button>
                </Link>
              )
            }
            <span className="w-full mr-6 -mb-5 font-light text-base-100">{!tableName ? "Scan" : "Pay Bill"}</span>
            <Link href={`/r/${customLink}/category`}>
              <center className="w-full px-2 font-light text-base-100">
                <MdOutlineMenuBook size={22} />
                Menu
              </center>
            </Link>
          </center>
        </section>
      )}

      {inputModal &&
        <BottomPopUp show={inputModal} onClose={closeModal}>
          <AddAmountModal />
        </BottomPopUp>
      }
    </>
  );
}

export default memo(BottomButton);