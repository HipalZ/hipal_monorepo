import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";

export default function ExtraModal({
  children,
  show,
  onClose,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <div className="fixed inset-0 flex items-end justify-end bg-black bg-opacity-50">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-200 transform"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-in duration-150 transform"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="relative bg-white rounded-l-2xl w-[80%] max-w-md h-[90%] shadow-md">
                <div className="absolute left-0 right-0 flex justify-center bottom-6">
                  <div
                    className="w-10 h-10 rounded-full on_active_bounce"
                    onClick={onClose}
                  >
                    <RxCross2 className="text-3xl ml-1 text-[#50A466]" />
                  </div>
                </div>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
