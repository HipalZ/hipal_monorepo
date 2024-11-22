import { memo } from "react";
import { Switch, Disclosure, DisclosurePanel } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import useWhatsapp, { ActionType } from "@/components/store/useWhatsapp";
import { normalizeInput } from "@/components/helpers/whatzAppHelpers";

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
    isButtonEnabled,
    setIsButtonEnabled,
  } = useWhatsapp((s) => ({
    actionType: s.actionType,
    setActionType: s.setActionType,
    buttonText: s.buttonText,
    setButtonText: s.setButtonText,
    websiteUrl: s.websiteUrl,
    setWebsiteUrl: s.setWebsiteUrl,
    phoneNumber: s.phoneNumber,
    setPhoneNumber: s.setPhoneNumber,
    isButtonEnabled: s.isButtonEnabled,
    setIsButtonEnabled: s.setIsButtonEnabled,
  }));

  return (
    <div className="w-full max-w-2xl p-3 mx-auto mb-12 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold">
          Call to action{" "}
          <span className="text-sm font-medium text-gray-700">(Optional)</span>
        </h2>
        <Switch
          checked={isButtonEnabled}
          onChange={setIsButtonEnabled}
          className={`${
            isButtonEnabled ? "bg-[#075E54]" : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              isButtonEnabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
      <Disclosure>
        {() => (
          <DisclosurePanel static>
            <div
              className={`grid grid-cols-2 mt-2 gap-4 ${
                isButtonEnabled ? "" : "hidden"
              }`}
            >
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
                    onChange={(e) =>
                      setActionType(e.target.value as ActionType)
                    }
                    className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={ActionType.VisitWebsite}>
                      Visit website
                    </option>
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
                    required={isButtonEnabled}
                    placeholder={
                      actionType === ActionType.VisitWebsite
                        ? ActionType.VisitWebsite
                        : ActionType.CallUs
                    }
                    onChange={(e) => {
                      const trimmedValue = normalizeInput(e.target.value);
                      setButtonText(trimmedValue);
                    }}
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
                      required={
                        isButtonEnabled &&
                        actionType === ActionType.VisitWebsite
                      }
                      onChange={(e) => {
                        const trimmedValue = normalizeInput(e.target.value);
                        setWebsiteUrl(trimmedValue);
                      }}
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
                <div className="relative col-span-2">
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
                      required={
                        isButtonEnabled && actionType === ActionType.CallUs
                      }
                      value={phoneNumber}
                      onChange={(e) => {
                        const trimmedValue = normalizeInput(
                          e.target.value.replace(/\D/g, ""),
                        );
                        setPhoneNumber(trimmedValue);
                      }}
                      maxLength={15}
                      className="block w-full border-gray-300 min-w-28 rounded-r-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </DisclosurePanel>
        )}
      </Disclosure>
    </div>
  );
};
const CallOfAction = memo(MemoCallOfAction);
export default CallOfAction;
