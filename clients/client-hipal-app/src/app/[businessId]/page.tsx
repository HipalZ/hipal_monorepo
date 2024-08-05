import React from "react";
import Explore from "./explore/page";

const Page = ({ params }: { params: { businessId: string } }) => {
  return <Explore params={params} />;
};

export default Page;
