import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import confetti from "canvas-confetti";
import SunlightReview from "@/assets/img/reviewEllipse.png";
import ReviewCoinz from "@/assets/img/googleReviewStars.png";
import { useLogin } from "@/components/store/useLogin";

const MemoReviewModal = ({ closeModal }: { closeModal: () => void }) => {
  const { googleReviewCount } = useLogin((s) => ({
    googleReviewCount: s.googleReviewCount,
  }));
  const [timer, setTimer] = useState(15);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const randomInRange = useCallback((min: number, max: number) => {
    return Math.random() * (max - min) + min;
  }, []);

  function triggerConfettiBlast() {
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
    });
  }

  const startTimer = useCallback(() => {
    if (!isTimerStarted) {
      setIsTimerStarted(true);
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalRef.current!);
            setShowConfetti(true);
            triggerConfettiBlast();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  }, [isTimerStarted]);

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(intervalRef.current!);
    };
  }, []);

  return (
    <section
      ref={observerRef}
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
      <h1 className="absolute text-2xl top-[25%] left-[13%]">
        {" "}
        {timer > 0 ? "Your Review in progress" : "Thank you for your review!"}
      </h1>
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
        <section className="absolute inset-0 flex items-center justify-center">
          <section className="absolute">
            {timer > 0 ? (
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#00E676"
                  strokeWidth="10"
                  strokeDasharray={`${((15 - timer) / 15) * 565} 565`}
                  transform="rotate(-90 100 100)"
                />
                <text
                  x="100"
                  y="120"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="60"
                  fontWeight="bold"
                >
                  {timer}
                </text>
              </svg>
            ) : (
              <Image src={ReviewCoinz} alt="ReviewCoinz" />
            )}
          </section>
        </section>
      </section>
      <center className="inter absolute text-base text-[1.5rem] w-full -translate-x-1/2 top-2/3 left-1/2">
        {timer > 0 ? (
          <div className="text-[1rem] font-bold text-white">
            Make sure to post review in google to get your coinz
          </div>
        ) : (
          <span className="text-[1rem] font-bold text-white">
            Thanks for your review! You have earned 40 Coinz
          </span>
        )}
      </center>
      {showConfetti && (
        <article className="fixed bottom-2 text-base text-[1.5rem] w-full -translate-x-1/2 top-3/4 left-1/2">
          <button
            type="button"
            onClick={closeModal}
            className="bottom_btn bg-[#fff] text-black text-base"
          >
            Continue
          </button>
        </article>
      )}
    </section>
  );
};

const ReviewModal = memo(MemoReviewModal);
export default ReviewModal;
