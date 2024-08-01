import MemoizedHeader from "@/components/molecules/header";
import { memo } from "react";
import Hi from "@/assets/svg/hi.svg";
import { SlLocationPin } from "react-icons/sl";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdOutlineSms } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import { FaHandFist } from "react-icons/fa6";
import { IoHomeOutline, IoLogoWhatsapp } from "react-icons/io5";
import { LuIndianRupee } from "react-icons/lu";
import { LiaCoinsSolid } from "react-icons/lia";
import { PiHandCoinsLight } from "react-icons/pi";

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
    symbol: <FaHandFist size={24} />,
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
    icon: <LuIndianRupee />,
    value: 1212112122,
  },
  {
    id: "2",
    text: "Average Sales",
    icon: <LuIndianRupee />,
    value: 523.25,
  },
  {
    id: "3",
    text: "Num of visits",
    icon: <IoHomeOutline />,
    value: 25,
  },
  {
    id: "4",
    text: "Num of sessions",
    icon: <SlLocationPin />,
    value: 42,
  },
  {
    id: "5",
    text: "Coinz issued",
    icon: <LiaCoinsSolid />,
    value: 225000,
  },
  {
    id: "6",
    text: "Coinz used",
    icon: <PiHandCoinsLight />,
    value: 22 % 52000,
  },
];

const MemoUserId = () => {
  return (
    <main>
      <section>
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
          className="h-[8rem] relative rounded-xl mx-6"
        >
          <article className="h-[6rem] w-[6rem] rounded-full absolute -translate-x-1/2 -top-8 left-1/2 bg-gray-200 flex items-center justify-center">
            <h1 className="text-3xl">R</h1>
          </article>
          <center className="pt-20 text-2xl text-white">Rishabh Hurshan</center>
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
      </section>
      <section className="grid grid-cols-2 gap-2 px-6 py-6 bg-white place-items-center">
        {predefinedAnalytics.map((buttons) => {
          return (
            <article
              className="border border-1 border-[#000] w-full h-[5.5rem] my-2 p-2 rounded-lg"
              key={buttons?.id}
            >
              <h1 className="flex items-center">
                {buttons?.icon} &nbsp;
                {buttons?.text}
              </h1>
              <p>{buttons?.value}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
};

const UserId = memo(MemoUserId);
export default UserId;
