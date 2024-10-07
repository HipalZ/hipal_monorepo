"use client";
import { useCallback, useEffect, useMemo } from "react";
import Hi from "@/assets/svg/hand.svg";
import { useParams, usePathname, useRouter } from "next/navigation";
import MemoizedHeader from "@/components/atoms/Header";
import { useLogin } from "@/components/store/useLogin";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { updateTheme } from "@/components/utils/themes";
import { useUserToken } from "@hi/common/src/useUserToken";

const QrInvoices = ({ data }) => {
  const businessData = [
    {
      id: "001",
      name: "soukun",
      bizName: "RABH RAKHA HOSPITALITY LLP - Soukun cafe",
      standsNumber: 40,
      billValue: 5800,
      serviceCost: 145,
    },
    {
      id: "002",
      name: "stonewater",
      bizName: "S&D HOSPITALITY - Stone waters",
      standsNumber: 45,
      billValue: 6525,
      serviceCost: 145,
    },
    {
      id: "003",
      name: "hoist",
      bizName: "SONNET HOSPITALITY LLP - Hoist",
      standsNumber: 60,
      billValue: 8400,
      serviceCost: 145,
    },
    {
      id: "006",
      name: "vamsi",
      bizName: "Vamsi",
      standsNumber: 1,
      billValue: 1,
      serviceCost: 1,
    },
  ];

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { setBusinessDetails } = useBusinessDetails((s) => ({
    setBusinessDetails: s.setBusinessDetails,
  }));
  const businessClient = params?.business as string;
  const customLink = params?.businessId as string;
  const { direction, setDirection, setInvoiceUrl, invoiceUrl, isLogin } =
    useLogin((s) => ({
      isLogin: s.isLogin,
      direction: s.direction,
      setDirection: s.setDirection,
      setInvoiceUrl: s.setInvoiceUrl,
      invoiceUrl: s.invoiceUrl,
    }));
  const { accessToken } = useUserToken((s) => ({
    accessToken: s.accessToken,
  }));
  const business = useMemo(() => {
    return (
      businessData.find((b) => b.name === businessClient) || {
        id: "",
        bizName: "",
        standsNumber: 0,
        billValue: 0,
        serviceCost: 0,
      }
    );
  }, [businessClient]);

  const handleNavigate = useCallback(() => {
    router.push("/");
  }, []);

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
          title="Qr Invoice"
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
            Rs {business.serviceCost} for {business?.standsNumber} stands{" "}
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
          Grand Total <b className="float-right">₹ {business?.billValue}</b>
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
      <center className="mx-4 mt-16 text-xs opacity-50">
        This is a computer generated invoice. All disputes subjected to
        exclusive jurisdiction of courts in Hyderabad{" "}
      </center>
    </>
  );
};

export default QrInvoices;
