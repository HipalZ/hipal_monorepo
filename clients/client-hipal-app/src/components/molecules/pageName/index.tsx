"use client";
import Image from "next/image";
import { memo } from "react";
import Logo from "@/assets/topsection/logo.svg";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useParams } from "next/navigation";
import Link from "next/link";

function FooterComponent() {
  const onBoardBusiness = () => {
    window.open("https://wa.me/9177914130", "_blank");
  };
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const customLink = useParams()?.businessId as string;

  return (
    <>
      {outletInfo?.outLetType !== "OTHER" && (
        <center className="h-[12rem] bg-primary relative z-0 text-sm text-base-100">
          <figure
            onClick={onBoardBusiness}
            className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 rounded-full -top-1/10 left-1/2 bg-base-300"
          >
            <Image
              src={Logo}
              layout="fill"
              objectFit="contain"
              alt="Hipalz Logo"
              className="p-3 rotate-12"
            />
          </figure>
          <h3 className="pt-12">Powered by Hipalz</h3>
          <p className="mt-2 text-xs">
            All information provided and verified by{" "}
            <strong className="capitalize">{outletInfo?.name}</strong>
          </p>
          <button
            type="button"
            onClick={onBoardBusiness}
            className="mt-4 bg-[#ffffff50] py-1 px-2 rounded-full text-sm"
          >
            <Link className="text-xs" href={`/${customLink}/terms`}>
              View Terms and Conditions
            </Link>
          </button>
        </center>
      )}
    </>
  );
}

const FooterBanner = memo(FooterComponent);
export default FooterBanner;
