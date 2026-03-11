import { useMessageRecipientsStore } from '@/components/store/useMessageRecipientsStore';
import { Disclosure, DisclosureButton, DisclosurePanel, RadioGroup, Transition } from '@headlessui/react';
import { Fragment, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { FiSend } from 'react-icons/fi';

const sendingOptions = [{ value: 'sendNow', label: 'Send Now', icon: FiSend }];

const MemoSendTemplate = () => {
  const { setSendLaterTime, sendOptions, setSendOptions, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime } =
    useMessageRecipientsStore((s) => ({
      setSendLaterTime: s.setSendLaterTime,
      sendOptions: s.sendOptions,
      setSendOptions: s.setSendOptions,
      scheduledDate: s.scheduledDate,
      setScheduledDate: s.setScheduledDate,
      scheduledTime: s.scheduledTime,
      setScheduledTime: s.setScheduledTime,
    }));

  // handle send button click
  const handleSend = useCallback(() => {
    const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
    const timestamp = new Date(dateTimeString).getTime();
    setSendLaterTime(timestamp);
    toast.success('Message scheduled successfully');
  }, [scheduledDate, scheduledTime, setSendLaterTime]);

  return (
    <div className="space-y-4 rounded-lg bg-gray-100 p-2 lg:mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Message Sending Options</h2>
      <RadioGroup value={sendOptions} onChange={setSendOptions}>
        <div className="space-y-4">
          {sendingOptions.map(({ value, label, icon: Icon }) => (
            <Disclosure key={value}>
              {({ open }) => (
                <div className={`w-full overflow-hidden rounded-lg bg-white shadow-sm ${open ? 'ring-1 ring-gray-200' : ''}`}>
                  <DisclosureButton className="flex w-full items-center justify-between bg-white p-3 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75 lg:w-[25rem]">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={sendOptions === value}
                        onChange={() => {
                          setSendOptions(value);
                        }}
                        className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
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
                      <div
                        className={`text-sm text-gray-500 ${
                          sendOptions === value ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-50'
                        }`}
                      >
                        {value === 'sendNow' && (
                          <div className="max-w-[25rem] rounded-lg bg-gray-50 p-4 text-center">
                            <p className="mb-4">Your message will be sent immediately to all selected recipients.</p>
                          </div>
                        )}
                        {value === 'sendLater' && (
                          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  id="date"
                                  value={scheduledDate}
                                  onChange={(e) => setScheduledDate(e.target.value)}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div className="flex-1">
                                <label htmlFor="time" className="mb-1 block text-sm font-medium text-gray-700">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  id="time"
                                  value={scheduledTime}
                                  onChange={(e) => setScheduledTime(e.target.value)}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSend}
                              className="w-full rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
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
