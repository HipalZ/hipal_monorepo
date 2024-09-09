"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import Hi from "@/assets/svg/hand.svg";
import { useParams, useRouter, usePathname } from "next/navigation";
import MemoizedHeader from "@/components/atoms/Header";
import MemoBottomButton from "@/components/molecules/bottomButton";
import useTableData from "@/components/store/useTableData";
import { useLogin } from "@/components/store/useLogin";
import { useUserToken } from "@hi/common/src/useUserToken";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { updateTheme } from "@/components/utils/themes";
const businessData = [
  {
    id: "001",
    name: "soukun",
    bizName: "RABH RAKHA HOSPITALITY LLP - Soukun cafe",
    billValue: 42000,
    serviceCost: 3500,
    months: 12,
    address: "",
    gst: "",
  },
  {
    id: "002",
    name: "stonewater",
    bizName: "S&D HOSPITALITY - Stone waters",
    billValue: 42000,
    serviceCost: 3500,
    months: 12,
    address: "",
    gst: "",
  },
  {
    id: "003",
    name: "hoist",
    bizName: "SONNET HOSPITALITY LLP - Hoist",
    billValue: 42000,
    serviceCost: 3500,
    months: 12,
    address: "",
    gst: "",
  },
  {
    id: "004",
    name: "talesoftelugu",
    bizName: "TALES OF TELUGU",
    billValue: 18000,
    serviceCost: 3000,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "005",
    name: "kebabwala",
    bizName: "Kebabwala",
    billValue: 12000,
    serviceCost: 2000,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "006",
    name: "vamsi",
    bizName: "Vamsi",
    billValue: 1,
    serviceCost: 1,
    months: 1,
    address: "",
    gst: "",
  },
  {
    id: "007",
    name: "zylk",
    bizName: "zylk",
    billValue: 18000,
    serviceCost: 3000,
    months: 6,
    address:
      "8-2-293/174/1/10 & 11, 101, 1st floor (above Ratnadeep) , S.V’s. NITYANTA ICON, road no.14, Banjara Hills, Hyderabad - 500034",
    gst: "36AADFZ4071H1Z0",
  },
];

const Invoices = ({ data }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { direction, setDirection, setInvoiceUrl, invoiceUrl, isLogin } =
    useLogin((s) => ({
      direction: s.direction,
      setDirection: s.setDirection,
      setInvoiceUrl: s.setInvoiceUrl,
      invoiceUrl: s.invoiceUrl,
      isLogin: s.isLogin,
    }));
  const setTableName = useTableData((state) => state.setTableName);
  const { setBusinessDetails } = useBusinessDetails((s) => ({
    setBusinessDetails: s.setBusinessDetails,
  }));
  const { accessToken } = useUserToken((s) => ({
    accessToken: s.accessToken,
  }));
  const businessClient = params?.business as string;
  const customLink = params?.businessId as string;

  const business = useMemo(() => {
    return (
      businessData.find((b) => b.name === businessClient) || {
        id: "",
        bizName: "",
        billValue: 0,
        serviceCost: 0,
        months: 0,
        address: "",
        gst: "",
      }
    );
  }, [businessClient]);

  const handleNavigate = useCallback(() => {
    router.push("/");
  }, []);

  const handleNavigatePayment = useCallback(() => {
    setTableName(business.bizName);
    router.push(`/${customLink}/payment?amount=${business.billValue}`);
  }, [customLink, business.billValue]);

  useEffect(() => {
    setDirection("invoice");
    setInvoiceUrl(pathname);
    setBusinessDetails(data?.data?.business);
    updateTheme(data?.data?.settings);
    if (isLogin) {
      setDirection("");
      setInvoiceUrl("");
    }
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
    }
  }, [direction, accessToken, invoiceUrl]);

  return (
    <>
      <article className="linear_gradient_background">
        <MemoizedHeader
          onBack={handleNavigate}
          title="Invoice"
          isIconBusinessShow={true}
          rightImage={Hi}
        />
      </article>
      <center className="my-6">
        <h1>HIAUG{business?.id}</h1>
      </center>
      <hr className="mx-1 my-4 border-2 border-black" />
      <article className="mx-6 text-base">
        <h1>
          <b>Billed to:</b> {business?.bizName}
        </h1>
        <h1>
          <b className="mr-8">Date: </b> 2 Aug 2024
        </h1>
        <h1>
          <b className="mr-4">Status: </b>{" "}
          <span className="text-red-500">Not Paid</span>
        </h1>
        {business?.address?.length > 0 ? (
          <h1>
            <b>Address: </b>{" "}
            <span className="text-sm">{business?.address}</span>
          </h1>
        ) : null}
        {business?.gst?.length > 0 ? (
          <h1>
            <b className="mr-2">GST No: </b>{" "}
            <span className="text-sm">{business?.gst}</span>
          </h1>
        ) : null}
      </article>
      <section
        style={{
          boxShadow: "0px 4.55px 4.55px 0px #00000040",
        }}
        className="text-[#6F649B] mx-4 mt-6 bg-[#F2F2F2] rounded-xl h-[14rem]"
      >
        <article className="p-6">
          <h1>&#9679; Service: POPCORN MODEL</h1>
          <p className="p-1 px-2 mt-2 text-sm bg-white rounded-lg">
            Rs {business?.serviceCost} for {business?.months} months{" "}
            <span className="float-right">₹ {business?.billValue}</span>
          </p>
        </article>
        <article className="px-6">
          <h1>&#9679; Tax: </h1>
          <p className="p-1 px-2 mt-2 text-sm bg-white rounded-lg">
            No Tax <span className="float-right">₹ 0</span>
          </p>
        </article>
      </section>
      <article className="text-[#6F649B] mx-10 my-6 text-xl">
        <h1 className="font-semibold">
          Grand Total <b className="float-right">₹ {business.billValue}</b>
        </h1>
      </article>
      <hr className="mx-1 my-4 border-[#000000] border-2" />
      <article className="mx-6 space-y-2 text-base">
        <h1>
          <b>Account Name : </b> PALTRIBE SOLUTIONS PTIVATE LIMITED
        </h1>
        <h1>
          <b>Account No: </b> 259177914130
        </h1>
        <h1>
          <b>IFSC Code:</b> INDB0000740
        </h1>
        <h1>
          <b>GST No : </b> 36AAMCP3900B1ZR (Composition Dealer )
        </h1>
        <h1>
          <b>CIN : </b> U72200TG2021PTC156074
        </h1>
      </article>
      <center className="pb-24 mx-4 mt-24 text-xs opacity-50">
        This is a computer generated invoice. All disputes subjected to
        exclusive jurisdiction of courts in Hyderabad{" "}
      </center>
      <MemoBottomButton>
        <div
          onClick={handleNavigatePayment}
          className={`${
            business.billValue > 0 ? "" : "opacity-20 pointer-events-none"
          } bg-black text-white py-3 px-3 rounded-full mx-6`}
        >
          <span>Pay to Hipalz ₹ {business.billValue}</span>
        </div>
      </MemoBottomButton>
    </>
  );
};

export default Invoices;
