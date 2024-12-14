"use client";

import { memo, useEffect } from "react";
import img from "@/assets/img/cut.png";
import type { BusinessDetails } from "@/components/types/businessData";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import ShimmerImage from "@/components/atoms/imageshimmer";

const MainBackground = (props: { explore: BusinessDetails | undefined }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const explore = props?.explore;
  const params = useParams();
  const customLink = params?.businessId as string;
  const tableName = searchParams?.get("tableName");
  const { setTableName } = useTableData();
  const setDirection = useLogin((s) => s.setDirection);

  // Move accessToken check to client side
  const accessToken = useUserToken.getState().accessToken;

  useEffect(() => {
    if (tableName !== null) {
      setTableName(tableName || "");
    }
    if (pathName.includes("/packaging")) {
      setTableName("");
    }
  }, [tableName, pathName, setTableName]);

  return (
    <section className="p-2 bg-base-100">
      <div className="relative w-full max-w-[26rem] mx-auto overflow-hidden aspect-square rounded-[2rem]">
        <ShimmerImage
          src={explore?.specialBannerUrl || img.src}
          sizes="(max-width: 414px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
          alt="Explore page wallpaper"
          width={500}
          height={500}
          priority={true}
          className="absolute top-0 z-0 object-cover object-center w-full h-full"
        />

        {/* Logo */}
        <ShimmerImage
          src={explore?.logoUrl || img.src}
          alt="Logo"
          width={110}
          height={110}
          priority={true}
          className="absolute z-20 rounded-full top-4 left-4 w-[7rem] aspect-square object-cover"
        />

        {/* Login Button */}
        <div className="absolute z-30 top-4 right-4">
          {!accessToken && (
            <Link
              href={
                customLink ? routePaths[PAGE_TYPES.SIGN_UP](customLink) : "#"
              }
            >
              <button
                onClick={() => setDirection("explore")}
                type="button"
                className="px-4 py-2 text-white transition-colors bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
              >
                Login/Sign up
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

const MemoMainBackground = memo(MainBackground);
export default MemoMainBackground;
