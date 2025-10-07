"use client";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import BottomPopUp from "../bottomPopUp";
import dynamic from "next/dynamic";
import { memo, useCallback } from "react";
import { useGoNext } from "@/utils/helper";
import { useLogin } from "@/components/store/useLogin";

const CombinedLogin = dynamic(
  () => import("@/components/templates/posPayment/CombinedLogin"),
);
const BirthdayPromptTimer = dynamic(() => import("../birthdayPromptTimer"));
const SignUpBonus = dynamic(
  () => import("@/components/organisms/explore/signupbonus"),
);

const MemoDynamicCombinedLogin = () => {
  const { goNext } = useGoNext();

  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const checkLogin = usePaymentStore((s) => s.checkLogin);
  const openBlastModal = usePaymentStore((s) => s.openBlastModal);
  const setOpenBlastModal = usePaymentStore((s) => s.setOpenBlastModal);
  const setSubscribeModal = useLogin((s) => s.setSubscribeModal);
  const handleNext = useCallback(() => {
    setOpenBlastModal(false);
    setCheckLogin(false);
    setSubscribeModal(false);
    goNext();
  }, [setOpenBlastModal, setCheckLogin, goNext, setSubscribeModal]);

  return (
    <>
      <BottomPopUp hide onClose={() => setCheckLogin(false)} show={checkLogin}>
        <CombinedLogin />
      </BottomPopUp>
      {openBlastModal ? <SignUpBonus goNext={handleNext} /> : null}

      {/* if the birthday campaign is true and the modal is open or the user details dob is present, show the birthday prompt */}
      <BirthdayPromptTimer />
    </>
  );
};

const DynamicCombinedLogin = memo(MemoDynamicCombinedLogin);
export default DynamicCombinedLogin;
