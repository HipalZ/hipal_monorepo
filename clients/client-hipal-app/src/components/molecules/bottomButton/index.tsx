"use client";
import React, { memo, useCallback } from "react";
import { MdOutlineMenuBook } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import { useParams, useRouter } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";

function BottomButton({
  onClick,
  children
}: {
  onClick?: () => void;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const { businessId } = useParams<{ businessId: string }>();

  const goToMenu = useCallback(() => {
    router.push(routePaths[PAGE_TYPES.CATEGORY](businessId || ""));
  }, [router, businessId]);

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
          <button onClick={goToMenu} type="button" className="on_active_bounce flex items-center justify-center w-[40%] py-3 rounded-full text-base-100 bg-primary text-sm">
            <MdOutlineMenuBook size={22} /> &nbsp;	Menu
          </button>
        </center>
      )}
    </>
  );
}

export default memo(BottomButton);