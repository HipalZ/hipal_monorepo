"use client";
import { Fragment, memo, useCallback, useState } from "react";
import {
  Disclosure,
  Transition,
  RadioGroup,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { BiChevronDown, BiChevronUp, BiSend } from "react-icons/bi";
import { FiClock, FiSend, FiSmartphone } from "react-icons/fi";

const sendingOptions = [
  { value: "sendTest", label: "Send Test Number", icon: FiSmartphone },
  { value: "sendNow", label: "Send Now", icon: FiSend },
  { value: "sendLater", label: "Send Later", icon: FiClock },
];

const MemoSendTemplate = () => {
  const [selectedOption, setSelectedOption] = useState(sendingOptions[0].value);
  const [testNumber, setTestNumber] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSend = useCallback(() => {
    switch (selectedOption) {
      case "sendTest":
        console.log("Sending test to:", testNumber);
        break;
      case "sendNow":
        console.log("Sending now");
        break;
      case "sendLater":
        console.log("Scheduled for:", scheduledDate, scheduledTime);
        break;
    }
  }, [selectedOption, testNumber, scheduledDate, scheduledTime]);

  return (
    <div className="space-y-4 bg-gray-100 lg:mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        Message Sending Options
      </h2>
      <RadioGroup value={selectedOption} onChange={setSelectedOption}>
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
                        checked={selectedOption === value}
                        onChange={() => setSelectedOption(value)}
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
                      <div className="text-sm text-gray-500">
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
                            <button
                              type="button"
                              onClick={handleSend}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                              <BiSend className="inline w-4 h-4 mr-2" />
                              Send Now
                            </button>
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
                              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                              <FiClock className="inline w-4 h-4 mr-2" />
                              Schedule Send
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
