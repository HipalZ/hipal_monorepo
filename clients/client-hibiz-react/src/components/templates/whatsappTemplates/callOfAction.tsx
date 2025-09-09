import { memo, useState } from "react";
import { Switch, Disclosure, DisclosurePanel } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";
import useWhatsapp, { ActionType } from "@/components/store/useWhatsapp";
import {
  normalizeInput,
  useGetFlows,
} from "@/components/helpers/whatzAppHelpers";
import PopUp from "@/components/atom/popUp";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import LinkFlowsList from "./linkFlowsList";

const MemoCallOfAction = () => {
  const actionType = useWhatsapp((s) => s.actionType);
  const setActionType = useWhatsapp((s) => s.setActionType);
  const buttonText = useWhatsapp((s) => s.buttonText);
  const setButtonText = useWhatsapp((s) => s.setButtonText);
  const websiteUrl = useWhatsapp((s) => s.websiteUrl);
  const setWebsiteUrl = useWhatsapp((s) => s.setWebsiteUrl);
  const phoneNumber = useWhatsapp((s) => s.phoneNumber);
  const setPhoneNumber = useWhatsapp((s) => s.setPhoneNumber);
  const firstButtonEnable = useWhatsapp((s) => s.firstButtonEnable);
  const setFirstButtonEnable = useWhatsapp((s) => s.setFirstButtonEnable);
  const secondButtonEnable = useWhatsapp((s) => s.secondButtonEnable);
  const setSecondButtonEnable = useWhatsapp((s) => s.setSecondButtonEnable);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);
  const setSecondButtonText = useWhatsapp((s) => s.setSecondButtonText);
  const flow = useWhatsappTempStore((s) => s.flow);
  const [open, setOpen] = useState(false);

  // console.log("actionType", actionType);
  // if (actionType === "Flow") {
  //   useGetFlows();
  // }

  return (
    <div className="w-full max-w-2xl p-3 mx-auto mb-12 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold">
          Call to action{" "}
          <span className="text-sm font-medium text-gray-700">(Optional)</span>
        </h2>
        <Switch
          checked={firstButtonEnable}
          onChange={setFirstButtonEnable}
          className={`${
            firstButtonEnable ? "bg-[#075E54]" : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              firstButtonEnable ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
      <Disclosure>
        <DisclosurePanel static>
          <div
            className={`grid grid-cols-2 mt-2 gap-4 ${
              firstButtonEnable ? "" : "hidden"
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
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={ActionType.VisitWebsite}>Visit website</option>
                  <option value={ActionType.CallUs}>Call phone number</option>
                  <option value={ActionType.Flow}>Flows</option>
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
                  required={firstButtonEnable}
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
                      firstButtonEnable &&
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
                      firstButtonEnable && actionType === ActionType.CallUs
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
            {actionType === ActionType.Flow && (
              <div
                className="col-span-2 bg-blue-500 w-24 p-2 text-white rounded-lg"
                onKeyDown={() => setOpen(true)}
                onClick={() => setOpen(true)}
              >
                <label
                  htmlFor="linkflow"
                  className="cursor-pointer block text-sm font-medium"
                >
                  + Link Flow
                </label>
              </div>
            )}
            <h1>Flow:- {flow?.name}</h1>
          </div>
        </DisclosurePanel>
      </Disclosure>
      <br />
      <PopUp hide show={open} onClose={() => setOpen(false)}>
        <div className="flex justify-end">
          <Button
            className="hover:bg-red-500"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <LinkFlowsList setOpen={setOpen} />
      </PopUp>
    </div>
  );
};
const CallOfAction = memo(MemoCallOfAction);
export default CallOfAction;
