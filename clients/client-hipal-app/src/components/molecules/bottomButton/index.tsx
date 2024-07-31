"use client";
import {
  type ButtonHTMLAttributes,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  MdAccountBalanceWallet,
  MdOutlineAccountBalanceWallet,
  MdOutlineMenuBook,
} from "react-icons/md";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import { LuScanLine } from "react-icons/lu";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import AddAmountModal from "./addAmountModal";
import useTableData from "@/components/store/useTableData";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { RiCouponFill, RiHome4Fill } from "react-icons/ri";
import { HiOutlineHome } from "react-icons/hi";
import { useUserToken } from "@hi/common/src/useUserToken";

function BottomButton({
  children,
}: {
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const [inputModal, setInputModal] = useState(false);
  const searchParams = useSearchParams();
  const tableName = useTableData((s) => s.tableName);
  const setDirection = useLogin((s) => s.setDirection);
  const accessToken = useUserToken.getState().accessToken;
  const { setIsPayment } = useLogin();
  const isPayment = searchParams.get("pay");
  const customLink = useParams()?.businessId || "";
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

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 py-3 w-full max-w-[30rem] bg-primary">
          {children}
        </center>
      ) : (
        <section className="fixed bottom-0 z-20 p-3 w-full max-w-[30rem] bg-primary">
          <center className="relative flex items-center justify-between text-xs">
            <Link href={`/${customLink}/explore`}>
              <center className="px-2 font-light text-base-100">
                <RiHome4Fill size={20} className="mb-2" />
                Home
              </center>
            </Link>
            <Link
              href={`/${customLink}/${accessToken ? "loyalty" : "user/signup"}`}
            >
              <center className="px-2 font-light text-base-100">
                <RiCouponFill size={20} className="mb-2" />
                Rewards
              </center>
            </Link>
            {tableName && (
              <center
                onClick={openModal}
                className="px-2 font-light text-base-100"
              >
                <MdAccountBalanceWallet size={20} className="mb-2" />
                <span className="w-full font-light text-base-100">
                  {!tableName ? "Scan" : "Pay Bill"}
                </span>
              </center>
            )}
            {!tableName && (
              <Link href={`/${customLink}/scan`}>
                <center className="px-2 font-light text-base-100">
                  <LuScanLine size={20} className="mb-2" />
                  {!tableName ? "Scan" : "Pay Bill"}
                </center>
              </Link>
            )}
            <Link href={`/${customLink}/category`}>
              <center className="w-full px-2 font-light text-base-100">
                <MdOutlineMenuBook size={20} className="mb-2" />
                Menu
              </center>
            </Link>
          </center>
        </section>
      )}
      {inputModal && (
        <BottomPopUp show={inputModal} onClose={closeModal}>
          <AddAmountModal />
        </BottomPopUp>
      )}
    </>
  );
}

const MemoBottomButton = memo(BottomButton);
export default MemoBottomButton;
