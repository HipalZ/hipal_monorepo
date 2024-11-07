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
  }, [tableName]);

  return (
    <div className="relative w-full max-w-[30rem]  mx-auto overflow-hidden aspect-square">
      <ShimmerImage
        src={explore?.specialBannerUrl || img.src}
        sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
        alt={"Explore page wallpaper"}
        width={500}
        height={500}
        priority={true}
        className="object-cover object-center w-full h-full aspect-square"
      />

      <div className="absolute top-0 right-0 flex justify-between px-4 py-3 mb-10">
        {!accessToken && (
          <div className="flex flex-row space-x-2">
            <Link
              href={
                customLink ? routePaths[PAGE_TYPES.SIGN_UP](customLink) : "#"
              }
            >
              <button
                onClick={() => setDirection("explore")}
                type="button"
                className="glass-morphism "
              >
                Login/Sign up
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const MemoMainBackground = memo(MainBackground);
export default MemoMainBackground;
