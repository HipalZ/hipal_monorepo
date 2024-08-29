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
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { RiCouponFill, RiHome4Fill } from "react-icons/ri";
import { useUserToken } from "@hi/common/src/useUserToken";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

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
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const isPayment = searchParams.get("pay");
  const customLink = useParams()?.businessId || "";
  const [selectedButton, setSelectedButton] = useState("");
  const { subscribeModal } = useLogin((s) => ({
    subscribeModal: s.subscribeModal,
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

  const handleButtonClick = useCallback((buttonName: string) => {
    setSelectedButton(buttonName);
  }, []);

  const defaultStyle = useMemo(
    () => "px-2 font-light text-base-100 active:scale-90 on_active_bounce",
    [],
  );
  if (subscribeModal) {
    return null;
  }

  return (
    <>
      {children ? (
        <center className="fixed bottom-0 z-20 py-3 w-full max-w-[30rem] bg-primary">
          {children}
        </center>
      ) : (
        <section className="fixed z-10 bottom-0 p-3 w-full max-w-[30rem] bg-primary shadow-lg">
          <center className="relative flex items-center justify-between text-xs">
            <Link href={`/${customLink}/explore`}>
              <center
                onClick={() => handleButtonClick("home")}
                className={defaultStyle}
              >
                <RiHome4Fill
                  size={20}
                  className={`mb-2 ${
                    selectedButton === "home"
                      ? "bg-base-100 text-primary rounded-2xl"
                      : ""
                  }`}
                />
                Home
              </center>
            </Link>
            <Link
              href={`/${customLink}/${accessToken ? "loyalty" : "user/signup"}`}
            >
              <center
                onClick={() => handleButtonClick("rewards")}
                className={defaultStyle}
              >
                <RiCouponFill
                  size={20}
                  className={`mb-2 ${
                    selectedButton === "rewards"
                      ? "bg-base-100 text-primary"
                      : ""
                  }`}
                />
                Rewards
              </center>
            </Link>
            {tableName && (
              <center
                onClick={() => {
                  openModal();
                  handleButtonClick("payBill");
                }}
                className={defaultStyle}
              >
                <MdAccountBalanceWallet
                  size={20}
                  className={`mb-2 ${
                    selectedButton === "payBill"
                      ? "bg-base-100 text-primary"
                      : ""
                  }`}
                />
                <span className="w-full font-light text-base-100">
                  {!tableName ? "Scan" : "Pay Bill"}
                </span>
              </center>
            )}
            {!tableName && (
              <Link href={`/${customLink}/scan`}>
                <center
                  onClick={() => handleButtonClick("scan")}
                  className={defaultStyle}
                >
                  <LuScanLine
                    size={20}
                    className={`mb-2 ${
                      selectedButton === "scan"
                        ? "bg-base-100 text-primary"
                        : ""
                    }`}
                  />
                  {!tableName ? "Scan" : "Pay Bill"}
                </center>
              </Link>
            )}
            <Link href={`/${customLink}/category`}>
              <center
                onClick={() => handleButtonClick("menu")}
                className={defaultStyle}
              >
                <MdOutlineMenuBook
                  size={20}
                  className={`mb-2 ${
                    selectedButton === "menu" ? "bg-base-100 text-primary" : ""
                  }`}
                />
                {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
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
