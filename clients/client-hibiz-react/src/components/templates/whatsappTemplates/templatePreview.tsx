import pastaDummy from '@/assets/pastaDummy.png';
import Hi from '@/assets/svg/hi.svg';
import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import useWhatsapp, { ActionType, HeaderInterface } from '@/components/store/useWhatsapp';
import { memo } from 'react';
import { BsCameraVideo, BsTelephone } from 'react-icons/bs';
import { FaBatteryFull, FaSignal, FaWifi } from 'react-icons/fa';
import { FiChevronLeft, FiExternalLink } from 'react-icons/fi';
import { MdOutlineReply } from 'react-icons/md';

const MemoTemplatePreview = () => {
  const headerType = useWhatsapp((s) => s.headerType);
  const headerText = useWhatsapp((s) => s.headerText);
  const imagePreview = useWhatsapp((s) => s.imagePreview);
  const bodyText = useWhatsapp((s) => s.bodyText);
  const footerText = useWhatsapp((s) => s.footerText);
  const displayBodyVariableSequence = useWhatsapp((s) => s.displayBodyVariableSequence);
  const buttonText = useWhatsapp((s) => s.buttonText);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);
  const firstButtonEnable = useWhatsapp((s) => s.firstButtonEnable);
  const secondButtonEnable = useWhatsapp((s) => s.secondButtonEnable);
  const firstActionType = useWhatsapp((s)=>s.firstActionType)
  const secondActionType = useWhatsapp((s)=>s.secondActionType)
  const renderBodyText = () => {
    if (typeof bodyText !== 'string') {
      return <p className="text-red-500">{bodyText}</p>;
    }

    return bodyText.split(/(\{\{\d+\}\})/).map((part: string, index: number) => {
      const match = part.match(/\{\{(\d+)\}\}/);
      if (match) {
        const varIndex = Number.parseInt(match[1]) - 1;
        return (
          <span key={index.toString()} className="break-words text-blue-600">
            {displayBodyVariableSequence[varIndex] || part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="inter relative mx-auto w-full max-w-[300px] rounded-[2rem] border-[10px] border-black shadow-xl md:max-h-[600px]">
      {/* iPhone Notch */}
      <div className="absolute inset-x-0 top-0 h-6 rounded-b-3xl">
        <div className="absolute left-1/2 top-1 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
      </div>
      {/* Status Bar */}
      <div className="flex items-center justify-between rounded-t-3xl bg-white px-4 py-1 text-xs">
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
        className="relative h-[550px] w-full overflow-y-auto rounded-3xl"
      >
        {/* WhatsApp Header */}
        <section className="relative flex items-end gap-3 bg-white p-2 text-black">
          <FiChevronLeft className="text-2xl text-[#34B7F1]" />
          <img src={Hi} alt="Hi" className="h-6 w-6 flex-shrink-0 rounded-full" />
          <div className="flex-1">
            <p className="font-medium">Hipalz</p>
          </div>
          <article className="flex items-center gap-4">
            <BsCameraVideo className="text-xl text-[#34B7F1]" />
            <BsTelephone className="text-xl text-[#34B7F1]" />
          </article>
        </section>

        {/* Message Content */}
        <div className="m-4 overflow-hidden rounded-xl bg-white p-2 shadow-md">
          {headerType === HeaderInterface.Image && (
            <img src={imagePreview || pastaDummy} alt="Header Preview" className="h-full w-full rounded-lg object-cover" />
          )}

          {headerType === HeaderInterface.Video && (
            <video src={imagePreview || ''} controls loop autoPlay muted playsInline className="h-full w-full rounded-lg object-cover" />
          )}

          {headerType === HeaderInterface.Document && (
            <iframe src={imagePreview || pastaDummy} title="Document Preview" className="h-full w-full rounded-lg" />
          )}

          {headerType === HeaderInterface.Audio && <audio src={imagePreview || ''} controls className="w-full rounded-lg" />}

          <div className="space-y-2 p-3">
            {headerType === HeaderInterface.Text && <h3 className="text-lg font-semibold">{headerText}</h3>}
            {bodyText && <p className="max-w-[248px] whitespace-pre-wrap break-words text-[0.9375rem]">{renderBodyText()}</p>}
            {footerText && <p className="text-xs text-gray-500">{footerText}</p>}
          </div>
          {firstButtonEnable && (
            <div className="border-t border-gray-100">
              <button type="button" className="flex w-full items-center justify-center py-3 text-sm font-medium text-[#34B7F1]">
                {firstActionType === ActionType.VisitWebsite ? (
                  <FiExternalLink className="mr-2" />
                ) : firstActionType === ActionType.CallUs ? (
                  <BsTelephone className="mr-2" />
                ) : (
                  <FiExternalLink className="mr-2" />
                )}
                {buttonText}
              </button>
            </div>
          )}
          {secondButtonEnable && (
            <div className="border-t border-gray-100">
              <button type="button" className="flex w-full items-center justify-center py-3 text-sm font-medium text-[#34B7F1]">
                {secondActionType === ActionType.VisitWebsite ? (
                  <FiExternalLink className="mr-2" />
                ) : secondActionType === ActionType.CallUs ? (
                  <BsTelephone className="mr-2" />
                ) : (
                  <MdOutlineReply className="mr-2" />
                )}
                {secondButtonText}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* iPhone Home Indicator */}
      <div className="absolute bottom-0.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-black" />
    </div>
  );
};

const TemplatePreview = memo(MemoTemplatePreview);
export default TemplatePreview;
