"use client";
import { memo, useCallback, useEffect } from "react";
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
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { Button } from "../../ui/button";
import { ArrowRight } from "lucide-react";
import useTableData from "@/components/store/useTableData";

const EmblaCarousel2 = dynamic(
  () => import("@/components/atoms/emblaCarousel/emblaCarousel2"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MemoAllCouponz = () => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;
  const currencySymbol = _useAllBusiness(
    (s) => s.data?.outletInfo?.currencySymbol,
  );

  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const isLogin = useLogin((s) => s.isLogin);
  const userDetails = useLogin((s) => s.userDetails);
  const loginSetDirection = useLogin((s) => s.setDirection);
  const setUrlFrom = useLogin((s) => s.setUrlFrom);
  const setSelectedCoupon = useCouponz((s) => s.setSelectedCoupon);
  const currentPage = useCouponz((s) => s.currentPage);
  const couponz = useCouponz((s) => s.couponz);
  const setCouponz = useCouponz((s) => s.setCouponz);
  const setCurrentPage = useCouponz((s) => s.setCurrentPage);
  const setDirection = useCouponz((s) => s.setDirection);
  const tableName = useTableData((s) => s.tableName);

  const handleRoute = useCallback(
    (coupon: Coupon) => {
      setSelectedCoupon(coupon);
      setDirection("couponz");
      loginSetDirection("couponz");
      setUrlFrom(`/${customLink}/couponz/`);
      if (!isLogin) {
        setCheckLogin(true);
        return;
      }
      router.push(`/${customLink}/couponz/`);
    },
    [currentPage, customLink, setDirection, setSelectedCoupon],
  );

  const goToCategory = () => {
    router.push(
      `/${customLink}/category?${tableName ? `tableName=${tableName}` : ""}`,
    );
  };

  // remove the useeffect and add this in get all couponz api
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
    queryKey: ["getAllCouponz", businessDetails?.businessId, userDetails?._id],
    queryFn: getAllCouponz,
    enabled: !!businessDetails?.businessId && !!userDetails?._id,
  });

  if (!!couponz && couponz.length === 0) return null;

  return (
    <>
      <section className="mt-4 h-[21rem] overflow-hidden">
        <h2 className="py-4 text-2xl text-center text-primary">My Couponz</h2>
        <EmblaCarousel2 customCarousel>
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
                          : `${currencySymbol}${
                              coupon?.config?.value || "0"
                            } OFF`}
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
                      className="absolute bottom-0 w-full py-1 -ml-2 text-sm text-base-100 bg-primary"
                    >
                      Redeem Now
                    </button>
                  </article>
                );
              })
            : null}
        </EmblaCarousel2>
      </section>
      <div className="w-full px-4">
        <Button
          onClick={goToCategory}
          className="w-full mx-auto bg-primary text-base-100"
        >
          Explore Menu
          <ArrowRight />
        </Button>
      </div>
    </>
  );
};

const AllCouponz = memo(MemoAllCouponz);
export default AllCouponz;
