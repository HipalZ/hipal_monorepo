import { IoMdCall } from "react-icons/io";
import { MdOutlineSms, MdWavingHand } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import { IoLogoWhatsapp } from "react-icons/io5";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { memo } from "react";

const MemoPredefinedContacts = () => {
  const { userDashboardDetails } = useHiPeopleStore((s) => ({
    userDashboardDetails: s.userDashboardDetails,
  }));

  const handleContactClick = (type: string, value: string) => {
    switch (type) {
      case "call":
        window.open(`tel:${value}`);
        break;
      case "sms":
        window.open(`sms:${value}`);
        break;
      case "email":
        window.open(`mailto:${value}`);
        break;
      case "whatsapp":
        window.open(`https://wa.me/${value}`);
        break;
      default:
        break;
    }
  };

  const predefinedContacts = [
    {
      id: "1",
      text: "call",
      symbol: <IoMdCall size={24} />,
      value: userDashboardDetails?.phone,
      type: "call",
    },
    {
      id: "2",
      text: "sms",
      symbol: <MdOutlineSms size={24} />,
      value: userDashboardDetails?.phone,
      type: "sms",
    },
    {
      id: "3",
      text: "email",
      symbol: <AiOutlineMail size={24} />,
      value: userDashboardDetails?.email,
      type: "email",
    },
    {
      id: "4",
      text: "direct",
      symbol: <MdWavingHand size={24} />,
      value: userDashboardDetails?.phone,
      type: "direct",
    },
    {
      id: "5",
      text: "whatsapp",
      symbol: <IoLogoWhatsapp size={24} />,
      value: userDashboardDetails?.phone,
      type: "whatsapp",
    },
  ];

  return (
    <section className="flex items-center justify-between mx-6 my-4">
      {predefinedContacts.map((contact) => (
        <section
          key={contact?.id}
          onClick={() => handleContactClick(contact?.type, contact?.value)}
          className="text-center cursor-pointer"
        >
          <article className="bg-[#E3DCFF] p-4 rounded-full">
            <center>{contact?.symbol}</center>
          </article>
          <p className="text-sm text-gray-500">{contact?.text}</p>
        </section>
      ))}
    </section>
  );
};

const PredefinedContacts = memo(MemoPredefinedContacts);
export default PredefinedContacts;
