"use client";
import { type ButtonHTMLAttributes, memo, type ReactNode, useCallback, useEffect, useState } from "react";
import { MdOutlineAccountBalanceWallet, MdOutlineMenuBook } from "react-icons/md";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import { useParams, usePathname, useRouter } from "next/navigation";
import { RiCouponFill } from "react-icons/ri";
import { HiOutlineHome } from "react-icons/hi";

function BottomButton({
  children
}: {
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const pathname = usePathname()
  const isLoyaltyPage = pathname.includes('loyalty')
  const [inputModal, setInputModal] = useState(false);
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const { isLogin, setIsPayment, isPayment } = useLogin()
  const customLink = useParams()?.businessId || ''
  const closeModal = useCallback(() => {
    setInputModal(false);
    setIsPayment(false)
  }, [setInputModal]);

  const openModal = useCallback(() => {
    if (!isLogin) {
      setDirection("explore")
      setIsPayment(true)
      router.push(`/${customLink}/user/signup`);
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
            {isLoyaltyPage ? (
              <Link href={`/${customLink}/explore`}>
                <center className="px-2 font-light text-base-100">
                  <HiOutlineHome size={22} />
                  Home
                </center>
              </Link>
            )
              : (
                <Link href={`/${customLink}/${isLogin ? 'loyalty' : 'user/signup'}`}>
                  <center className="px-2 font-light text-base-100">
                    <RiCouponFill size={22} />
                    Rewards
                  </center>
                </Link>
              )}
            {
              tableName && (
                <button type="button" onClick={openModal} className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[80%] border rounded-full left-1/2 border-primary bg-base-100">
                  <MdOutlineAccountBalanceWallet size={36} />
                </button>
              )
            }
            {
              !tableName && (
                <Link href={`/${customLink}/scan`}>
                  <button type="button" className="absolute top-0 p-3 transform -translate-x-1/2 -translate-y-[75%] border rounded-full left-1/2 border-primary bg-base-100">
                    <LuScanLine size={36} />
                  </button>
                </Link>
              )
            }
            <span className="w-full -mb-5 -ml-4 font-light mr-76 text-base-100">{!tableName ? "Scan" : "Pay Bill"}</span>
            <Link href={`/${customLink}/category`}>
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

const MemoBottomButton = memo(BottomButton);
export default MemoBottomButton