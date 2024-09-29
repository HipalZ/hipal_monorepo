"use client";
import { memo, useCallback, useEffect } from "react";
import Image from "next/image";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import type { Coupon } from "@/components/types/businessData";
import { formatDate, ICouponPage } from "@/components/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { useCouponz } from "@/components/store/useCouponz";
import { useLogin } from "@/components/store/useLogin";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import ShimmerImage from "@/components/atoms/imageshimmer";

const EmblaCarousel2 = dynamic(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MemoAllCouponz = () => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;
  const { businessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
  }));
  const {
    isLogin,
    userDetails,
    setDirection: loginSetDirection,
    setUrlFrom,
  } = useLogin((s) => ({
    isLogin: s.isLogin,
    userDetails: s.userDetails,
    setDirection: s.setDirection,
    setUrlFrom: s.setUrlFrom,
  }));
  const {
    setSelectedCoupon,
    currentPage,
    couponz,
    setCouponz,
    setCurrentPage,
    setDirection,
  } = useCouponz((s) => ({
    setSelectedCoupon: s.setSelectedCoupon,
    currentPage: s.currentPage,
    couponz: s.couponz,
    setCouponz: s.setCouponz,
    setCurrentPage: s.setCurrentPage,
    setDirection: s.setDirection,
  }));

  const handleRoute = useCallback(
    (coupon: Coupon) => {
      setSelectedCoupon(coupon);
      setDirection("couponz");
      loginSetDirection("couponz");
      setUrlFrom(`/${customLink}/couponz/`);
      if (!isLogin) return router.push(`/${customLink}/user/signup`);
      router.push(`/${customLink}/couponz/`);
    },
    [currentPage, customLink, setDirection, setSelectedCoupon],
  );

  useEffect(() => {
    setCurrentPage(ICouponPage.SINGLECOUPON);
    setCouponz(couponz);
  }, [couponz, currentPage]);

  const getAllCouponz = async () => {
    const couponzResponse = await apiRpc.couponz["promot-couponz"][
      ":businessId"
    ].$get({
      param: {
        businessId: businessDetails?.businessId,
      },
      query: {
        userId: userDetails?._id,
      },
    });
    const couponz = await couponzResponse.json();
    setCouponz(couponz?.data || []);
    return couponz?.data;
  };

  useQuery({
    queryKey: ["getAllCouponz", businessDetails?.businessId],
    queryFn: getAllCouponz,
    enabled: !!businessDetails?.businessId,
  });

  if (!!couponz && couponz.length === 0) return null;

  return (
    <>
      <h2 className="py-4 mt-4 text-2xl text-center text-primary">
        My Couponz
      </h2>
      <EmblaCarousel2 customCarousel={true}>
        {couponz && couponz?.length > 0
          ? couponz.map((coupon) => {
              return (
                <article
                  onClick={() => handleRoute(coupon)}
                  onKeyDown={() => handleRoute(coupon)}
                  key={coupon?._id}
                  className="on_active_bounce bg-base-200 rounded-2xl overflow-hidden relative flex flex-row justify-between items-center m-4 text-primary h-[11.5rem] w-[20rem] px-2 shrink-0"
                >
                  <article className="flex flex-col items-start w-[60%] pl-2 -mt-6 pb-[1rem]">
                    <h4 className="text-base font-bold leading-5 text-primary">
                      {coupon?.name || "Coupon Name"}
                    </h4>
                    <p className="pt-2 text-xs text-primary">
                      Expires: {formatDate(coupon?.conditions?.couponEndDate)}
                    </p>
                    <h1 className="pt-2 text-xl font-extrabold text-primary">
                      {coupon?.config?.discountType === "PERCENTAGE" &&
                      coupon?.config?.value
                        ? `${coupon?.config?.value}% OFF`
                        : `₹${coupon?.config?.value || "0"} OFF`}
                    </h1>
                  </article>

                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`left-${i.toString()}`}
                      className="absolute w-[1.5rem] h-[1.5rem] rounded-full mt-8 bg-base-100"
                      style={{
                        left: "-14px",
                        top: `${(i + 0.2) * 20}%`,
                      }}
                    />
                  ))}

                  <article className="w-[50%] flex justify-end items-center -mt-7">
                    <ShimmerImage
                      src={coupon?.image || birthdayPlaceholder}
                      alt="coupon"
                      className="object-cover w-[8rem] h-[8rem] rounded-xl aspect-square mr-1"
                      width={100}
                      height={100}
                    />
                  </article>

                  <button
                    type="button"
                    className="absolute bottom-0 w-full py-1 -ml-2 text-sm text-secondary bg-primary"
                  >
                    Redeem Now
                  </button>
                </article>
              );
            })
          : null}
      </EmblaCarousel2>
    </>
  );
};

const AllCouponz = memo(MemoAllCouponz);
export default AllCouponz;
