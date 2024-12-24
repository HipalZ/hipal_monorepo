import { FaBatteryFull, FaSignal, FaWifi } from "react-icons/fa";
import whatzAppDoodle from "@/assets/whatzapp/whatsappdoodle.jpg";
import { FiChevronLeft } from "react-icons/fi";
import { BsCameraVideo, BsTelephone } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";

export default function PhoneDisplay() {
  const { bizName, logo } = useBusinessData((s) => ({
    bizName: s?.businessData?.name,
    logo: s?.businessData?.logo,
  }));
  const { displayName } = useWhatsappTempStore((s) => ({
    displayName: s.displayName,
  }));
  return (
    <div className="md:max-h-[600px] w-full max-w-[300px] mx-auto inter relative border-[10px] border-black rounded-[2rem] shadow-xl">
      {/* iPhone Notch */}
      <div className="absolute inset-x-0 top-0 h-6 rounded-b-3xl">
        <div className="absolute w-20 h-4 -translate-x-1/2 bg-black rounded-full top-1 left-1/2" />
      </div>
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs bg-white rounded-t-3xl">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <FaSignal />
          <FaWifi />
          <FaBatteryFull />
        </div>
      </div>
      {/* Screen Content */}
      <div
        style={{
          backgroundImage: `url(${whatzAppDoodle})`,
        }}
        className="relative w-full h-[550px] rounded-b-3xl overflow-y-auto"
      >
        {/* WhatsApp Header */}
        <section className="relative flex items-end gap-2 p-2 text-black bg-white">
          <FiChevronLeft className="text-2xl text-[#34B7F1]" />
          <img
            src={logo || Hi}
            alt="Hi"
            className="flex-shrink-0 w-6 h-6 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{displayName || bizName}</p>
          </div>
          <article className="flex items-center gap-4">
            <BsCameraVideo className="text-xl text-[#34B7F1]" />
            <BsTelephone className="text-xl text-[#34B7F1]" />
          </article>
        </section>
        <center className="absolute bottom-0 w-full text-xs -translate-x-1/2 -translate-y-1/2 bg-white left-1/2">
          Powered By Hipalz
        </center>
      </div>

      {/* iPhone Home Indicator */}
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-black rounded-full" />
    </div>
  );
}
