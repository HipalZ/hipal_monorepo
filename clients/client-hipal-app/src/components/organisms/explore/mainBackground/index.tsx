"use client";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import img from "@/assets/img/cut.png";
import type { BusinessDetails } from "@/components/types/businessData";
import { useParams, useSearchParams } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";

const MainBackground = (props: { explore: BusinessDetails | undefined }) => {
  const searchParams = useSearchParams();
  const explore = props?.explore;
  const params = useParams();
  const customLink = params?.businessId as string;
  const tableName = searchParams?.get("tableName");
  const { setTableName } = useTableData();
  const setDirection = useLogin(s=>s.setDirection);

  // Move accessToken check to client side
  const accessToken = useUserToken.getState().accessToken;

  useEffect(() => {
    if (tableName !== null) {
      setTableName(tableName || "");
    }
  }, [tableName]);

  return (
    <div className="relative h-[60vh] max-h-96 overflow-hidden w-full mx-auto">
      <Image
        src={explore?.specialBannerUrl || img.src}
        quality={95}
        sizes="(max-width: 450px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
        alt={"Explore page wallpaper"}
        placeholder="blur"
        blurDataURL={getRandomBlurImg(500, 500)}
        width={500}
        height={400}
        priority={true}
      />

      <div className="absolute top-0 right-0 flex justify-between px-4 py-3 mb-10">
        { !accessToken && (
          <div className="flex flex-row space-x-2">
            <Link
              href={
                customLink ? routePaths[PAGE_TYPES.SIGN_UP](customLink) : "#"
              }
            >
              <button onClick={()=>setDirection("explore")} type="button" className="glass-morphism">
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
