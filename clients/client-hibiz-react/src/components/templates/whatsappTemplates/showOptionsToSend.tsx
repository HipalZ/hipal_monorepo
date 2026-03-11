import { useBulkUploadContacts, useGetAllGroups } from '@/components/helpers/whatzAppHelpers';
import useBusinessData from '@/components/store/useBusinessData';
import { ShowOptions, useMessageRecipientsStore } from '@/components/store/useMessageRecipientsStore';
import useWhatsapp, { TemplateSteps } from '@/components/store/useWhatsapp';
import { cn } from '@/components/utils/helper';
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { type ChangeEvent, Fragment, memo, useCallback, useRef } from 'react';
import { BiChevronDown, BiChevronUp, BiDownload, BiUpload, BiX } from 'react-icons/bi';
import { FiUpload, FiUserPlus } from 'react-icons/fi';

const MemoShowOptionsToSend = () => {
  const options = [
    {
      value: ShowOptions.BULK_UPLOAD_CUSTOMERS,
      label: 'Bulk upload customers',
      icon: FiUpload,
    },
    { value: ShowOptions.ADD_GROUPS, label: 'Add groups', icon: FiUserPlus },
  ];
  const { selectedOptions, selectedGroups, groups, uploadedFileName, handleOptionChange, handleGroupToggle, handleRemoveFile } =
    useMessageRecipientsStore((s) => ({
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
    queryKey: ['groups', businessId],
    queryFn: fetchAllGroups,
    enabled: !!businessId && templateSteps === TemplateSteps.SHOW_OPTIONS,
  });

  return (
    <div className="space-y-4 rounded-lg bg-gray-100 p-2 lg:mx-auto">
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
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <article className={`w-full overflow-hidden rounded-lg bg-white shadow-sm ${open ? 'ring-1 ring-gray-200' : ''}`}>
                <DisclosureButton className="flex w-full items-center justify-between bg-white p-4 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75 lg:w-[30rem]">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{label}</span>
                  </div>
                  {open ? <BiChevronUp className="h-5 w-5 text-gray-500" /> : <BiChevronDown className="h-5 w-5 text-gray-500" />}
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
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                          <p className="text-sm text-gray-600">All the customers of your business</p>
                        </div>
                      )}
                      {value === ShowOptions.BULK_UPLOAD_CUSTOMERS && (
                        <div
                          className={cn(
                            'space-y-4',
                            selectedOptions.includes(ShowOptions.BULK_UPLOAD_CUSTOMERS) ? '' : 'pointer-events-none opacity-50',
                          )}
                        >
                          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">STEP 1</h3>
                              <p className="text-sm text-gray-600">Sample Template</p>
                            </div>
                            <button
                              type="button"
                              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/sample-customer.csv';
                                link.download = 'sample-customer.csv';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <BiDownload className="mr-2 inline h-4 w-4" />
                              Download
                            </button>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-2 font-semibold text-gray-900">STEP 2</h3>
                            {uploadedFileName ? (
                              <div className="flex items-center justify-between rounded-lg border-2 border-gray-300 p-4">
                                <span className="text-sm text-gray-600">{uploadedFileName}</span>
                                <button type="button" className="text-red-500 hover:text-red-700" onClick={handleRemoveFile}>
                                  <BiX className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <button
                                  type="button"
                                  onClick={bulkUpload}
                                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-100"
                                >
                                  <BiUpload className="mb-2 h-8 w-8 text-gray-400" />
                                  <p className="text-sm text-gray-600">Upload your Excel file here</p>
                                </button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  accept=".xlsx,.xls, .csv"
                                  ref={fileInputRef}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                      <div className="mx-auto w-full max-w-md">
                        {value === ShowOptions.ADD_GROUPS ? (
                          <div className="grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto rounded-lg bg-gray-50 p-2">
                            {groups?.length > 0 ? (
                              groups.map((group) => (
                                <div
                                  key={group._id}
                                  className={cn(
                                    'flex cursor-pointer flex-col justify-center overflow-hidden rounded-lg border-2 p-2 transition-all',
                                    selectedGroups.includes(group._id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                                  )}
                                  onClick={(e) => {
                                    if (e.target.type !== 'checkbox') {
                                      handleGroupToggle(group._id);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleGroupToggle(group._id);
                                    }
                                  }}
                                  tabIndex={0}
                                  role="checkbox"
                                  aria-checked={selectedGroups.includes(group._id)}
                                >
                                  <div
                                    className={cn(
                                      selectedOptions.includes(ShowOptions.ADD_GROUPS) ? '' : 'pointer-events-none opacity-50',
                                      'mb-2 flex items-center',
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      id={`group-${group._id}`}
                                      checked={selectedGroups.includes(group._id)}
                                      onChange={() => handleGroupToggle(group._id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label title={group.name} htmlFor={`group-${group._id}`} className="flex-grow cursor-pointer">
                                      <h3 className="truncate font-medium text-gray-900">{group.name}</h3>
                                      <p className="text-sm text-gray-600">{group?.userIds?.length} members</p>
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
