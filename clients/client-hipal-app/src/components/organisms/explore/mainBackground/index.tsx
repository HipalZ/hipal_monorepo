"use client";

import { memo, useEffect } from "react";
import img from "@/assets/img/cut.png";
import type { IBusinessData } from "@/components/types/businessData";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import useTableData from "@/components/store/useTableData";
import { useUserToken } from "@hi/common/src/useUserToken";
import Link from "next/link";
import { useLogin } from "@/components/store/useLogin";
import ShimmerImage from "@/components/atoms/imageshimmer";
import Cat from "@/assets/login/cat.png";
import Introduction from "./introduction";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";

const MainBackground = ({ data }: { data: IBusinessData }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const params = useParams();
  const customLink = params?.businessId as string;
  const tableName = searchParams?.get("tableName");
  const { setTableName } = useTableData();
  const setDirection = useLogin((s) => s.setDirection);
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();

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

  useEffect(() => {
    setBusinessData(data);
    if (data?.business) {
      setBusinessDetails(data.business);
    }
  }, [data]);

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
          <ShimmerImage
            src={data.business?.specialBannerUrl || img.src}
            alt="Explore page wallpaper"
            width={500}
            height={500}
            className="object-cover object-center w-full h-full"
          />
        </div>
        {/* Logo */}
        <div className="absolute z-20 aspect-square top-4 left-4">
          <ShimmerImage
            src={data.business?.logoUrl || img.src}
            alt="Logo"
            width={58}
            height={58}
            className="object-cover rounded-full aspect-square"
          />
        </div>

        <Introduction data={data} />

        {/* Login Button */}
        <div className="absolute z-30 rounded-full top-4 right-4">
          {!accessToken ? (
            <Link
              href={
                customLink ? routePaths[PAGE_TYPES.SIGN_UP](customLink) : "#"
              }
            >
              <button
                onClick={() => setDirection("explore")}
                type="button"
                className="px-4 py-2 text-white transition-colors bg-black bg-opacity-50 rounded-full"
              >
                Login/Sign up
              </button>
            </Link>
          ) : (
            <figure className="aspect-square bg-[#ffffff30] rounded-full bg-white">
              <ShimmerImage
                src={Cat.src}
                alt="Avatar"
                width={58}
                height={58}
                className="object-cover rounded-full aspect-square"
              />
            </figure>
          )}
        </div>
      </article>
    </section>
  );
};

const MemoMainBackground = memo(MainBackground);
export default MemoMainBackground;
