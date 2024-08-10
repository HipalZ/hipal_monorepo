import React from "react";
import Explore from "./explore/page";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
const Page = ({ params }: { params: { businessId: string } }) => {
  return <Explore params={params} />;
};

export default Page;
