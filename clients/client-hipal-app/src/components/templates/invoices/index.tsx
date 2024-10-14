"use client";
import { memo, useCallback, useMemo, useRef } from "react";
import Hi from "@/assets/svg/hand.svg";
import { useParams } from "next/navigation";
import MemoizedHeader from "@/components/atoms/Header";
import { BsDownload } from "react-icons/bs";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const businessData = [
  {
    id: "001",
    date: "02 Aug 2024",
    name: "soukun",
    bizName: "RABH RAKHA HOSPITALITY LLP - Soukun cafe",
    serviceCost: 3500,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "002",
    date: "02 Aug 2024",
    name: "stonewater",
    bizName: "S&D HOSPITALITY - Stone waters",
    serviceCost: 3500,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "003",
    date: "02 Aug 2024",
    name: "hoist",
    bizName: "SONNET HOSPITALITY LLP - Hoist",
    serviceCost: 3500,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "004",
    date: "02 Aug 2024",
    name: "talesoftelugu",
    bizName: "TALES OF TELUGU",
    serviceCost: 3000,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "005",
    date: "02 Aug 2024",
    name: "kebabwala",
    bizName: "Kebabwala",
    serviceCost: 2000,
    months: 6,
    address: "",
    gst: "",
  },
  {
    id: "006",
    date: "02 Aug 2024",
    name: "vamsi",
    bizName: "Vamsi",
    serviceCost: 1,
    months: 1,
    address: "",
    gst: "",
  },
  {
    id: "007",
    date: "02 Aug 2024",
    name: "zylk",
    bizName: "zylk",
    serviceCost: 3000,
    months: 6,
    address:
      "8-2-293/174/1/10 & 11, 101, 1st floor (above Ratnadeep) , S.V’s. NITYANTA ICON, road no.14, Banjara Hills, Hyderabad - 500034",
    gst: "36AADFZ4071H1Z0",
  },
  {
    id: "008",
    date: "19 Sept 2024",
    name: "lifafa",
    bizName: "lifafa",
    serviceCost: 3500,
    months: 3,
    address:
      "588/1 2 1/2, Inner Ring Rd, Survey Colony, Saraswathi Colony, Uppal, Hyderabad, Telangana 500039",
    gst: "36ALAPS3759F1ZX",
  },
  {
    id: "009",
    date: "30 Sept 2024",
    name: "cafin",
    bizName: "cafin",
    serviceCost: 3200,
    months: 12,
    address:
      "Gokul plots, 4o feet road plot no 67 & 68, venkata ramana colony, 9th Phase, Kukatpally Housing Board Colony, Hyderabad, Telangana 500085",
    gst: "",
  },
  // 10 invoice is added previously
  {
    id: "011",
    date: "08 Oct 2024",
    name: "skycafe",
    bizName: "AF & NS Food Pvt Ltd - Skycafe",
    serviceCost: 3500,
    months: 3,
    address:
      "PLOT NO: 48,49 & 50  Vinayak Nagar, Indira Nagar, Gachibowli, Hyderabad, Telangana 500032",
    gst: "36AAZCA6985E1ZW",
  },
];

const MemoInovices = () => {
  const params = useParams();
  const printRef = useRef<HTMLDivElement | null>(null);

  const businessClient = params?.business as string;
  const business = useMemo(() => {
    return (
      businessData.find((b) => b.name === businessClient) || {
        id: "",
        date: "",
        name: "",
        bizName: "",
        serviceCost: 0,
        months: 0,
        address: "",
        gst: "",
      }
    );
  }, [businessClient]);

  const handleDownloadInvoice = useCallback(async () => {
    const element = printRef?.current;
    if (element === null) return;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`invoice_${business.name}.pdf`);
  }, [business.name]);

  return (
    <>
      <article className="linear_gradient_background">
        <MemoizedHeader
          title="Invoice"
          isIconBusinessShow={true}
          rightImage={Hi}
          hideBack
        />
      </article>
      <section ref={printRef}>
        <center className="my-6">
          <h1>HIAUG{business?.id}</h1>
          <article className="cursor-pointer on_active_bounce">
            <p
              onKeyDown={handleDownloadInvoice}
              onClick={handleDownloadInvoice}
              style={{ cursor: "pointer" }}
              className="my-2 text-xs"
            >
              Download Invoice
            </p>
            <BsDownload size={20} onClick={handleDownloadInvoice} />
          </article>
        </center>
        <hr className="mx-1 my-4 border-2 border-black" />
        <article className="mx-6 text-base capitalize">
          <h1>
            <b>Billed to:</b> {business?.bizName}
          </h1>
          <h1>
            <b className="mr-8">Date: </b> {business?.date}
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
          className="text-[#6F649B] mx-4 mt-6 bg-[#F2F2F2] rounded-xl h-[7rem]"
        >
          <article className="p-6">
            <h1>&#9679; Service: POPCORN MODEL</h1>
            <p className="p-1 px-2 mt-2 text-sm bg-white rounded-lg">
              Rs {business?.serviceCost} for {business?.months} months{" "}
              <span className="float-right">
                ₹ {business?.serviceCost * business?.months}
              </span>
            </p>
          </article>
        </section>
        <article className="text-[#6F649B] mx-10 my-6 text-xl">
          <h1 className="font-semibold">
            Grand Total{" "}
            <b className="float-right">
              ₹ {business?.serviceCost * business?.months}
            </b>
          </h1>
        </article>
        <hr className="mx-1 my-4 border-[#000000] border-2" />
        <article className="mx-6 text-base">
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
      </section>
    </>
  );
};

const Invoices = memo(MemoInovices);
export default Invoices;
