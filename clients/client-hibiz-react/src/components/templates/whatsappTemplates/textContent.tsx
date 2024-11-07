import useWhatsapp, { HeaderInterface } from "@/components/store/useWhatsapp";
import { memo, useCallback } from "react";

const MemoTextContent = () => {
  const { setHeaderType, headerText, setHeaderText } = useWhatsapp((s) => ({
    setHeaderType: s.setHeaderType,
    headerText: s.headerText,
    setHeaderText: s.setHeaderText,
  }));

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHeaderType(HeaderInterface.Text);
      setHeaderText(e.target.value);
    },
    [setHeaderType, setHeaderText],
  );

  return (
    <>
      <h2 className="mb-1 text-xl font-semibold">Content</h2>
      <label
        htmlFor="headerText"
        className="block mb-2 text-xs font-medium text-gray-600"
      >
        Enter Header Text (optional)
      </label>
      <div className="relative mb-4 bg-white rounded-lg">
        <input
          id="headerText"
          className="w-full p-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter your header text here..."
          value={headerText}
          onChange={handleTextChange}
          maxLength={512}
        />
        <p className="absolute text-xs text-right text-gray-500 bottom-1 right-1">
          {headerText?.length || 0} / 512
        </p>
      </div>
    </>
  );
};

const TextContent = memo(MemoTextContent);
export default TextContent;
