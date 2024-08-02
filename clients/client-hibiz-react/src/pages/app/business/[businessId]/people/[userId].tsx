import MemoizedHeader from "@/components/molecules/header";
import { memo } from "react";
import Hi from "@/assets/svg/hi.svg";
import { SlLocationPin } from "react-icons/sl";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdOutlineSms, MdWavingHand } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import { IoHomeOutline, IoLogoWhatsapp } from "react-icons/io5";
import { LuIndianRupee } from "react-icons/lu";
import { LiaCoinsSolid } from "react-icons/lia";
import { PiHandCoinsLight } from "react-icons/pi";
import { cn } from "@/components/utils/helper";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import RecentBills from "@/components/templates/people/recentBills";
import TagsAndNotes from "@/components/templates/people/tagsAndNotes";
import PopUp from "@/components/atom/popUp";
import RecentBillsPopup from "@/components/templates/people/recentBillsPopup";
import TagPopup from "@/components/templates/people/tagPopup";

const predefinedContacts = [
  {
    id: "1",
    text: "call",
    symbol: <IoMdCall size={24} />,
  },
  {
    id: "2",
    text: "sms",
    symbol: <MdOutlineSms size={24} />,
  },
  {
    id: "3",
    text: "email",
    symbol: <AiOutlineMail size={24} />,
  },
  {
    id: "4",
    text: "direct",
    symbol: <MdWavingHand size={24} />,
  },
  {
    id: "5",
    text: "whatsapp",
    symbol: <IoLogoWhatsapp size={24} />,
  },
];

const predefinedAnalytics = [
  {
    id: "1",
    text: "Total Sales",
    icon: <LuIndianRupee size={14} />,
    value: 1212112122,
  },
  {
    id: "2",
    text: "Average Sales",
    icon: <LuIndianRupee size={14} />,
    value: 523.25,
  },
  {
    id: "3",
    text: "Num of visits",
    icon: <IoHomeOutline size={14} />,
    value: 25,
  },
  {
    id: "4",
    text: "Num of sessions",
    icon: <SlLocationPin size={14} />,
    value: 42,
  },
  {
    id: "5",
    text: "Coinz issued",
    icon: <LiaCoinsSolid size={14} />,
    value: 225000,
  },
  {
    id: "6",
    text: "Coinz used",
    icon: <PiHandCoinsLight size={14} />,
    value: 22 % 52000,
  },
];

export const billsCards = [
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },

    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
  {
    _id: "66ac748597c7e0fe581e92e5",
    businessId: "66a7fcb5d1afb0385308ba63",
    date: 1722578053087,
    total: 882,
    userId: {
      _id: "66ac742fc88e8035f92c7168",
      name: "Joel",
      phone: "9539021335",
    },
    mode: "upi",
    paymentMode: "online",
    billValue: 882,
    tableName: "fbd169-T-2",
    order_id: {
      _id: "66ac746f97c7e0fe581e92df",
      businessId: "66a7fcb5d1afb0385308ba63",
      total: 882,
      currency: "INR",
      billValue: 882,
      receipt: "6yVsIxU6Zk9UMlh",
      userId: "66ac742fc88e8035f92c7168",
      tips: 0,
      claimedCoins: 0,
      discount: 0,
      order_id: "order_OfvFSN6eyN98RD",
      tableName: "fbd169-T-2",
      date: 1722578031486,
      createdAt: "2024-08-02T05:53:51.488Z",
      updatedAt: "2024-08-02T05:53:51.488Z",
      __v: 0,
    },
    tips: 0,
    razorpayPaymentId: "pay_OfvFZTMAgazx1h",
    razorpayOrderId: "order_OfvFSN6eyN98RD",
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: "458149630535",
    },
    razorpayEventId: "OfvFpmbiF0MFHE",
    earnCoins: 0,
    createdAt: "2024-08-02T05:54:13.088Z",
    updatedAt: "2024-08-02T05:54:13.088Z",
    __v: 0,
  },
];

const MemoUserId = () => {
  const sidebarItems = [
    {
      icon: Hi,
      text: "Recent Bills",
      onClick: () => setSelectedNavItem("RECENT BILLS"),
    },
    {
      icon: Hi,
      text: "Tags & Notes",
      onClick: () => setSelectedNavItem("TAGS & NOTES"),
    },
    {
      icon: Hi,
      text: "Coinz usage",
      onClick: () => setSelectedNavItem("COINZ USAGE"),
    },
  ];

  const {
    selectedNavItem,
    setSelectedNavItem,
    openBillPopup,
    setOpenBillPopup,
    openTagPopup,
    setOpenTagPopup,
  } = useHiPeopleStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    setSelectedNavItem: s.setSelectedNavItem,
    openBillPopup: s.openBillPopup,
    setOpenBillPopup: s.setOpenBillPopup,
    openTagPopup: s.openTagPopup,
    setOpenTagPopup: s.setOpenTagPopup,
  }));

  return (
    <main className="min-h-screen">
      <header>
        <MemoizedHeader
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
        <article
          style={{
            background:
              "linear-gradient(313.39deg, #4E62FF 32.64%, #B494FF 103.13%)",
          }}
          className="h-[7rem] relative rounded-xl mx-6"
        >
          <article className="h-[5rem] w-[5rem] rounded-full absolute -translate-x-1/2 -top-8 left-1/2 bg-gray-200 flex items-center justify-center">
            <h1 className="text-3xl">R</h1>
          </article>
          <center className="pt-16 text-2xl text-white">Rishabh Hurshan</center>
        </article>
        <section className="flex items-center justify-between mx-6 my-4">
          {predefinedContacts.map((contact) => {
            return (
              <section key={contact?.id} className="text-center">
                <article className="bg-[#E3DCFF] p-4 rounded-full">
                  <center>{contact?.symbol}</center>
                </article>
                <p className="text-sm text-gray-500">{contact?.text}</p>
              </section>
            );
          })}
        </section>
      </header>
      <section className="grid grid-cols-2 gap-3 px-6 py-6 bg-white md:grid-cols-4 lg:grid-cols-6 place-items-center">
        {predefinedAnalytics.map((buttons) => {
          return (
            <article
              className="border border-1 border-[#525E5F] w-full h-[5.5rem] p-2 rounded-lg space-y-4"
              key={buttons?.id}
            >
              <h1 className="flex items-center text-[#525E5F]">
                {buttons?.icon} &nbsp;
                {buttons?.text}
              </h1>
              <p className="text-[#525E5F]">{buttons?.value}</p>
            </article>
          );
        })}
      </section>
      <nav className="sticky top-0 z-50 flex justify-between w-full px-4 space-x-4 text-sm bg-white mobile-only">
        {sidebarItems.map((item) => (
          <button
            className={cn(
              "pb-3 pt-4 bg-white ",
              selectedNavItem?.toLowerCase() === item.text.toLowerCase()
                ? "border-b-2 border-[#15BBB3] transition-all text-[#15BBB3]"
                : "",
            )}
            key={item.text}
            type="button"
            onClick={item.onClick}
          >
            {item.text}
          </button>
        ))}
      </nav>
      {selectedNavItem === "RECENT BILLS" ? <RecentBills /> : null}
      {selectedNavItem === "TAGS & NOTES" ? <TagsAndNotes /> : null}
      {selectedNavItem === "RECENT BILLS" && (
        <PopUp show={openBillPopup} onClose={() => setOpenBillPopup(false)}>
          <RecentBillsPopup />
        </PopUp>
      )}
      {selectedNavItem === "TAGS & NOTES" && (
        <PopUp show={openTagPopup} onClose={() => setOpenTagPopup(false)}>
          <TagPopup />
        </PopUp>
      )}
    </main>
  );
};

const UserId = memo(MemoUserId);
export default UserId;
