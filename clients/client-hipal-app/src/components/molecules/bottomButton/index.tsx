"use client";
import React, { memo, useCallback, useState } from "react";
import { MdOutlineAccountBalanceWallet, MdOutlineMenuBook } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import { toast } from "react-toastify";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useRouter } from "next/navigation";
import { FaConciergeBell, FaMoneyBillWave } from "react-icons/fa";
import { BsBagHeart } from "react-icons/bs";

function BottomButton({
  children
}: {
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const isLogin = useLogin((s) => s.isLogin);
  const [inputModal, setInputModal] = useState(false);
  const customLink = useBusinessDetails((s) => s.businessDetails?.customLink)
  const tableName = useTableData((s) => s.tableName);

  const closeModal = useCallback(() => {
    setInputModal(false);
  }, [setInputModal]);

  const openModal = useCallback(() => {
   
    if (!isLogin) {
      router.push(`/r/${customLink}/user/signup`);
      return;
    }
    setInputModal(true);
  }, [setInputModal, tableName]);

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 p-2 w-full max-w-[30rem] bg-primary">
          {children}
        </center>
      ) : (
        <section className="fixed bottom-0 z-20 p-3 w-full max-w-[30rem] bg-primary">
          <center className="relative flex items-center justify-between px-6">
            <center className="px-2 text-sm font-thin text-base-100">
              <AiFillHome size={22} />
              Home
            </center>
            {
              tableName && (
                <button onClick={openModal} className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100">
                  <MdOutlineAccountBalanceWallet size={36} />
                </button>
              )
            }{
              !tableName && (
                <Link href="/scan">
                  <button className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100">
                    <LuScanLine size={36} />
                  </button>
                </Link>
              )
            }
            <small className="w-full -mb-6 font-thin text-base-100">{!tableName ? "Scan":"Pay"}</small>
            <Link href={`/r/${customLink}/category`}>
              <center className="w-full px-2 text-sm font-thin text-base-100">
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