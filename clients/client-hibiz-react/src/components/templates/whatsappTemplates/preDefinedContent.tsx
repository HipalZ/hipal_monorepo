import {
  type ChangeEvent,
  lazy,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";
import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";

const TextContent = lazy(() => import("./textContent"));
const ImageContent = lazy(() => import("./imageContent"));
interface DynamicWidthInputProps {
  value: string;
  onChange: (e: ChangeEvent) => void;
}
const DynamicWidthInput = memo(
  ({ value, onChange }: DynamicWidthInputProps) => {
    const spanRef = useRef(null);

    const inputWidth = useMemo(() => {
      if (spanRef.current) {
        return spanRef.current.offsetWidth + 20;
      }
      return 100;
    }, [spanRef]);

    return (
      <>
        <span
          ref={spanRef}
          className="absolute invisible whitespace-pre"
          style={{ fontSize: "inherit", fontFamily: "inherit" }}
        >
          {value}
        </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          style={{ width: `${inputWidth}px` }}
          className="min-w-8 inline-block px-2 py-1 mx-1 bg-[#E0F7FA] border border-none rounded-md transition-all duration-200 ease-in-out text-blue-600"
        />
      </>
    );
  },
);

const MemoPreDefinedContent = () => {
  const {
    headerType,
    bodyText,
    setBodyText,
    bodyVariables,
    setNotEditPopup,
    setBodyVariables,
  } = useWhatsapp((s) => ({
    headerType: s.headerType,
    bodyText: s.bodyText,
    setBodyText: s.setBodyText,
    bodyVariables: s.bodyVariables,
    setNotEditPopup: s.setNotEditPopup,
    setBodyVariables: s.setBodyVariables,
  }));

  const handleVariableChange = useCallback(
    (index: number, value: string) => {
      const newVariables = [...bodyVariables];
      newVariables[index] = value;
      setBodyVariables(newVariables);
    },
    [bodyVariables, setBodyVariables],
  );

  const handleBodyTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setBodyText(e.target.value);
    },
    [setBodyText],
  );

  const parsedBodyText = useMemo(() => {
    if (!bodyText) {
      return (
        <textarea
          value={bodyText || ""}
          onChange={handleBodyTextChange}
          className="w-full h-32 py-2 bg-white border-none rounded-md resize-none"
          placeholder="Write your message here..."
        />
      );
    }
    // splitting the body text into parts and rendering the variables as input fields
    return bodyText.split(/(\{\{\d+\}\})/).map((part, index) => {
      const match = part.match(/\{\{(\d+)\}\}/);
      if (match) {
        const varIndex = Number.parseInt(match[1]) - 1;
        return (
          <DynamicWidthInput
            key={index?.toString()}
            value={bodyVariables[varIndex] || ""}
            onChange={(e) => handleVariableChange(varIndex, e.target.value)}
          />
        );
      }
      return (
        <span key={index?.toString()} className="text-gray-700 break-words">
          {part}
        </span>
      );
    });
  }, [bodyText, bodyVariables, handleVariableChange, handleBodyTextChange]);

  const showWhyCantEditingPopup = useCallback(() => {
    setNotEditPopup(true);
  }, [setNotEditPopup]);

  return (
    <section className="w-full max-w-2xl p-3 mx-auto mb-4 bg-white rounded-lg shadow-md">
      {headerType === HeaderInterface.Text && <TextContent />}
      {headerType === HeaderInterface.Image && <ImageContent />}
      <div className="mb-4">
        <label
          htmlFor="bodyText"
          className="block mb-1 text-base font-bold text-black"
        >
          Message
        </label>
        <div className="w-full px-3 py-2 overflow-hidden bg-white border border-gray-300 rounded-md min-h-36">
          {parsedBodyText}
        </div>
        <button
          type="button"
          onClick={showWhyCantEditingPopup}
          onKeyDown={showWhyCantEditingPopup}
          className="mt-2 mb-4 text-sm text-red-500 underline cursor-pointer float-end underline-offset-2"
        >
          Why not completely editable?
        </button>
        <br />
      </div>
    </section>
  );
};

const PreDefinedContent = memo(MemoPreDefinedContent);
export default PreDefinedContent;
