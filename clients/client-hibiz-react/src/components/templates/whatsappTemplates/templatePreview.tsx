import { memo } from "react";
import { FiExternalLink, FiChevronLeft } from "react-icons/fi";
import { BsCameraVideo, BsTelephone } from "react-icons/bs";
import pastaDummy from "@/assets/pastaDummy.png";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import whatzAppDoodle from "@/assets/whatzapp/whatsappdoodle.jpg";
import Hi from "@/assets/svg/hi.svg";
import { FaBatteryFull, FaSignal, FaWifi } from "react-icons/fa";

const MemoTemplatePreview = () => {
  const {
    headerType,
    headerText,
    imagePreview,
    bodyText,
    footerText,
    displayBodyVariableSequence,
    buttonText,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    headerText: s.headerText,
    imagePreview: s.imagePreview,
    bodyText: s.bodyText,
    footerText: s.footerText,
    displayBodyVariableSequence: s.displayBodyVariableSequence,
    buttonText: s.buttonText,
  }));

  const renderBodyText = () => {
    if (typeof bodyText !== "string") {
      return <p className="text-red-500">{bodyText}</p>;
    }

    return bodyText
      .split(/(\{\{\d+\}\})/)
      .map((part: string, index: number) => {
        const match = part.match(/\{\{(\d+)\}\}/);
        if (match) {
          const varIndex = Number.parseInt(match[1]) - 1;
          return (
            <span key={index.toString()} className="text-blue-600 break-words">
              {displayBodyVariableSequence[varIndex] || part}
            </span>
          );
        }
        return part;
      });
  };

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
        className="relative w-full h-[550px] overflow-y-auto rounded-3xl"
      >
        {/* WhatsApp Header */}
        <section className="relative flex items-end gap-3 p-2 text-black bg-white">
          <FiChevronLeft className="text-2xl text-[#34B7F1]" />
          <img
            src={Hi}
            alt="Hi"
            className="flex-shrink-0 w-6 h-6 rounded-full"
          />
          <div className="flex-1">
            <p className="font-medium">Hipalz</p>
          </div>
          <article className="flex items-center gap-4">
            <BsCameraVideo className="text-xl text-[#34B7F1]" />
            <BsTelephone className="text-xl text-[#34B7F1]" />
          </article>
        </section>

        {/* Message Content */}
        <div className="m-4 overflow-hidden bg-white shadow-md rounded-xl">
          {headerType === HeaderInterface.Image && (
            <img
              src={imagePreview || pastaDummy}
              alt="preview"
              className="object-cover w-full p-3 rounded-2xl"
              style={{
                height: "175px",
                objectFit: "cover",
                objectPosition: "0 -8px",
              }}
            />
          )}
          <div className="p-3 space-y-2">
            {headerType === HeaderInterface.Text && (
              <h3 className="text-lg font-semibold">{headerText}</h3>
            )}
            {bodyText && (
              <p className="max-w-[248px] break-words text-[0.9375rem]">
                {renderBodyText()}
              </p>
            )}
            {footerText && (
              <p className="text-xs text-gray-500">{footerText}</p>
            )}
          </div>
          <div className="border-t border-gray-100">
            <button
              type="button"
              className="flex items-center justify-center w-full py-3 text-[#34B7F1] text-sm font-medium"
            >
              <FiExternalLink className="mr-2" /> {buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* iPhone Home Indicator */}
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-black rounded-full" />
    </div>
  );
};

const TemplatePreview = memo(MemoTemplatePreview);
export default TemplatePreview;
