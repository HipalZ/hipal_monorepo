import Image from "next/image";
import { LuArrowRight } from "react-icons/lu";
import Star from "@/assets/svg/Star.svg";
import googleImage from "@/assets/img/googleImg.png";
import { memo } from "react";

const MemoExplorePageReviewCard = ({
  signInWithGoogle,
}: { signInWithGoogle: () => void }) => {
  return (
    <div className="p-4 mb-4">
      <div
        onClick={signInWithGoogle}
        className="bg-[#FFC600] w-full min-h-full max-h-[11rem] rounded-2xl p-4 flex relative overflow-hidden"
      >
        <div className="z-10 space-y-4">
          <div className="text-black">
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
          <div className="w-full h-10 on_active_bounce">
            <button
              type="button"
              className="flex items-center px-4 py-1.5 -ml-4 text-sm font-bold text-white scale-90 rounded-full bg-black/60"
            >
              Write a review <LuArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 -right-6 z-0 w-[10rem] h-full">
          <Image
            src={googleImage}
            alt="Google Review"
            className="object-cover w-full h-full scale-150 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

const ExplorePageReviewCard = memo(MemoExplorePageReviewCard);
export default ExplorePageReviewCard;
