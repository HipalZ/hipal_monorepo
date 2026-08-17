"use client";
import { memo } from "react";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useParams } from "next/navigation";
import Link from "next/link";

function FooterComponent() {
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const customLink = useParams()?.businessId as string;

  return (
    <>
      <center className="h-[6rem] bg-primary relative z-0 text-sm text-base-100">
        <p className="pt-4 text-xs">
          All information provided and verified by{" "}
          <strong className="capitalize">{outletInfo?.name}</strong>
        </p>
        <button
          type="button"
          className="mt-4 bg-[#ffffff50] py-1 px-2 rounded-full text-sm"
        >
          <Link className="text-xs" href={`/${customLink}/terms`}>
            View Terms and Conditions
          </Link>
        </button>
      </center>
    </>
  );
}

const FooterBanner = memo(FooterComponent);
export default FooterBanner;
