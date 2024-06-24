"use client";
import React, { memo } from "react";
import { MdOutlineMenuBook } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import { useParams } from "next/navigation";
import Link from "next/link";

function BottomButton({
  onClick,
  children
}: {
  onClick?: () => void;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { businessId } = useParams<{ businessId: string }>() || { businessId: "" };

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 p-4 bg-base-100 w-full max-w-[30rem]">
          {children}
        </center>
      ) : (
          <center className="fixed bottom-0 z-20 flex items-center justify-between p-4 bg-base-100 w-full max-w-[30rem]">
            <center role="button" className="text-sm">
              <AiFillHome size={22} />	Home
          </center>
            <center role="button" className="text-sm">
              <MdOutlineMenuBook size={22} />	Pay Bill
          </center>
            <Link href={`/r/${businessId}/category`}>
              <button type="button" className="on_active_bounce flex items-center justify-center w-full py-3 px-4 rounded-full text-base-100 bg-primary text-sm">
                <MdOutlineMenuBook size={22} /> &nbsp;	Menu
          </button>
            </Link>
          </center>
        )}
    </>
  );
}

export default memo(BottomButton);