"use client";
import { memo, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { BsDownload } from "react-icons/bs";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "next/image";
import Logo from "@/assets/hipalz_blue.png";
import Invoice from "@/assets/invoice.png";
import { cn } from "@/components/utils/helpers";

const businessData = [
  {
    id: "001",
    date: "02 Aug 2024",
    name: "soukun",
    bizName: "RABH RAKHA HOSPITALITY LLP - Soukun cafe",
    status: false,
    serviceCost: 3500,
    months: 6,
    address:
      "Durgam Cheruvu Park, 2nd Entrance, Masthan Nagar, CBI Colony, Madhapur, Hyderabad, Telangana 500033",
    gst: "36ABHFR7808K1ZO",
  },
  {
    id: "002",
    date: "02 Aug 2024",
    name: "stonewater",
    bizName: "S&D HOSPITALITY - Stone waters",
    status: false,
    serviceCost: 3500,
    months: 6,
    address:
      "5th Floor, Aruna Arcade, 1299B, Road No. 1, opposite KBR Park, Jubilee Hills, Hyderabad, Telangana 500033",
    gst: "36ACRFS3563K1ZF",
  },
  {
    id: "003",
    date: "02 Aug 2024",
    name: "hoist",
    bizName: "SONNET HOSPITALITY LLP - Hoist",
    status: false,
    serviceCost: 3500,
    months: 6,
    address:
      "Plot number 217, Road No. 2, beside TDP office, Park View Enclave, Banjara Hills, Hyderabad, Telangana 500034",
    gst: "36AFCFS2869C1ZY",
  },
  {
    id: "004",
    date: "02 Aug 2024",
    name: "talesoftelugu",
    bizName: "TALES OF TELUGU",
    status: false,
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
    status: false,
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
    status: false,
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
    status: false,
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
    status: true,
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
    date: "03 Dec 2024",
    name: "skycafe",
    bizName: "AF & NS Food Pvt Ltd - Skycafe",
    status: false,
    serviceCost: 3500,
    months: 6,
    address:
      "PLOT NO: 48,49 & 50  Vinayak Nagar, Indira Nagar, Gachibowli, Hyderabad, Telangana 500032",
    gst: "36AAZCA6985E1ZW",
  },
  {
    id: "012",
    date: "16 Nov 2024",
    name: "sashtra",
    bizName: "SASHTRA WELLNESS PRIVATE LIMITED",
    status: true,
    serviceCost: 4000,
    months: 12,
    address:
      "2nd Floor:6-3-1186/A/5, Bhole Saheb Maqta Road, Behind Blue Moon Hotel, Begumpet, Hyderabad Telangana-500016",
    gst: "36ABLCS7033G1Z5",
  },
  {
    id: "013",
    date: "11 Dec 2024",
    name: "tugo",
    bizName: "SARAYU HOSPITALITY",
    status: false,
    serviceCost: 3500,
    months: 12,
    address:
      "NO-281-V-1 ROAD NO-10C OPP-BIOLOGICAL EVANS GUEST HOUSE JUBILEE HILLS Hyderabad Telangana-500033",
    gst: "36AFIFS8692B1ZL",
  },
  {
    id: "014",
    date: "14 Dec 2024",
    name: "ichata",
    bizName: "ICHATA",
    status: false,
    serviceCost: 3500,
    months: 12,
    address:
      "H.NO. 8-8-321, ROAD NO. 14 , BANJARA HILLS Hyderabad Telangana-500096",
    gst: "36AFKFS0924E1Z2",
  },
  {
    id: "015",
    date: "11 Dec 2024",
    name: "nataka",
    bizName: "Nataka Global Kitchen & Cafe",
    status: false,
    serviceCost: 4000,
    months: 12,
    address:
      "8-2-293/82/A/279/A, Road Number 10C, Jubilee Hills Hyderabad Telangana-500033",
    gst: "36ABUFM7087N1Z3",
  },
  {
    id: "016",
    date: "20 Nov 2024",
    name: "ahoy",
    bizName: "DAILY BREAD ENTERPRISES",
    status: true,
    serviceCost: 4000,
    months: 6,
    address:
      "Survey No. 35, Gundla pochampally Road, Kompally Village,Quthbullapur Hyderabad Telangana-500014",
    gst: "36AANFD8985A1Z3",
  },
  {
    id: "017",
    date: "29 Nov 2024",
    name: "papaya",
    bizName: "ANRISA FOODS LLP",
    status: false,
    serviceCost: 3500,
    months: 3,
    address: "Road 82 Jubliee hills, film nagar hyderabad Telangana-500033",
    gst: "36ABVFA3974F1ZZ",
  },
  {
    id: "018",
    date: "06 Dec 2024",
    name: "panchatantra",
    bizName: "PANCHATANTRA",
    status: true,
    serviceCost: 4000,
    months: 3,
    address:
      "Lane Number 5, Brahman Wadi, Begumpet, Hyderabad, Telangana 500016",
    gst: "",
  },
  {
    id: "018",
    date: "03 Dec 2024",
    name: "raasta",
    bizName: "raasta",
    status: false,
    serviceCost: 3500,
    months: 6,
    address:
      "SALARPURIA SATTVA KNOWLEDGE CITY, Silpa Gram Craft Village, Madhapur, Hyderabad, Telangana 500081",
    gst: "",
  },
  {
    id: "020",
    date: "10 Dec 2024",
    name: "kritanagar",
    bizName: "Kritanagar",
    status: false,
    serviceCost: 4000,
    months: 12,
    address:
      "ground floor, tower C, 40&41 phoenix primea, consulate road, beside Big Star cafe, Financial District, Nanakramguda, Telangana 500032",
    gst: "36AABFQ1417E1ZP",
  },
  {
    id: "021",
    date: "11 Dec 2024",
    name: "Cu2",
    bizName: "Cu2 Brewhouse",
    status: false,
    serviceCost: 4500,
    months: 6,
    address:
      "Ground Floor, One Golden Mile, Golden Mile Rd, Kokapet, Hyderabad, Telangana 500075",
    gst: "36AAGFF9090F1Z8",
  },
  {
    id: "022",
    date: "21 Dec 2024",
    name: "the tree stories",
    bizName: "The Tree Stories",
    status: false,
    serviceCost: 3500,
    months: 12,
    address:
      "Nagarjuna Sagar Ring Rd, Mohan Nagar, Vivekananda Colony, L. B. Nagar, Hyderabad, Telangana 500074",
    gst: "",
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
    if (!element) return;

    if (typeof window === "undefined") return; // Ensure this runs on the client-side

    // Get the window width
    const windowWidth = window.innerWidth;

    // Capture the element using html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Dynamically adjust the scale,
      width: windowWidth, // Set the width of the canvas
      allowTaint: true, // Allows tainted images
    });

    // Determine the canvas dimensions
    const canvasWidth = canvas.width > 1000 ? 1000 : canvas.width; // Use 1000px max width
    const canvasHeight = (canvas.height * canvasWidth) / canvas.width; // Maintain aspect ratio

    // Convert canvas to image data
    const imgData = canvas.toDataURL("image/png");

    // Create the PDF
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [canvasWidth, canvasHeight],
    });

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, canvasWidth, canvasHeight);

    // Save the generated PDF
    pdf.save(`invoice_${business.name}.pdf`);
  }, [business.name]);

  return (
    <section ref={printRef} className="max-w-4xl p-4 mx-auto bg-white sm:p-8">
      {/* Header */}
      <article className="flex flex-col items-center justify-between mb-6 sm:flex-row sm:items-start sm:mb-8">
        <article className="flex items-center gap-2 mb-4 sm:gap-4 sm:mb-0">
          <Image src={Logo} alt="logo" width={40} height={40} />
          <span className="text-xl sm:text-2xl text-[#838383]">Hipalz</span>
        </article>
        <article className="flex items-center gap-2 cursor-pointer md:gap-4 on_active_bounce">
          <p
            onKeyDown={handleDownloadInvoice}
            onClick={handleDownloadInvoice}
            style={{ cursor: "pointer" }}
            className="my-2 text-xs md:text-base"
          >
            Download Invoice
          </p>
          <BsDownload
            onClick={handleDownloadInvoice}
            className="text-xs md:text-xl"
          />
        </article>
        <article className="text-center sm:text-right">
          <p className="text-xl sm:text-2xl md:text-3xl text-[#838383]">
            Inv {business?.id}
          </p>
        </article>
      </article>

      {/* Company Details */}
      <section className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-8 text-sm sm:text-base text-[#838383] space-y-2 sm:space-y-0">
        <article className="text-center sm:text-left">
          <p>
            Invoice by <b>Paltribe Solutions PVT</b>
          </p>
          <p>
            GST <b>36AAMCP3900B1ZR (Composition Dealer)</b>
          </p>
        </article>
        <article className="text-center sm:text-right">
          <p>
            Email : <b>info@paltribe.in</b>
          </p>
          <p>
            Contact : <b>7386142525</b>
          </p>
        </article>
      </section>

      {/* Invoice Title */}
      <section className="flex flex-col items-center justify-between gap-4 p-3 mb-6 bg-gray-100 sm:flex-row sm:p-4 sm:mb-8 rounded-xl">
        <article className="flex items-center gap-2 md:gap-8">
          <Image
            src={Invoice}
            alt="logo"
            width={52}
            height={52}
            className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px]"
          />
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#9490FF]">
            Invoice for <b>Popcorn Plan</b>
          </h1>
        </article>
        <article className="flex justify-between w-full space-y-1 text-xs md:block sm:text-sm md:text-base sm:w-auto">
          <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-9">
            <p className="text-[#4F4F5D]">Status :</p>
            <p
              className={cn(
                business?.status ? "text-green-600" : "text-red-600",
                "rounded-full",
              )}
            >
              {business?.status ? "Paid" : "Unpaid"}
            </p>
          </div>
          <div className="flex justify-between gap-2 sm:gap-4">
            <p className="text-[#4F4F5D]">Date of invoice :</p>
            <p>{business?.date}</p>
          </div>
        </article>
      </section>

      {/* Service Details */}
      <section className="mb-6 overflow-x-auto sm:mb-8">
        <table className="w-full bg-blue-100/20">
          <thead>
            <tr className="text-sm sm:text-base md:text-lg lg:text-xl border border-gray-100 text-[#9490FF]">
              <th className="px-2 py-2 font-normal text-left border sm:px-4">
                Service / Product Description
              </th>
              <th className="px-2 py-2 font-normal text-right border sm:px-4">
                Qty
              </th>
              <th className="px-2 py-2 font-normal text-right border sm:px-4">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border border-gray-100">
              <td className="px-2 py-3 border sm:px-4 sm:py-4">
                <h3 className="mb-2 font-bold text-sm sm:text-base md:text-lg text-[#9490FF]">
                  Popcorn Pro Plan{" "}
                  <span className="text-xs sm:text-sm md:text-base font-medium text-[#838383] block mt-1">
                    Inclusive of WebApp , - Content Management, - Theme Builder,
                    - Digital Menu, -Easy Payment gateway, -Menu manager,
                    -Loyalty management, Coupon management , Bookings , Customer
                    relationship management, - WhatsApp messaging system, -
                    Staff management system.
                  </span>
                </h3>
              </td>
              <td className="px-2 sm:px-4 text-[#9490FF] py-3 sm:py-4 text-sm sm:text-base md:text-lg text-right border align-center whitespace-nowrap">
                <p className="font-bold">{business?.serviceCost}/</p>
                <p>month</p>
                <p>x {business?.months} Months</p>
              </td>
              <td className="px-2 py-3 text-sm text-right border sm:px-4 sm:py-4 sm:text-base md:text-lg align-center">
                <p className="text-[#9490FF]">
                  {(business?.months * business?.serviceCost).toLocaleString()}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Total */}
      <article className="text-[#4F4F5D] text-base sm:text-lg md:text-xl flex items-center justify-between py-4 border-t">
        <p className="font-bold">Total</p>
        <p className="font-bold">
          ₹ {(business?.months * business?.serviceCost).toLocaleString()}
        </p>
      </article>

      {/* Additional Details Section */}
      <section className="grid grid-cols-1 gap-4 pt-4 border-t sm:grid-cols-2 sm:gap-8">
        {/* Business Details */}
        <article className="bg-[#F6F8FA] p-3 sm:p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-base sm:text-lg md:text-xl text-[#838383]">
            Business details
          </h2>
          <div className="space-y-1 text-xs sm:text-sm text-[#4F4F5D]">
            <p>
              <b>Business Name :</b> {business?.bizName}
            </p>
            <p>
              <b>Address :</b> {business?.address}
            </p>
            {business?.gst?.length > 0 ? (
              <p>
                <b>GST :</b> {business?.gst}
              </p>
            ) : null}
          </div>
        </article>

        {/* Payment Options */}
        <article className="bg-[#F6F8FA] p-3 sm:p-4 rounded-lg">
          <h2 className="mb-2 font-bold text-base sm:text-lg md:text-xl text-[#838383]">
            Hipalz payment options
          </h2>
          <div className="space-y-1 text-xs sm:text-sm text-[#4F4F5D]">
            <p>
              <b>Account Holder :</b> PALTRIBE SOLUTIONS PTIVATE LIMITED
            </p>
            <p>
              <b>Account Number :</b> 259177914130
            </p>
            <p>
              <b>IFSC Code :</b> INDB0000740
            </p>
            <p>
              <b>CIN :</b> U72200TG2021PTC156074
            </p>
            <p>
              <b>PAN CARD :</b> AAMCP3900B
            </p>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer className="pt-4 mt-6 sm:mt-8 text-[10px] sm:text-xs text-center text-gray-500">
        ** This is a computer generated invoice.
        <br />
        All disputes subjected to exclusive jurisdiction of courts in Hyderabad
        **
      </footer>
    </section>
  );
};

const Invoices = memo(MemoInovices);
export default Invoices;
