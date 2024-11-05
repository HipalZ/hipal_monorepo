import Image from "next/image";
import { memo, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import confetti from "canvas-confetti";
import SunlightReview from "@/assets/img/reviewEllipse.png";
import ReviewCoinz from "@/assets/img/googleReviewStars.png";
import { useLogin } from "@/components/store/useLogin";

const MemoReviewModal = ({
  closeModal,
}: {
  closeModal: () => void;
}) => {
  const { googleReviewCount } = useLogin((s) => ({
    googleReviewCount: s.googleReviewCount,
  }));

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

  useEffect(() => {
    triggerConfettiBlast();
  }, []);

  return (
    <section
      className="h-[100dvh] relative z-[50] overflow-y-hidden"
      style={{
        background:
          "linear-gradient(180deg, #6A35FF 9.72%, #C7B2FF 34.68%, #C7B2FF 56.43%, #6A35FF 89.96%)",
      }}
    >
      <section className="flex items-center justify-between">
        <button
          type="button"
          onClick={closeModal}
          className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 w-[3.25rem] top-4 left-4 rounded-3xl"
        >
          <BiArrowBack className="text-black" size={20} />
        </button>
        <article className="mt-4 mr-4">
          <Image src={HipalWhiteLogo} alt="logo" className="w-auto h-auto" />
        </article>
      </section>
      <section className="absolute inset-0 flex items-center justify-center">
        <center className="absolute w-[250px] opacity-50">
          <Image
            className="animate-spin"
            width={1080}
            height={1080}
            src={SunlightReview}
            alt="SunlightReview"
          />
        </center>
        <section className="absolute inset-0 flex items-center justify-center inter">
          <svg title="Curve" viewBox="0 0 500 500">
            <path
              id="curve"
              fill="transparent"
              d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
            />
            <text width="500">
              <textPath
                xlinkHref="#curve"
                startOffset="50%"
                textAnchor="middle"
                style={{
                  fontSize: "28px",
                  fill: "white",
                  letterSpacing: "0.125em",
                }}
              >
                {googleReviewCount > 1 ? "" : "Thank you for your review!"}
              </textPath>
            </text>
          </svg>
        </section>
        <section className="absolute inset-0 flex items-center justify-center">
          <section className="absolute">
            <Image src={ReviewCoinz} alt="ReviewCoinz" />
          </section>
        </section>
      </section>
      <center className="inter absolute text-base text-[1.5rem] w-full -translate-x-1/2 top-2/3 left-1/2">
        {googleReviewCount > 1
          ? "You Have Already Submitted"
          : "Your review is under process and will be credited within 24 hours. Thank you for your patience!"}
      </center>
      <article className="fixed bottom-2 text-base text-[1.5rem] w-full -translate-x-1/2 top-3/4 left-1/2">
        <button
          type="button"
          onClick={closeModal}
          className="bottom_btn bg-[#fff] text-black text-base"
        >
          Continue
        </button>
      </article>
    </section>
  );
};

const ReviewModal = memo(MemoReviewModal);
export default ReviewModal;
