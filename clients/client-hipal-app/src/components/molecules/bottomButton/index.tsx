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
    if (tableName === "") {
      toast.error("Please scan a table first");
      router.push(`/scan`);
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
        <center className="fixed bottom-0 z-20 text-center flex items-center justify-between py-4 px-6 bg-base-100 w-full max-w-[30rem]">
          <center className="text-sm">
            <AiFillHome size={22} />	Home
          </center>
          {!isLogin ?
            <center onClick={openModal} className="text-sm">
              <MdOutlineAccountBalanceWallet size={22} />	Pay Bill
            </center>
            :
            !tableName ?
              <Link href={`/scan`}>
                <center className="text-sm">
                  <LuScanLine size={22} />	Scan
                </center>
              </Link>
              :
              <center onClick={openModal} className="text-sm">
                <MdOutlineAccountBalanceWallet size={22} />	Pay Now
              </center>
          }
          <Link href={`/r/${customLink}/category`}>
            <center className="flex items-center justify-center w-full px-10 py-3 text-sm rounded-full on_active_bounce text-base-100 bg-primary">
              <MdOutlineMenuBook size={22} /> &nbsp;	Menu
            </center>
          </Link>
        </center>
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