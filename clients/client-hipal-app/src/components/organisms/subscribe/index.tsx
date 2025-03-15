import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import type { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import Image from "next/image";
import { memo } from "react";
import { BiArrowBack } from "react-icons/bi";
import Hifi from "@/assets/login/subscribe.png";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import confetti from "canvas-confetti";
import ShimmerImage from "@/components/atoms/imageshimmer";
import { useErrorHandling } from "@/utils/helper";
import { usePaymentStore } from "@/components/store/usePaymentStore";

const MemoSubScribeModal = ({
  business,
  closeSubscribeModal,
}: {
  business: BusinessDetails;
  closeSubscribeModal: () => void;
}) => {
  const { errorText } = useErrorHandling();
  const businessData = useBusinessDetails((s) => s.businessDetails);
  const { userDetails, setSubscribeModal, setUserCoinZ } = useLogin();
  const setDirection = useLogin((state) => state.setDirection);
  const loyaltyInfo = useLoyaltyData((s) => s.loyaltySetting);
  const { setCheckLogin, setOpenBlastModal } = usePaymentStore()

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
    if (res.status === 401) {
      return errorText(res.status);
    }
    const response = (await res.json()).data;
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      setDirection("explore")
      setCheckLogin(true);
      return
    }
    if (res.status === 409) {
      setSubscribeModal(false);
    }
    if (res.status === 201 || res.status === 200) {
      if (response?.reward > 0 && response?.count === 1) {
        setOpenBlastModal(true);
        setUserCoinZ(response.reward);
        triggerConfettiBlast();
        setTimeout(triggerConfettiBlast, 1000);
        setTimeout(triggerConfettiBlast, 2000);
        return;
      }
      setSubscribeModal(false);
    }
  };

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
            <ShimmerImage
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
    </section>
  );
};

const SubScribeModal = memo(MemoSubScribeModal);
export default SubScribeModal;
