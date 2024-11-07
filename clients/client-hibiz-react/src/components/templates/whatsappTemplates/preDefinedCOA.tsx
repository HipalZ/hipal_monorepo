import useWhatsapp, { ActionType } from "@/components/store/useWhatsapp";
import { memo } from "react";

const MemoPreDefinedCallOfAction = () => {
  const { actionType, buttonText, setButtonText, websiteUrl, setWebsiteUrl } =
    useWhatsapp((s) => ({
      actionType: s.actionType,
      buttonText: s.buttonText,
      setButtonText: s.setButtonText,
      websiteUrl: s.websiteUrl,
      setWebsiteUrl: s.setWebsiteUrl,
    }));

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        Buttons
        <span className="ml-2 text-sm font-medium text-gray-600">
          (Optional)
        </span>
      </h2>
      <div className="max-w-3xl p-4 mx-auto bg-white rounded-lg shadow-md">
        <div className="pb-4 mb-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 text-lg font-medium text-gray-700">
            Button Name
          </h3>
          <label
            htmlFor="buttonText"
            className="block mb-2 text-xs font-medium text-gray-600"
          >
            Enter the name of the button
          </label>
          <input
            type="text"
            id="buttonText"
            value={buttonText}
            placeholder={
              actionType === ActionType.VisitWebsite
                ? ActionType.VisitWebsite
                : ActionType.CallUs
            }
            onChange={(e) => setButtonText(e.target.value)}
            maxLength={25}
            className="block w-full px-3 py-2 transition duration-150 ease-in-out border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        {actionType === ActionType.VisitWebsite && (
          <div className="pb-4 rounded-lg bg-gray-50">
            <h3 className="mb-2 text-lg font-medium text-gray-700">Link</h3>
            <label
              htmlFor="websiteUrl"
              className="block mb-2 text-xs font-medium text-gray-600"
            >
              Enter the URL to redirect
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              maxLength={2000}
              className="block w-full px-3 py-2 transition duration-150 ease-in-out border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PreDefinedCallOfAction = memo(MemoPreDefinedCallOfAction);
export default PreDefinedCallOfAction;
