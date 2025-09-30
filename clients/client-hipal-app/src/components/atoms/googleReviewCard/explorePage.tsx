import Image from "next/image";
import { LuArrowRight } from "react-icons/lu";
import Star from "@/assets/svg/Star.svg";
import googleImage from "@/assets/img/googleImg.png";
import { memo } from "react";

interface Props {
  signInWithGoogle: () => void;
  id?: string;
}

const MemoExplorePageReviewCard = ({ signInWithGoogle, id }: Props) => {
  const hasLoyalty = Boolean(!id);

  return (
    <div className="p-4 mb-4">
      {hasLoyalty ? (
        <div
          onClick={signInWithGoogle}
          onKeyDown={signInWithGoogle}
          role="button"
          tabIndex={0}
          className="bg-[#FFC600] w-full h-44 rounded-2xl p-4 flex relative overflow-hidden cursor-pointer group"
        >
          <div className="z-10 flex flex-col justify-between space-y-4">
            <div className="text-black">
              <h1 className="text-xs font-bold">Write a review &</h1>
              <p className="relative inline-flex items-center text-xl font-bold">
                Earn Coinz{" "}
                <Image
                  src={Star}
                  alt="Star"
                  width={8}
                  height={8}
                  className="absolute -right-4 -top-1"
                />
                <Image
                  src={Star}
                  alt="Star"
                  width={12}
                  height={12}
                  className="absolute -right-2 top-1"
                />
              </p>
              <p className="text-sm text-[#000000B8]">
                Leave a review on Google <br /> & Claim your reward.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md transition px-2 py-1.5 cursor-pointer group bg-gray-700 text-white"
            >
              <span className="text-sm font-medium group-hover:underline pl-2">
                Write a review
              </span>
              <LuArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>
          <div className="absolute top-0 -right-12 z-0 w-48 h-full">
            <Image
              src={googleImage}
              alt="Google Review"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
      ) : (
        <div
          onClick={signInWithGoogle}
          onKeyDown={signInWithGoogle}
          role="button"
          tabIndex={0}
          className="bg-[#FFC600] w-full h-44 rounded-2xl p-4 flex relative overflow-hidden cursor-pointer group"
        >
          <div className="z-10 flex flex-col justify-between">
            <div className="text-black space-y-1">
              <h1 className="text-xl font-bold">
                Share your experience <br /> on Google?
              </h1>
              <p className="text-sm text-[#000000B8]">
                We’d love to hear from you.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center w-40 gap-1 rounded-md transition px-2 py-1.5 cursor-pointer group bg-gray-700 text-white"
            >
              <span className="text-sm font-medium group-hover:underline pl-2">
                Write a review
              </span>
              <LuArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>
          <div className="absolute top-0 -right-12 z-0 w-48 h-full">
            <Image
              src={googleImage}
              alt="Google Review"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ExplorePageReviewCard = memo(MemoExplorePageReviewCard);
export default ExplorePageReviewCard;
