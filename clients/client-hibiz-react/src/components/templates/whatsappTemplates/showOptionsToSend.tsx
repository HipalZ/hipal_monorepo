"use client";
import { Fragment, memo } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from "@headlessui/react";
import {
  BiChevronDown,
  BiChevronUp,
  BiDownload,
  BiSend,
  BiUpload,
  BiX,
} from "react-icons/bi";
import { FiSend, FiUpload, FiUserPlus, FiUsers } from "react-icons/fi";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";

const options = [
  { value: "allCustomers", label: "All Customers", icon: FiUsers },
  {
    value: "bulkUploadCustomers",
    label: "Bulk upload customers",
    icon: FiUpload,
  },
  { value: "sendCustomer", label: "Send to a customer", icon: FiSend },
  { value: "addGroups", label: "Add groups", icon: FiUserPlus },
];

const MemoShowOptionsToSend = () => {
  const {
    selectedOptions,
    selectedGroups,
    customerPhone,
    totalAvailableCustomers,
    groups,
    uploadedFileName,
    handleOptionChange,
    handleGroupToggle,
    setCustomerPhone,
    handleFileUpload,
    handleRemoveFile,
  } = useMessageRecipientsStore();

  return (
    <div className="p-6 space-y-8 bg-gray-100 lg:mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Message Recipients</h2>
      {options.map(({ value, label, icon: Icon }) => (
        <Disclosure key={value}>
          {({ open }) => (
            <div
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                open ? "ring-1 ring-gray-200" : ""
              }`}
            >
              <DisclosureButton className="w-full lg:w-[30rem] flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(value)}
                    onChange={() => handleOptionChange(value)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                  <div className="p-4 text-sm text-gray-500">
                    {value === "allCustomers" && (
                      <div className="p-4 text-center rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600">
                          Total Available Customers
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {totalAvailableCustomers}
                        </p>
                      </div>
                    )}
                    {value === "bulkUploadCustomers" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              STEP 1
                            </h3>
                            <p className="text-sm text-gray-600">
                              Download Import Template
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = "/sample-customer.csv";
                              link.download = "sample-customer.csv";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <BiDownload className="inline w-4 h-4 mr-2" />
                            Download
                          </button>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <h3 className="mb-2 font-semibold text-gray-900">
                            STEP 2
                          </h3>
                          {uploadedFileName ? (
                            <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg">
                              <span className="text-sm text-gray-600">
                                {uploadedFileName}
                              </span>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                onClick={handleRemoveFile}
                              >
                                <BiX className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-100">
                                <BiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Upload your Excel file here
                                </p>
                              </div>
                              <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                    {value === "sendCustomer" && (
                      <div className="flex gap-2 p-4 rounded-lg bg-gray-50">
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Enter customer phone number"
                          className="flex-grow px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                        >
                          <BiSend className="inline w-4 h-4 mr-2" />
                          Send
                        </button>
                      </div>
                    )}
                    {value === "addGroups" && (
                      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50">
                        {groups.map((group) => (
                          <div
                            key={group.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedGroups.includes(group.id)
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={selectedGroups.includes(group.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleGroupToggle(group.id);
                                }}
                                className="w-4 h-4 mr-2 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <label
                                htmlFor={`group-${group.id}`}
                                className="flex-grow cursor-pointer"
                                onClick={() => handleGroupToggle(group.id)}
                                onKeyDown={() => handleGroupToggle(group.id)}
                              >
                                <h3 className="font-medium text-gray-900">
                                  {group.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {group.memberCount} members
                                </p>
                              </label>
                            </div>
                          </div>
                        ))}
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
  );
};

const ShowOptionsToSend = memo(MemoShowOptionsToSend);
export default ShowOptionsToSend;
