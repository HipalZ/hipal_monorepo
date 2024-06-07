import { useAlert } from "@/components/store/useAlert";
import { useEffect } from "react";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { MdOutlineRedeem } from "react-icons/md";

function FooterLite() {
  const router = useRouter();
  const { businessId } = router.query as {
    businessId: string;
  };
  const currentRoute = router.pathname;
  const pathParts = currentRoute.split("/");
  const path = pathParts[pathParts.length - 1];

  const { newAlertsCount, newOrderCount } = useAlert();

  useEffect(() => {}, [newAlertsCount, newOrderCount]);

  return (
    <div className="fixed bottom-0 z-20 w-full py-2 bg-primary ">
      <div className="flex justify-around mx-6">
        <Link href={`${singleRoute[PAGE_TYPES.LOYALTY](businessId)}`}>
          <div>
            <button
              className={`${
                path === "loyalty"
                  ? "bg-base-100/80 text-primary"
                  : "bg-primary text-base-100"
              } px-4 py-1 rounded-full focus:outline-none transition duration-300`}
            >
              <MdOutlineRedeem className="text-[1.2rem]" />
            </button>

            <div className={`text-sm ml-2 font-normal text-base-100`}>Loyalty</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default FooterLite;
