import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiX } from "react-icons/hi";

export default function MiddlePopUp({
  children,
  show,
  onClose,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
}) {
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={(e) => closeModalNothing(e)}
      >
        <div className="fixed inset-0 flex items-center justify-center px-6 bg-black backdrop-blur-sm bg-opacity-70">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="relative w-full max-w-md shadow-md bg-base-100 rounded-[1.5rem] ">
              {children}
              <div onClick={onClose} className="flex justify-center mb-4">
                <button className="mx-6 on_active_bounce z-50 bg-primary rounded-full w-[90vw] font-[600] py-[1rem] text-base-100 text-[18px] leading-[1.15rem]">
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
