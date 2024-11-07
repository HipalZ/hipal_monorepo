import useWhatsapp, { ActionType } from "@/components/store/useWhatsapp";
import { memo } from "react";
import { BiChevronDown } from "react-icons/bi";

const MemoCallOfAction = () => {
  const {
    actionType,
    setActionType,
    buttonText,
    setButtonText,
    websiteUrl,
    setWebsiteUrl,
    phoneNumber,
    setPhoneNumber,
  } = useWhatsapp((s) => ({
    actionType: s.actionType,
    setActionType: s.setActionType,
    buttonText: s.buttonText,
    setButtonText: s.setButtonText,
    websiteUrl: s.websiteUrl,
    setWebsiteUrl: s.setWebsiteUrl,
    phoneNumber: s.phoneNumber,
    setPhoneNumber: s.setPhoneNumber,
  }));

  return (
    <div className="max-w-3xl mx-auto rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">
          Call to action{" "}
          <span className="text-sm font-medium text-gray-700">(Optional)</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="actionType"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Type of action
          </label>
          <div className="relative">
            <select
              id="actionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={ActionType.VisitWebsite}>Visit website</option>
              <option value={ActionType.CallUs}>Call phone number</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
              <BiChevronDown size={20} />
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="buttonText"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Button text
          </label>
          <div className="relative">
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
              className="block w-full pr-16 border-gray-300 rounded-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {buttonText?.length || 0}/25
              </span>
            </div>
          </div>
        </div>
        {actionType === ActionType.VisitWebsite && (
          <div className="col-span-2">
            <label
              htmlFor="websiteUrl"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Website URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                maxLength={2000}
                className="block w-full pr-16 border-gray-300 rounded-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {websiteUrl?.length || 0}/2000
                </span>
              </div>
            </div>
          </div>
        )}
        {actionType === ActionType.CallUs && (
          <div className="relative">
            <label
              htmlFor="phoneNumber"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-gray-500 border border-gray-300 rounded-l-md bg-gray-50 sm:text-sm">
                +91
              </span>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={15}
                className="block w-full border-gray-300 min-w-28 rounded-r-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CallOfAction = memo(MemoCallOfAction);
export default CallOfAction;
