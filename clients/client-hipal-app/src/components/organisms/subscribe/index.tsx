import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import type { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { memo, useCallback, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import Hifi from "@/assets/login/subscribe.png";
import cat from "@/assets/login/cat.png";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import confetti from "canvas-confetti";
import SignUpBonus from "../explore/signupbonus";

const MemoSubScribeModal = ({
  setIsLoader,
  business,
  closeSubscribeModal,
  setSubscribeModal,
}: {
  setIsLoader: (value: boolean) => void;
  business: BusinessDetails;
  closeSubscribeModal: () => void;
  setSubscribeModal: (value: boolean) => void;
}) => {
  const businessData = useBusinessDetails((s) => s.businessDetails);
  const userDetails = useLogin((s) => s.userDetails);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const loyaltyInfo = useLoyaltyData((s) => s.loyaltySetting);
  const customLink = useParams()?.businessId as string;
  const [coinZ, setCoinz] = useState(0);
  const router = useRouter();

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function triggerConfettiBlast() {
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
    });
  }

  const subScribeUSer = async () => {
    const { businessId } = business ?? {};
    const { _id: userId } = userDetails;
    const { loyaltyId } = loyaltyInfo;

    const payload = {
      businessId: businessId?.toString() ?? "",
      userId: userId,
      ...(loyaltyId && { loyaltyId }),
    };

    const res = await apiRpc.subscribers.$post({
      json: payload,
    });

    const response = (await res.json()).data;
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      return router.push(`/${customLink}/user/signup`);
    }
    if (res.status === 201 || res.status === 200) {
      if (response?.reward > 0 && response?.count === 1) {
        setIsModalOpen(true);
        setCoinz(response.reward);
        triggerConfettiBlast();
        setTimeout(triggerConfettiBlast, 1000);
        setTimeout(triggerConfettiBlast, 2000);
        return;
      }
      setSubscribeModal(false);
    }
  };
  const goNext = useCallback(() => {
    setIsModalOpen(false);
    setSubscribeModal(false);
  }, [isModalOpen]);
  return (
    <section className="h-[100dvh] bg-[#748FFC] relative z-[50]">
      <section className="flex items-center justify-between">
        <button
          type="button"
          onClick={closeSubscribeModal}
          className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 w-[3.25rem] top-4 left-4 rounded-3xl"
        >
          <BiArrowBack className="text-black" size={20} />
        </button>
        <article className="mt-4 mr-4">
          <Image src={HipalWhiteLogo} alt="logo" />
        </article>
      </section>
      <section className="absolute top-[10vh] left-6 w-full z-50">
        <b className="block w-full text-4xl leading-[4.5rem] gradient-text">
          Let’s get{" "}
        </b>
        <span className="w-full text-4xl leading-6 capitalize gradient-text">
          Party started
        </span>{" "}
      </section>
      <section className="flex mt-[15vh]">
        <Image src={Hifi} alt="hi-fi" />
      </section>
      <section className="bg-white w-full h-[16rem] z-50 absolute bottom-0 rounded-t-2xl text-base">
        {businessData?.logoUrl && (
          <center className="bg-inherit text-center mx-auto w-[5rem] h-[5rem] rounded-lg flex items-center justify-center -mt-[2.5rem] p-1 border border-[#00000050] overflow-hidden">
            <Image
              className="aspect-square w-[4.75rem] h-[4.75rem]"
              width={84}
              height={84}
              src={businessData?.logoUrl}
              alt="business logo"
            />
          </center>
        )}
        {businessData?.name && (
          <div className="flex items-center justify-center mx-auto mt-2 overflow-hidden text-black rounded-lg bg-inherit">
            {businessData?.name}
          </div>
        )}
        <section className="flex items-center justify-center mt-2 text-2xl text-black">
          <Image width={48} height={48} src={cat} alt="cat" />
          Hi
        </section>
        <section className="flex items-center justify-center text-black capitalize">
          {userDetails?.name}
        </section>
      </section>
      <button
        type="button"
        onClick={subScribeUSer}
        className="bottom_btn bg-[#000000] text-white text-base"
      >
        Continue
      </button>
      <center className="absolute bottom-0 pb-2 mx-12 text-xs text-black">
        By continuing you are agreeing to the{" "}
        <small className="text-[#2364E6]">
          Terms of Service and Privacy Policy.
        </small>
      </center>

      {isModalOpen && <SignUpBonus coinZ={coinZ} goNext={goNext} />}
    </section>
  );
};

const SubScribeModal = memo(MemoSubScribeModal);
export default SubScribeModal;
