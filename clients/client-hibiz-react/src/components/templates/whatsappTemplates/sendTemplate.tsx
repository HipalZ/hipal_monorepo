import { Fragment, memo, useCallback } from "react";
import {
  Disclosure,
  Transition,
  RadioGroup,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { FiClock, FiSend } from "react-icons/fi";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";

const sendingOptions = [
  { value: "sendNow", label: "Send Now", icon: FiSend },
  { value: "sendLater", label: "Send Later", icon: FiClock },
];

const MemoSendTemplate = () => {
  const {
    setSendLaterTime,
    sendOptions,
    setSendOptions,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    testNumber,
    setTestNumber,
  } = useMessageRecipientsStore((s) => ({
    setSendLaterTime: s.setSendLaterTime,
    sendOptions: s.sendOptions,
    setSendOptions: s.setSendOptions,
    scheduledDate: s.scheduledDate,
    setScheduledDate: s.setScheduledDate,
    scheduledTime: s.scheduledTime,
    setScheduledTime: s.setScheduledTime,
    testNumber: s.testNumber,
    setTestNumber: s.setTestNumber,
  }));

  // handle send button click
  const handleSend = useCallback(() => {
    switch (sendOptions) {
      case "sendLater": {
        const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
        const timestamp = new Date(dateTimeString).getTime();
        setSendLaterTime(timestamp);
        break;
      }
    }
  }, [sendOptions, scheduledDate, scheduledTime, setSendLaterTime]);
  return (
    <div className="space-y-4 bg-gray-100 lg:mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        Message Sending Options
      </h2>
      <RadioGroup value={sendOptions} onChange={setSendOptions}>
        <div className="space-y-4">
          {sendingOptions.map(({ value, label, icon: Icon }) => (
            <Disclosure key={value}>
              {({ open }) => (
                <div
                  className={`w-full bg-white rounded-lg shadow-sm overflow-hidden ${
                    open ? "ring-1 ring-gray-200" : ""
                  }`}
                >
                  <DisclosureButton className="lg:w-[25rem] w-full flex items-center justify-between p-3 text-left bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={sendOptions === value}
                        onChange={() => setSendOptions(value)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    {open ? (
                      <BiChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <BiChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </DisclosureButton>
                  <Transition
                    show={open}
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <DisclosurePanel className="border-t border-gray-200">
                      <div
                        className={`text-sm text-gray-500 ${
                          sendOptions === value
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-50 pointer-events-none"
                        }`}
                      >
                        {value === "sendTest" && (
                          <div className="flex justify-between w-full gap-2 p-2 rounded-lg bg-gray-50">
                            <input
                              type="tel"
                              value={testNumber}
                              maxLength={10}
                              onChange={(e) => setTestNumber(e.target.value)}
                              placeholder="Enter test phone number"
                              className="w-64 h-10 px-3 py-2 text-gray-700 border border-gray-300 rounded-md md:w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              type="button"
                              onClick={handleSend}
                              className="h-10 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                              Send
                            </button>
                          </div>
                        )}
                        {value === "sendNow" && (
                          <div className="max-w-[25rem] p-4 text-center rounded-lg bg-gray-50">
                            <p className="mb-4">
                              Your message will be sent immediately to all
                              selected recipients.
                            </p>
                          </div>
                        )}
                        {value === "sendLater" && (
                          <div className="p-4 space-y-4 rounded-lg bg-gray-50">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label
                                  htmlFor="date"
                                  className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                  Date
                                </label>
                                <input
                                  type="date"
                                  id="date"
                                  value={scheduledDate}
                                  onChange={(e) =>
                                    setScheduledDate(e.target.value)
                                  }
                                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="flex-1">
                                <label
                                  htmlFor="time"
                                  className="block mb-1 text-sm font-medium text-gray-700"
                                >
                                  Time
                                </label>
                                <input
                                  type="time"
                                  id="time"
                                  value={scheduledTime}
                                  onChange={(e) =>
                                    setScheduledTime(e.target.value)
                                  }
                                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSend}
                              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    </DisclosurePanel>
                  </Transition>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

const SendTemplate = memo(MemoSendTemplate);
export default SendTemplate;
