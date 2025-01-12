"use client";;
import { memo, useCallback, useEffect } from "react";
import img from "@/assets/img/cut.png";
import type { IBusinessData } from "@/components/types/businessData";
import { usePathname, useSearchParams } from "next/navigation";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import Cat from "@/assets/login/cat.png";
import Introduction from "./introduction";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import ShimmerImage from "@/components/atoms/imageshimmer";
import Image from "next/image";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useCart } from "@/components/store/useCart";
import { useLogin } from "@/components/store/useLogin";

const MainBackground = ({ data }: { data: IBusinessData }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const tableName = searchParams?.get("tableName");
  const { setTableName } = useTableData();
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();
  const { setCheckLogin } = usePaymentStore();
  const { resetCartStoreKeys } = useCart();
  const { userDetails } = useLogin();

  // Move accessToken check to client side
  const accessToken = useUserToken.getState().accessToken;

  const handleLogin = useCallback(() => {
    setCheckLogin(true);
  }, [setCheckLogin]);

  useEffect(() => {
    if (tableName !== null) {
      setTableName(tableName || "");
      // cart store unexpected popups error handling
      resetCartStoreKeys();
    }
    if (pathName.includes("/packaging")) {
      setTableName("");
    }
  }, [tableName, pathName, setTableName]);

  useEffect(() => {
    setBusinessData(data);
    if (data?.business) {
      setBusinessDetails(data?.business);
    }
  }, [data]);

  const isVideo = (url: string) => {
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "flv", "wmv"];
    const extension = url.split(".").pop()?.toLowerCase();
    return extension ? videoExtensions.includes(extension) : false;
  };

  return (
    <section className="p-2 bg-base-100">
      <article className="relative w-full max-w-[26rem] mx-auto overflow-hidden aspect-square rounded-[2.5rem]">
        <section
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 52.05%, rgba(0, 0, 0, 0.82) 90.7%)",
          }}
          className="absolute inset-0 z-10"
        />
        <div className="absolute top-0 z-0 w-full bg-gradient">
          {isVideo(data.business?.specialBannerUrl || "") ? (
            <video
              src={data.business?.specialBannerUrl}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <ShimmerImage
              src={data.business?.specialBannerUrl || img.src}
              alt="Explore page wallpaper"
              width={500}
              height={500}
              className="object-cover object-center w-full h-full"
            />
          )}
        </div>
        {/* Logo */}
        <div className="absolute z-20 aspect-square top-4 left-4">
          <ShimmerImage
            src={data.business?.logoUrl || img.src}
            alt="Logo"
            width={64}
            height={64}
            className="object-cover rounded-full aspect-square"
          />
        </div>

        <Introduction data={data} />

        {/* Login Button */}
        <div className="absolute z-30 rounded-full top-4 right-4">
          {!accessToken && (
            <button
              onClick={handleLogin}
              type="button"
              className="px-4 py-2 text-white transition-colors bg-black bg-opacity-50 rounded-full"
            >
              Login/Sign up
            </button>
          )}
          {accessToken && (
            <h1 className="bg-primary text-base-100 font-semibold px-4 py-2.5 rounded-full">
              {userDetails?.name?.split("")[0]}
            </h1>
          )}
        </div>
      </article>
    </section>
  );
};
const MemoMainBackground = memo(MainBackground);
export default MemoMainBackground;
