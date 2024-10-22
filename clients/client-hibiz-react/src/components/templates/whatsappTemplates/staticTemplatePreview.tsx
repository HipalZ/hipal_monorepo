import { FiExternalLink } from "react-icons/fi";
import pastaDummy from "@/assets/pastaDummy.png";
import { memo } from "react";
import useWhatsapp, { TemplateType } from "@/components/store/useWhatsapp";

const MemoMarketingCustomTemp = () => {
  const { templateType } = useWhatsapp((s) => ({
    templateType: s.templateType,
  }));
  return (
    <div className="max-w-sm p-4 bg-white rounded-lg">
      <h2 className="mb-4 text-xl font-semibold">Template Preview</h2>
      <div className="p-4 bg-[#ece5dd] rounded-lg">
        <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
          {templateType === TemplateType.Marketing ? (
            <img
              src={pastaDummy}
              alt="pasta dish"
              width={300}
              height={200}
              className="object-cover w-full h-40 mb-4 rounded-lg"
            />
          ) : null}
          <div className="space-y-2">
            <p className="font-semibold">
              Hey there! Check out our dishes now!
            </p>
            <p>
              Use code <b>FIRST</b> to get additional 10% off on your entire
              bill.
            </p>
          </div>
          <div className="my-2 text-xs text-right text-gray-500">11:59</div>
          <hr className="-mx-4" />
          {templateType === TemplateType?.Marketing ? (
            <button
              type="button"
              className="flex items-center justify-center w-full py-2 text-[#34B7F1]"
            >
              <FiExternalLink className="mr-2" /> Shop now
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center justify-center w-full pt-2 text-[#34B7F1]"
            >
              Track Shipment
            </button>
          )}
        </div>
      </div>
      <article className="gap-4 my-4">
        <h2 className="text-base">This Template is good for</h2>
        <h6 className="text-sm text-gray-600">
          Send messages about an existing an order or account
        </h6>
      </article>
    </div>
  );
};

const MarketingCustomTemp = memo(MemoMarketingCustomTemp);
export default MarketingCustomTemp;
