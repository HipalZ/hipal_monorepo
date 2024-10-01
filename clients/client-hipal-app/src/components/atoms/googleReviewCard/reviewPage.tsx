import Image from "next/image";
import { LuArrowRight } from "react-icons/lu";
import Star from "@/assets/svg/Star.svg";
import googleImage from "@/assets/img/googleImg.png";
import { memo } from "react";

const MemoGoogleReviewPagePopup = ({
  signInWithGoogle,
}: { signInWithGoogle: () => void }) => {
  return (
    <div className="z-10 p-2 mb-4">
      <div className="bg-[#FFC600] lg:w-1/2 w-full min-h-full h-[16rem] rounded-2xl p-4 flex relative overflow-hidden">
        <div className="z-10 flex flex-col justify-center">
          <div className="space-y-2 text-black">
            <h1 className="text-xs font-bold">Write a review &</h1>
            <p className="relative inline-flex items-center text-xl font-bold">
              Earn Coinz{" "}
              <Image
                src={Star}
                alt="Star"
                width={8}
                height={8}
                className="absolute transform translate-x-1/2 -translate-y-1/2 -right-4 -top-1"
              />
              <Image
                src={Star}
                alt="Star"
                width={12}
                height={12}
                className="absolute transform translate-x-1/2 -translate-y-1/2 top-1 -right-2"
              />
            </p>
            <p className="text-sm text-[#000000B8]">
              Leave a review on Google <br /> & Claim your reward.
            </p>
          </div>
        </div>
        <div className="absolute top-0 z-0 h-full -right-12">
          <Image
            src={googleImage}
            alt="Google Review"
            className="object-cover h-full rounded-md"
          />
        </div>
      </div>
      <div className="relative z-20 w-full h-16">
        <button
          type="button"
          onClick={signInWithGoogle}
          className="z-30 flex items-center justify-center w-full p-3 mt-4 text-sm font-bold text-white bg-black rounded-full"
        >
          Write a review <LuArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const GoogleReviewPagePopup = memo(MemoGoogleReviewPagePopup);
export default GoogleReviewPagePopup;
