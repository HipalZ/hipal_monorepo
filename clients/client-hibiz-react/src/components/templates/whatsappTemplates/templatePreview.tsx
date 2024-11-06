import { memo } from "react";
import { FiExternalLink } from "react-icons/fi";
import pastaDummy from "@/assets/pastaDummy.png";
import useWhatsapp from "@/components/store/useWhatsapp";

const MemoTemplatePreview = () => {
  const {
    headerType,
    headerText,
    imagePreview,
    bodyText,
    footerText,
    variables,
    buttonText,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    headerText: s.headerText,
    imagePreview: s.imagePreview,
    bodyText: s.bodyText,
    footerText: s.footerText,
    variables: s.bodyVariables,
    buttonText: s.buttonText,
  }));
  return (
    <div className="max-w-sm">
      <h2 className="mb-4 text-xl font-semibold">Template Preview</h2>
      <p className="mb-4 text-sm text-gray-600">
        Here is how your message will look like
      </p>
      <div className="p-4 bg-[#ece5dd] rounded-lg">
        <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
          {headerType === "image" && (
            <img
              src={imagePreview || pastaDummy}
              alt="pasta dish"
              width={300}
              height={200}
              className="object-cover w-full h-40 mb-4 rounded-lg"
            />
          )}
          <div className="space-y-2">
            {headerText && (
              <h3 className="text-lg font-semibold">{headerText}</h3>
            )}
            {bodyText && (
              <p>
                {bodyText
                  .split(/(\{\{\d+\}\})/)
                  .map((part: string, index: number) => {
                    const match = part.match(/\{\{(\d+)\}\}/);
                    if (match) {
                      const varIndex = Number.parseInt(match[1]) - 1;
                      return (
                        <span key={index?.toString()} className="text-blue-600">
                          {variables[varIndex] || part}
                        </span>
                      );
                    }
                    return part;
                  })}
              </p>
            )}
            {footerText && (
              <p className="text-sm text-gray-500">{footerText}</p>
            )}
          </div>
          <div className="my-2 text-xs text-right text-gray-500">11:59</div>
          <hr className="-mx-4" />
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 text-[#34B7F1]"
          >
            <FiExternalLink className="mr-2" /> {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplatePreview = memo(MemoTemplatePreview);
export default TemplatePreview;
