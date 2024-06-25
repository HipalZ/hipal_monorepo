"use client";
import React, { memo } from "react";
import { MdOutlineAccountBalanceWallet, MdOutlineMenuBook } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";

function BottomButton({
  children
}: {
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { businessId } = useParams<{ businessId: string }>() || { businessId: "" };
  const isLogin = useLogin((s) => s.isLogin);

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 p-4 bg-base-100 w-full max-w-[30rem]">
          {children}
        </center>
      ) : (
        <center className="fixed bottom-0 z-20 text-center flex items-center justify-between py-4 px-6 bg-base-100 w-full max-w-[30rem]">
          <center className="text-sm">
            <AiFillHome size={22} />	Home
          </center>
          {isLogin ?
            <Link href={`/r/${businessId}/payment`}>
              <center className="text-sm">
                <MdOutlineAccountBalanceWallet size={22} />	Pay Bill
              </center>
            </Link> :
            <Link href={`/scan`}>
              <center className="text-sm">
                <LuScanLine size={22} />	Scan
              </center>
            </Link>
          }
          <Link href={`/r/${businessId}/category`}>
            <center className="flex items-center justify-center w-full px-10 py-3 text-sm rounded-full on_active_bounce text-base-100 bg-primary">
              <MdOutlineMenuBook size={22} /> &nbsp;	Menu
            </center>
          </Link>
        </center>
      )}
    </>
  );
}

export default memo(BottomButton);