"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";
import { updateTheme } from "@/components/utils/themes";
import type { IThemes } from "@/components/types/businessData";
const NavBarHotel = dynamic(
  () =>
    import("@/components/hotels/NavBarHotel").then((mod) => mod.NavBarHotel),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const CheckInNavbar = ({
  room,
  themeData,
}: { room: string; themeData: IThemes }) => {
  const param = useParams();
  const router = useRouter();
  const handleBack = () => {
    router.push(`/${param.businessId}/hotel`);
  };
  useEffect(() => {
    updateTheme(themeData);
  }, [themeData]);
  return (
    <NavBarHotel
      text={room || "Room Number"}
      centerText
      showBackButton={true}
      onBackClick={handleBack}
    />
  );
};

export default CheckInNavbar;
