import { type ChangeEvent, Fragment, memo, useCallback, useRef } from "react";
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
  BiUpload,
  BiX,
} from "react-icons/bi";
import { FiUpload, FiUserPlus, FiUsers } from "react-icons/fi";
import {
  ShowOptions,
  useMessageRecipientsStore,
} from "@/components/store/useMessageRecipientsStore";
import {
  useBulkUploadContacts,
  useGetAllGroups,
} from "@/components/helpers/whatzAppHelpers";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, { TemplateSteps } from "@/components/store/useWhatsapp";
import { cn } from "@/components/utils/helper";

const MemoShowOptionsToSend = () => {
  const options = [
    { value: ShowOptions.ALL_CUSTOMERS, label: "All Customers", icon: FiUsers },
    {
      value: ShowOptions.BULK_UPLOAD_CUSTOMERS,
      label: "Bulk upload customers",
      icon: FiUpload,
    },
    { value: ShowOptions.ADD_GROUPS, label: "Add groups", icon: FiUserPlus },
  ];
  const {
    selectedOptions,
    selectedGroups,
    groups,
    uploadedFileName,
    handleOptionChange,
    handleGroupToggle,
    handleRemoveFile,
  } = useMessageRecipientsStore((s) => ({
    selectedOptions: s.selectedOptions,
    selectedGroups: s.selectedGroups,
    groups: s.groups,
    uploadedFileName: s.uploadedFileName,
    handleOptionChange: s.handleOptionChange,
    handleGroupToggle: s.handleGroupToggle,
    handleRemoveFile: s.handleRemoveFile,
  }));

  const { templateSteps } = useWhatsapp((s) => ({
    templateSteps: s.templateSteps,
  }));

  const businessId = useBusinessData((s) => s.businessData?._id);

  const fileInputRef = useRef(null);
  const { fetchAllGroups } = useGetAllGroups();
  const { mutate: uploadContacts } = useBulkUploadContacts();

  const bulkUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  useQuery({
    queryKey: ["groups", businessId],
    queryFn: fetchAllGroups,
    enabled: !!businessId && templateSteps === TemplateSteps.SHOW_OPTIONS,
  });

  return (
    <div className="space-y-4 bg-gray-100 lg:mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Message Recipients</h2>
      {options.map(({ value, label, icon: Icon }) => (
        <Disclosure key={value}>
          {({ open }) => (
            <section className="flex items-center gap-2">
              <input
                type="radio"
                name="options"
                checked={selectedOptions.includes(value)}
                onChange={() => handleOptionChange(value)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <article
                className={`bg-white rounded-lg shadow-sm overflow-hidden w-full ${
                  open ? "ring-1 ring-gray-200" : ""
                }`}
              >
                <DisclosureButton className="w-full lg:w-[30rem] flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75">
                  <div className="flex items-center space-x-2">
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
                      {value === ShowOptions.ALL_CUSTOMERS && (
                        <div className="p-4 text-center rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">
                            All the customers of your business
                          </p>
                        </div>
                      )}
                      {value === ShowOptions.BULK_UPLOAD_CUSTOMERS && (
                        <div
                          className={cn(
                            "space-y-4",
                            selectedOptions.includes(
                              ShowOptions.BULK_UPLOAD_CUSTOMERS,
                            )
                              ? ""
                              : "opacity-50 pointer-events-none",
                          )}
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                STEP 1
                              </h3>
                              <p className="text-sm text-gray-600">
                                Sample Template
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
                                <button
                                  type="button"
                                  onClick={bulkUpload}
                                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-100"
                                >
                                  <BiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Upload your Excel file here
                                  </p>
                                </button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  accept=".xlsx,.xls, .csv"
                                  ref={fileInputRef}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                  ) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      uploadContacts(file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="w-full max-w-md mx-auto">
                        {value === ShowOptions.ADD_GROUPS ? (
                          <div className="p-2 rounded-lg bg-gray-50 max-h-[400px] overflow-y-auto grid grid-cols-2 gap-4">
                            {groups?.length > 0 ? (
                              groups.map((group) => (
                                <div
                                  key={group._id}
                                  className={cn(
                                    "p-2 overflow-hidden flex flex-col justify-center rounded-lg border-2 cursor-pointer transition-all",
                                    selectedGroups.includes(group._id)
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200 hover:border-green-300",
                                  )}
                                  onClick={(e) => {
                                    if (e.target.type !== "checkbox") {
                                      handleGroupToggle(group._id);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleGroupToggle(group._id);
                                    }
                                  }}
                                  tabIndex={0}
                                  role="checkbox"
                                  aria-checked={selectedGroups.includes(
                                    group._id,
                                  )}
                                >
                                  <div
                                    className={cn(
                                      selectedOptions.includes(
                                        ShowOptions.ADD_GROUPS,
                                      )
                                        ? ""
                                        : "opacity-50 pointer-events-none",
                                      "flex items-center mb-2",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      id={`group-${group._id}`}
                                      checked={selectedGroups.includes(
                                        group._id,
                                      )}
                                      onChange={() =>
                                        handleGroupToggle(group._id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 mr-2 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <label
                                      title={group.name}
                                      htmlFor={`group-${group._id}`}
                                      className="flex-grow cursor-pointer"
                                    >
                                      <h3 className="font-medium text-gray-900 truncate">
                                        {group.name}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {group?.userIds?.length} members
                                      </p>
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <center>No Groups Found</center>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </DisclosurePanel>
                </Transition>
              </article>
            </section>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

const ShowOptionsToSend = memo(MemoShowOptionsToSend);
export default ShowOptionsToSend;
